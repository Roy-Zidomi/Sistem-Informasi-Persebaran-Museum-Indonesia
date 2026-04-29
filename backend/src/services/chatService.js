const museumService = require('./museumService');
const { query } = require('../config/db');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const CHAT_CONTEXT_LIMIT = 15;

const APP_CONTEXT = `
Tentang aplikasi:
- Nama aplikasi publik adalah MuseumNesia / MuseumApp.
- Tujuan aplikasi: membantu user menemukan, memetakan, dan mempelajari museum di Indonesia.
- Fitur publik utama: halaman Home, peta museum, pencarian nama museum, filter provinsi, filter kabupaten/kota, filter kategori, radius museum terdekat, halaman detail museum, dan chatbot pemandu.
- Data museum yang dapat dijawab jika tersedia: nama, kategori, provinsi, kabupaten/kota, alamat, jam buka, harga tiket, tahun dibangun, deskripsi, website, dan sumber informasi.
- Chatbot tidak memiliki akses ke lokasi GPS user secara langsung. Untuk pertanyaan "museum terdekat", arahkan user memakai fitur Museum Terdekat/radius di halaman Map.
`.trim();

const PAGE_CONTEXTS = [
  {
    match: (path) => path === '/',
    context:
      'User sedang berada di halaman Home. Halaman ini cocok untuk penjelasan umum, rekomendasi awal, kategori museum, manfaat museum, dan ajakan membuka peta.',
  },
  {
    match: (path) => path.startsWith('/map'),
    context:
      'User sedang berada di halaman Map. Di halaman ini user bisa mencari museum, memilih provinsi, kabupaten/kota, kategori, mengatur radius museum terdekat, dan membuka detail museum dari marker/popup.',
  },
  {
    match: (path) => path.startsWith('/museum/'),
    context:
      'User sedang berada di halaman detail museum. Prioritaskan jawaban tentang museum yang sedang dibuka jika konteks museum tersedia.',
  },
];

const STOP_WORDS = new Set([
  'ada',
  'aja',
  'apa',
  'apakah',
  'bagaimana',
  'berapa',
  'buat',
  'bisa',
  'cari',
  'dan',
  'dari',
  'dengan',
  'di',
  'dong',
  'itu',
  'ini',
  'kak',
  'kategori',
  'kategorinya',
  'ke',
  'mana',
  'museum',
  'museumnya',
  'saja',
  'saya',
  'tentang',
  'tolong',
  'untuk',
  'yang',
]);

const trimText = (value, maxLength = 900) => {
  if (!value) {
    return '-';
  }

  const text = String(value).replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

const formatMuseumContext = (museum) => {
  if (!museum) {
    return '';
  }

  return [
    `Nama: ${trimText(museum.nama_museum, 160)}`,
    `Kategori: ${trimText(museum.nama_kategori, 120)}`,
    `Lokasi: ${trimText([museum.nama_kabupaten, museum.nama_provinsi].filter(Boolean).join(', '), 180)}`,
    `Alamat: ${trimText(museum.alamat_lengkap, 240)}`,
    `Jam buka: ${trimText(museum.jam_buka, 180)}`,
    `Harga tiket: ${trimText(museum.harga_tiket, 180)}`,
    `Tahun dibangun: ${trimText(museum.tahun_dibangun, 80)}`,
    `Deskripsi: ${trimText(museum.deskripsi)}`,
  ].join('\n');
};

const getPageContext = (pagePath = '/') => {
  const matchedPage = PAGE_CONTEXTS.find((page) => page.match(pagePath));
  return matchedPage?.context || 'User sedang berada di halaman publik MuseumNesia.';
};

const getAvailableFiltersContext = async () => {
  const [categoryResult, provinceResult] = await Promise.all([
    query(
      `
        SELECT kt.nama_kategori, COUNT(m.id)::int AS total_museum
        FROM kategori kt
        LEFT JOIN museum m ON m.kategori_id = kt.id
        GROUP BY kt.id, kt.nama_kategori
        ORDER BY kt.nama_kategori ASC
      `
    ),
    query(
      `
        SELECT p.nama_provinsi, COUNT(m.id)::int AS total_museum
        FROM provinsi p
        LEFT JOIN museum m ON m.provinsi_id = p.id
        GROUP BY p.id, p.nama_provinsi
        HAVING COUNT(m.id) > 0
        ORDER BY total_museum DESC, p.nama_provinsi ASC
        LIMIT 12
      `
    ),
  ]);

  const categories = categoryResult.rows
    .map((category) => `${category.nama_kategori} (${category.total_museum})`)
    .join(', ');
  const provinces = provinceResult.rows
    .map((province) => `${province.nama_provinsi} (${province.total_museum})`)
    .join(', ');

  return [
    categories ? `Kategori tersedia: ${categories}` : '',
    provinces ? `Provinsi dengan data museum terbanyak: ${provinces}` : '',
  ]
    .filter(Boolean)
    .join('\n');
};

const extractSearchTerms = (message) => {
  const normalizedMessage = String(message || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalizedMessage) {
    return [];
  }

  const words = normalizedMessage
    .split(' ')
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

  return [...new Set(words)].slice(0, 8);
};

const searchMuseumsForChat = async (message) => {
  const terms = extractSearchTerms(message);

  if (!terms.length) {
    return [];
  }

  const sql = `
    WITH search_terms AS (
      SELECT unnest($1::text[]) AS term
    )
    SELECT
      m.id,
      m.source_id,
      m.nama_museum,
      m.latitude,
      m.longitude,
      m.deskripsi,
      m.tahun_dibangun,
      m.alamat_lengkap,
      m.jam_buka,
      m.harga_tiket,
      m.website,
      m.sumber_informasi,
      m.foto_url,
      m.provinsi_id,
      p.nama_provinsi,
      m.kabupaten_id,
      k.nama_kabupaten,
      m.kategori_id,
      kt.nama_kategori,
      COUNT(*) AS relevance_score
    FROM museum m
    LEFT JOIN provinsi p ON m.provinsi_id = p.id
    LEFT JOIN kabupaten k ON m.kabupaten_id = k.id
    LEFT JOIN kategori kt ON m.kategori_id = kt.id
    CROSS JOIN search_terms st
    WHERE
      LOWER(COALESCE(m.nama_museum, '')) LIKE '%' || st.term || '%'
      OR LOWER(COALESCE(k.nama_kabupaten, '')) LIKE '%' || st.term || '%'
      OR LOWER(COALESCE(p.nama_provinsi, '')) LIKE '%' || st.term || '%'
      OR LOWER(COALESCE(kt.nama_kategori, '')) LIKE '%' || st.term || '%'
      OR LOWER(COALESCE(m.deskripsi, '')) LIKE '%' || st.term || '%'
    GROUP BY
      m.id,
      p.nama_provinsi,
      k.nama_kabupaten,
      kt.nama_kategori
    ORDER BY relevance_score DESC, m.nama_museum ASC
    LIMIT $2
  `;

  const result = await query(sql, [terms, CHAT_CONTEXT_LIMIT]);
  return result.rows;
};

const getMuseumContext = async ({ museumId, message }) => {
  if (museumId) {
    const museum = await museumService.getMuseumById(museumId);
    return museum
      ? `Konteks museum yang sedang dibuka user:\n${formatMuseumContext(museum)}`
      : '';
  }

  const relevantMuseums = await searchMuseumsForChat(message);

  if (relevantMuseums.length) {
    const summaries = relevantMuseums
      .map((museum, index) => `${index + 1}. ${formatMuseumContext(museum)}`)
      .join('\n\n');

    return `Data museum yang relevan dengan pertanyaan user:\n${summaries}`;
  }

  const result = await museumService.getAllMuseums({
    page: 1,
    limit: 8,
    offset: 0,
    sort: 'id',
    order: 'ASC',
  });

  if (!result.data.length) {
    return '';
  }

  const summaries = result.data
    .map((museum, index) => `${index + 1}. ${formatMuseumContext(museum)}`)
    .join('\n\n');

  return `Contoh data museum dari aplikasi:\n${summaries}`;
};

const buildPrompt = ({ message, museumContext, appDataContext, pageContext }) => `
Kamu adalah chatbot pemandu MuseumApp untuk membantu pengunjung belajar tentang museum.

${APP_CONTEXT}

Konteks halaman:
${pageContext}

Konteks data aplikasi:
${appDataContext || 'Ringkasan kategori/provinsi belum tersedia.'}

Jenis pertanyaan yang harus bisa kamu bantu:
- Mencari daftar museum berdasarkan kota, kabupaten, provinsi, nama, atau kategori.
- Menjelaskan kategori museum, contoh museum, dan hal yang bisa dipelajari user.
- Menjawab detail museum seperti alamat, jam buka, harga tiket, tahun dibangun, deskripsi, website, dan sumber jika tersedia.
- Memberi rekomendasi museum berdasarkan minat user, misalnya sejarah, seni budaya, sains teknologi, alam, militer, keluarga, atau wisata edukasi.
- Membantu user memakai aplikasi, misalnya cara pakai peta, filter, pencarian, radius museum terdekat, dan cara membuka detail museum.
- Menjawab pertanyaan edukatif umum tentang museum dengan tetap menjelaskan bahwa data spesifik harus mengikuti database aplikasi.

Aturan jawaban:
- Jawab dalam Bahasa Indonesia yang ramah, jelas, dan edukatif.
- Utamakan informasi dari konteks museum dan konteks aplikasi yang diberikan.
- Jika data spesifik tidak tersedia, katakan dengan jujur bahwa informasi tersebut belum tersedia di aplikasi.
- Jangan mengarang jam buka, harga tiket, alamat, sejarah, atau fakta kuratorial.
- Untuk pertanyaan daftar museum di lokasi/kategori tertentu, jawab dengan nama museum, lokasi, dan kategorinya jika tersedia dalam konteks.
- Untuk pencarian kota/provinsi, gunakan field "Lokasi" sebagai acuan utama. Jika alamat terlihat tidak konsisten, jangan hapus museum dari hasil; cukup beri catatan singkat bahwa detail alamat perlu diverifikasi.
- Jika user bertanya cara menggunakan aplikasi, jawab langkah praktis sesuai halaman dan fitur yang tersedia.
- Jika user bertanya rekomendasi tetapi belum memberi lokasi/minat, berikan 2-3 opsi pertanyaan lanjutan yang natural.
- Jika pertanyaan terlalu umum, berikan penjelasan singkat dan ajak user memilih museum atau topik yang ingin dipelajari.
- Maksimal 3 paragraf pendek, kecuali user meminta detail.

${museumContext || 'Konteks museum spesifik belum tersedia.'}

Pertanyaan user:
${message}
`.trim();

const extractGeminiText = (data) => {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts
    .map((part) => part.text)
    .filter(Boolean)
    .join('\n')
    .trim();
};

const askGemini = async ({ message, museumId, pagePath = '/' }) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY belum diatur di file .env backend');
    error.statusCode = 500;
    throw error;
  }

  if (typeof fetch !== 'function') {
    const error = new Error('Runtime Node.js belum mendukung fetch. Gunakan Node.js 18 atau lebih baru.');
    error.statusCode = 500;
    throw error;
  }

  const [museumContext, appDataContext] = await Promise.all([
    getMuseumContext({ museumId, message }),
    getAvailableFiltersContext(),
  ]);
  const pageContext = getPageContext(pagePath);
  const prompt = buildPrompt({ message, museumContext, appDataContext, pageContext });

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 700,
      },
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data?.error?.message || 'Gagal meminta jawaban dari Gemini');
    error.statusCode = response.status >= 500 ? 502 : 400;
    throw error;
  }

  const answer = extractGeminiText(data);

  if (!answer) {
    const error = new Error('Gemini tidak mengembalikan jawaban');
    error.statusCode = 502;
    throw error;
  }

  return answer;
};

module.exports = {
  askGemini,
};
