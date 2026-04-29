const museumService = require('./museumService');
const { query } = require('../config/db');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const CHAT_CONTEXT_LIMIT = 15;

const APP_CONTEXT = `
About the application / Tentang aplikasi:
- The public product name is MuseumNesia / MuseumApp.
- The app helps global and Indonesian users discover, map, and learn about museums in Indonesia.
- Public features: Home page, museum map, museum name search, province filter, regency/city filter, category filter, nearby museum radius, museum detail page, and virtual guide chatbot.
- Museum data you may answer from when available: name, category, province, regency/city, address, opening hours, ticket price, year built, description, website, and information source.
- The chatbot does not directly access the user's GPS location. For "nearby museum" questions, guide users to the Nearby Museum/radius feature on the Map page.
`.trim();

const PAGE_CONTEXTS = [
  {
    match: (path) => path === '/',
    context:
      'The user is on the Home page. This page is suitable for general explanations, first recommendations, museum categories, museum benefits, and inviting the user to open the map.',
  },
  {
    match: (path) => path.startsWith('/map'),
    context:
      'The user is on the Map page. Here the user can search museums, choose province, regency/city, category, nearby radius, and open museum detail from a marker/popup.',
  },
  {
    match: (path) => path.startsWith('/museum/'),
    context:
      'The user is on a museum detail page. Prioritize answers about the currently opened museum if museum context is available.',
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
  'about',
  'available',
  'can',
  'category',
  'categories',
  'city',
  'find',
  'for',
  'from',
  'how',
  'indonesia',
  'museum',
  'museums',
  'near',
  'nearby',
  'please',
  'show',
  'the',
  'there',
  'what',
  'where',
  'which',
  'with',
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
    `Category EN: ${trimText(museum.nama_kategori_en, 120)}`,
    `Lokasi: ${trimText([museum.nama_kabupaten, museum.nama_provinsi].filter(Boolean).join(', '), 180)}`,
    `Location EN: ${trimText([museum.nama_kabupaten_en, museum.nama_provinsi_en].filter(Boolean).join(', '), 180)}`,
    `Alamat: ${trimText(museum.alamat_lengkap, 240)}`,
    `Address EN: ${trimText(museum.alamat_lengkap_en, 240)}`,
    `Jam buka: ${trimText(museum.jam_buka, 180)}`,
    `Opening hours EN: ${trimText(museum.jam_buka_en, 180)}`,
    `Harga tiket: ${trimText(museum.harga_tiket, 180)}`,
    `Tahun dibangun: ${trimText(museum.tahun_dibangun, 80)}`,
    `Deskripsi: ${trimText(museum.deskripsi)}`,
    `Description EN: ${trimText(museum.deskripsi_en)}`,
  ].join('\n');
};

const getPageContext = (pagePath = '/') => {
  const matchedPage = PAGE_CONTEXTS.find((page) => page.match(pagePath));
    return matchedPage?.context || 'The user is on a public MuseumNesia page.';
};

const getAvailableFiltersContext = async () => {
  const [categoryResult, provinceResult] = await Promise.all([
    query(
      `
        SELECT kt.nama_kategori, kt.nama_kategori_en, COUNT(m.id)::int AS total_museum
        FROM kategori kt
        LEFT JOIN museum m ON m.kategori_id = kt.id
        GROUP BY kt.id, kt.nama_kategori, kt.nama_kategori_en
        ORDER BY kt.nama_kategori ASC
      `
    ),
    query(
      `
        SELECT p.nama_provinsi, p.nama_provinsi_en, COUNT(m.id)::int AS total_museum
        FROM provinsi p
        LEFT JOIN museum m ON m.provinsi_id = p.id
        GROUP BY p.id, p.nama_provinsi, p.nama_provinsi_en
        HAVING COUNT(m.id) > 0
        ORDER BY total_museum DESC, p.nama_provinsi ASC
        LIMIT 12
      `
    ),
  ]);

  const categories = categoryResult.rows
    .map((category) => {
      const englishName = category.nama_kategori_en ? ` / ${category.nama_kategori_en}` : '';
      return `${category.nama_kategori}${englishName} (${category.total_museum})`;
    })
    .join(', ');
  const provinces = provinceResult.rows
    .map((province) => {
      const englishName = province.nama_provinsi_en ? ` / ${province.nama_provinsi_en}` : '';
      return `${province.nama_provinsi}${englishName} (${province.total_museum})`;
    })
    .join(', ');

  return [
    categories ? `Available categories / Kategori tersedia: ${categories}` : '',
    provinces ? `Provinces with the most museum data / Provinsi dengan data museum terbanyak: ${provinces}` : '',
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
      m.deskripsi_en,
      m.tahun_dibangun,
      m.alamat_lengkap,
      m.alamat_lengkap_en,
      m.jam_buka,
      m.jam_buka_en,
      m.harga_tiket,
      m.website,
      m.sumber_informasi,
      m.foto_url,
      m.provinsi_id,
      p.nama_provinsi,
      p.nama_provinsi_en,
      m.kabupaten_id,
      k.nama_kabupaten,
      k.nama_kabupaten_en,
      m.kategori_id,
      kt.nama_kategori,
      kt.nama_kategori_en,
      COUNT(*) AS relevance_score
    FROM museum m
    LEFT JOIN provinsi p ON m.provinsi_id = p.id
    LEFT JOIN kabupaten k ON m.kabupaten_id = k.id
    LEFT JOIN kategori kt ON m.kategori_id = kt.id
    CROSS JOIN search_terms st
    WHERE
      LOWER(COALESCE(m.nama_museum, '')) LIKE '%' || st.term || '%'
      OR LOWER(COALESCE(k.nama_kabupaten, '')) LIKE '%' || st.term || '%'
      OR LOWER(COALESCE(k.nama_kabupaten_en, '')) LIKE '%' || st.term || '%'
      OR LOWER(COALESCE(p.nama_provinsi, '')) LIKE '%' || st.term || '%'
      OR LOWER(COALESCE(p.nama_provinsi_en, '')) LIKE '%' || st.term || '%'
      OR LOWER(COALESCE(kt.nama_kategori, '')) LIKE '%' || st.term || '%'
      OR LOWER(COALESCE(kt.nama_kategori_en, '')) LIKE '%' || st.term || '%'
      OR LOWER(COALESCE(m.deskripsi, '')) LIKE '%' || st.term || '%'
      OR LOWER(COALESCE(m.deskripsi_en, '')) LIKE '%' || st.term || '%'
    GROUP BY
      m.id,
      p.nama_provinsi,
      p.nama_provinsi_en,
      k.nama_kabupaten,
      k.nama_kabupaten_en,
      kt.nama_kategori,
      kt.nama_kategori_en
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
      ? `Current museum context / Konteks museum yang sedang dibuka user:\n${formatMuseumContext(museum)}`
      : '';
  }

  const relevantMuseums = await searchMuseumsForChat(message);

  if (relevantMuseums.length) {
    const summaries = relevantMuseums
      .map((museum, index) => `${index + 1}. ${formatMuseumContext(museum)}`)
      .join('\n\n');

    return `Museum data relevant to the user's question / Data museum yang relevan dengan pertanyaan user:\n${summaries}`;
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

  return `Sample museum data from the app / Contoh data museum dari aplikasi:\n${summaries}`;
};

const getLanguageInstruction = (language) => {
  if (language === 'en') {
    return `
Preferred interface language: English.
Reply in English by default. If the user writes in Indonesian, you may answer in Indonesian or bilingual English-Indonesian when it helps. Keep Indonesian proper nouns such as museum names, city names, and category names accurate.
`.trim();
  }

  return `
Preferred interface language: Bahasa Indonesia.
Jawab dalam Bahasa Indonesia secara default. Jika user bertanya dalam English, jawab dalam English atau bilingual English-Indonesian bila membantu. Pertahankan nama museum, kota, dan kategori sesuai data.
`.trim();
};

const buildPrompt = ({ message, museumContext, appDataContext, pageContext, language }) => `
You are MuseumNesia / MuseumApp virtual guide, helping global and Indonesian visitors learn about museums in Indonesia.

${APP_CONTEXT}

Language behavior / Perilaku bahasa:
${getLanguageInstruction(language)}
- Match the user's language when it is clear from the question.
- For mixed-language questions, answer naturally in the dominant language.
- Never translate official museum names unless a well-known English equivalent is already obvious from the name.

Page context / Konteks halaman:
${pageContext}

Application data context / Konteks data aplikasi:
${appDataContext || 'Category/province summary is not available yet / Ringkasan kategori/provinsi belum tersedia.'}

Question types you should support / Jenis pertanyaan yang harus bisa dibantu:
- Finding museum lists by city, regency, province, name, or category.
- Explaining museum categories, example museums, and what visitors can learn.
- Answering museum details such as address, opening hours, ticket price, year built, description, website, and source when available.
- Recommending museums based on interest: history, art and culture, science and technology, nature, military, family trips, or educational travel.
- Helping users use the app: map, filters, search, nearby radius, and opening museum detail pages.
- Answering general educational questions about museums while keeping specific data grounded in the application database.

Answer rules / Aturan jawaban:
- Be friendly, clear, educational, and useful for international visitors discovering Indonesian museums.
- Prioritize the museum context and application context provided.
- If specific data is unavailable, say honestly that the information is not yet available in the app.
- Do not invent opening hours, ticket prices, addresses, history, or curatorial facts.
- For museum-list questions in a location/category, answer with museum name, location, and category when available in context.
- For city/province search, use the "Lokasi" field as the main reference. If an address looks inconsistent, do not remove the museum from results; add a short verification note.
- If the user asks how to use the app, give practical steps based on the current page and available features.
- If the user asks for recommendations without location/interest, offer 2-3 natural follow-up options.
- If the question is broad, give a short answer and invite the user to choose a museum or topic.
- Use up to 3 short paragraphs unless the user asks for details.

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

const askGemini = async ({ message, museumId, pagePath = '/', language = 'id' }) => {
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
  const prompt = buildPrompt({ message, museumContext, appDataContext, pageContext, language });

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
