require('dotenv').config();

const { pool, query } = require('../src/config/db');

const GEMINI_MODELS = (process.env.GEMINI_TRANSLATION_MODELS || process.env.GEMINI_MODEL || 'gemini-2.5-flash,gemini-2.0-flash')
  .split(',')
  .map((model) => model.trim())
  .filter(Boolean);
const DEFAULT_LIMIT = 10;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeText = (value) => {
  if (value === undefined || value === null) return null;
  const text = String(value).replace(/\s+/g, ' ').trim();
  return text.length ? text : null;
};

const extractTaggedValue = (text, tag) => {
  const match = text.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i'));
  const value = match?.[1]?.trim();
  return value && value.toLowerCase() !== 'null' ? value : null;
};

const parseTaggedResponse = (text) => {
  try {
    const parsedJson = JSON.parse(text.trim());
    return {
      deskripsi_en: parsedJson.deskripsi_en || parsedJson.DESKRIPSI_EN || null,
      jam_buka_en: parsedJson.jam_buka_en || parsedJson.JAM_BUKA_EN || null,
      alamat_lengkap_en: parsedJson.alamat_lengkap_en || parsedJson.ALAMAT_LENGKAP_EN || null,
    };
  } catch {
    // Fall back to tag parsing below.
  }

  return {
    deskripsi_en: extractTaggedValue(text, 'DESKRIPSI_EN'),
    jam_buka_en: extractTaggedValue(text, 'JAM_BUKA_EN'),
    alamat_lengkap_en: extractTaggedValue(text, 'ALAMAT_LENGKAP_EN'),
  };
};

const translateMuseum = async (museum) => {
  const prompt = `
Translate the following Indonesian museum data into clear, natural English for international visitors.

Rules:
- Return only the three XML-like tags shown in the output shape.
- Do not use Markdown.
- Preserve museum names, person names, URLs, and proper nouns.
- Do not invent facts.
- Translate opening hours into natural English, keeping times unchanged.
- Translate address terms only when natural; keep street names and place names accurate.
- If a field is empty, return null for that field.

Input:
{
  "name": ${JSON.stringify(museum.nama_museum)},
  "description": ${JSON.stringify(museum.deskripsi || '')},
  "opening_hours": ${JSON.stringify(museum.jam_buka || '')},
  "full_address": ${JSON.stringify(museum.alamat_lengkap || '')}
}

Output shape:
<DESKRIPSI_EN>translated description or null</DESKRIPSI_EN>
<JAM_BUKA_EN>translated opening hours or null</JAM_BUKA_EN>
<ALAMAT_LENGKAP_EN>translated full address or null</ALAMAT_LENGKAP_EN>
`.trim();

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        maxOutputTokens: 1200,
      },
    }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      lastError = new Error(data?.error?.message || `Gemini request failed with status ${response.status}`);
      continue;
    }

    const text = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join('\n')
      .trim();

    if (!text) {
      lastError = new Error('Gemini returned an empty translation');
      continue;
    }

    if (process.env.DEBUG_TRANSLATION === '1') {
      console.log(`Raw Gemini output from ${model}:\n${text}`);
    }

    const parsed = parseTaggedResponse(text);

    if (!parsed.deskripsi_en && !parsed.jam_buka_en && !parsed.alamat_lengkap_en) {
      lastError = new Error('Gemini output did not include any expected translation tags');
      continue;
    }

    return parsed;
  }

  throw lastError || new Error('All Gemini translation models failed');
};

const getMuseumsToTranslate = async () => {
  const ids = (process.env.MUSEUM_TRANSLATION_IDS || '')
    .split(',')
    .map((id) => parseInt(id.trim(), 10))
    .filter((id) => Number.isInteger(id));

  if (ids.length) {
    const result = await query(
      `
        SELECT id, nama_museum, deskripsi, jam_buka, alamat_lengkap,
               deskripsi_en, jam_buka_en, alamat_lengkap_en
        FROM museum
        WHERE id = ANY($1::int[])
        ORDER BY id ASC
      `,
      [ids]
    );
    return result.rows;
  }

  const limit = parseInt(process.env.MUSEUM_TRANSLATION_LIMIT || DEFAULT_LIMIT, 10);
  const result = await query(
    `
      SELECT id, nama_museum, deskripsi, jam_buka, alamat_lengkap,
             deskripsi_en, jam_buka_en, alamat_lengkap_en
      FROM museum
      WHERE
        (deskripsi IS NOT NULL AND deskripsi <> '' AND (deskripsi_en IS NULL OR deskripsi_en = ''))
        OR (jam_buka IS NOT NULL AND jam_buka <> '' AND (jam_buka_en IS NULL OR jam_buka_en = ''))
        OR (alamat_lengkap IS NOT NULL AND alamat_lengkap <> '' AND (alamat_lengkap_en IS NULL OR alamat_lengkap_en = ''))
      ORDER BY id ASC
      LIMIT $1
    `,
    [Number.isNaN(limit) ? DEFAULT_LIMIT : limit]
  );
  return result.rows;
};

const run = async () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is required in backend/.env');
  }

  const museums = await getMuseumsToTranslate();

  if (!museums.length) {
    console.log('No museums need English translation.');
    return;
  }

  console.log(`Translating ${museums.length} museum record(s)...`);

  for (const museum of museums) {
    const translation = await translateMuseum(museum);

    await query(
      `
        UPDATE museum
        SET
          deskripsi_en = COALESCE($2, deskripsi_en),
          jam_buka_en = COALESCE($3, jam_buka_en),
          alamat_lengkap_en = COALESCE($4, alamat_lengkap_en)
        WHERE id = $1
      `,
      [
        museum.id,
        normalizeText(translation.deskripsi_en),
        normalizeText(translation.jam_buka_en),
        normalizeText(translation.alamat_lengkap_en),
      ]
    );

    console.log(`Translated museum ${museum.id}: ${museum.nama_museum}`);
    await sleep(500);
  }
};

run()
  .catch((error) => {
    console.error('English translation backfill failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => {
    pool.end();
  });
