require('dotenv').config();

const fs = require('fs/promises');
const path = require('path');
const { Client } = require('pg');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const BACKUP_DIR = path.join(ROOT_DIR, 'backups');
const CACHE_PATH = path.join(DATA_DIR, 'museum-enrichment-cache.json');
const REPORT_PATH = path.join(DATA_DIR, 'museum-enrichment-report.json');
const OFFICIAL_LIST_URL = 'https://museum.kemenbud.go.id/museum';
const USER_AGENT = 'MuseumNesia enrichment script (local student project)';

const args = process.argv.slice(2);
const SHOULD_APPLY = args.includes('--apply');
const FORCE = args.includes('--force');
const REFRESH_OFFICIAL_PROFILES = args.includes('--refresh-official-profiles');
const LIMIT_ARG = args.find((arg) => arg.startsWith('--limit='));
const PARSED_LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1], 10) : null;
const LIMIT = Number.isFinite(PARSED_LIMIT) && PARSED_LIMIT > 0 ? PARSED_LIMIT : null;

const client = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const fixEncodingArtifacts = (value) => String(value || '')
  .replace(/\u00c2\u00b1/g, '+/-')
  .replace(/\u00c2\u00a0/g, ' ')
  .replace(/\u00c2/g, '')
  .replace(/\u00e2\u0080\u009c|\u00e2\u0080\u009d/g, '"')
  .replace(/\u00e2\u0080\u0098|\u00e2\u0080\u0099/g, "'")
  .replace(/\u00e2\u0080\u0093|\u00e2\u0080\u0094/g, '-');

const emptyToNull = (value) => {
  if (value === undefined || value === null) return null;
  let text = fixEncodingArtifacts(value).replace(/\s+/g, ' ').trim();
  if (text !== '-') text = text.replace(/^[-\s]+(?=[A-Za-z0-9])/g, '').trim();
  const quoted = text.match(/^"(.+)"$/);
  if (quoted) text = quoted[1].trim();
  return text.length > 0 ? text : null;
};

const fallbackDash = (value) => emptyToNull(value) || '-';

const decodeHtml = (value) => String(value || '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#039;/g, "'")
  .replace(/&apos;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
  .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));

const stripTags = (html) => decodeHtml(String(html || '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

const htmlToLines = (html) => {
  const withoutNoise = String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ');
  const withBreaks = withoutNoise
    .replace(/<(br|hr)\b[^>]*>/gi, '\n')
    .replace(/<\/(p|div|li|tr|td|th|h1|h2|h3|h4|h5|h6|section|article|main|header|footer)>/gi, '\n')
    .replace(/<(p|div|li|tr|td|th|h1|h2|h3|h4|h5|h6|section|article|main|header|footer)\b[^>]*>/gi, '\n');

  return fixEncodingArtifacts(decodeHtml(withBreaks.replace(/<[^>]*>/g, ' ')))
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
};

const normalize = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/&/g, ' dan ')
  .replace(/\b(g\.)\b/g, 'gunung')
  .replace(/\b(jl|jln|jalan)\b/g, 'jalan')
  .replace(/[^a-z0-9]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const STOP_WORDS = new Set([
  'museum', 'musem', 'upt', 'uptd', 'unit', 'pelaksana', 'teknis', 'negeri',
  'provinsi', 'propinsi', 'prov', 'daerah', 'kabupaten', 'kota', 'umum',
  'khusus', 'indonesia', 'ri', 'republik', 'dan', 'the',
]);

const tokens = (value) => normalize(value)
  .split(' ')
  .filter((token) => token.length > 1 && !STOP_WORDS.has(token));

const levenshteinRatio = (a, b) => {
  const left = normalize(a);
  const right = normalize(b);
  if (!left && !right) return 1;
  if (!left || !right) return 0;

  const rows = Array.from({ length: left.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= right.length; j += 1) rows[0][j] = j;

  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      rows[i][j] = Math.min(
        rows[i - 1][j] + 1,
        rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + cost
      );
    }
  }

  const distance = rows[left.length][right.length];
  return 1 - distance / Math.max(left.length, right.length);
};

const tokenDice = (a, b) => {
  const left = new Set(tokens(a));
  const right = new Set(tokens(b));
  if (left.size === 0 || right.size === 0) return 0;

  let intersection = 0;
  left.forEach((token) => {
    if (right.has(token)) intersection += 1;
  });

  return (2 * intersection) / (left.size + right.size);
};

const provinceMatches = (dbProvince, candidateText) => {
  if (!dbProvince || !candidateText) return false;
  const province = normalize(dbProvince).replace(/^prov /, '');
  const candidate = normalize(candidateText);
  return candidate.includes(province) || province.includes(candidate);
};

const candidateScore = (museum, candidate) => {
  const dbName = museum.nama_museum;
  const candidateName = candidate.name || candidate.listName;
  const nameScore = Math.max(tokenDice(dbName, candidateName), levenshteinRatio(dbName, candidateName));
  const normalizedDb = normalize(dbName);
  const normalizedCandidate = normalize(candidateName);
  const containsBonus = normalizedDb.includes(normalizedCandidate) || normalizedCandidate.includes(normalizedDb) ? 0.08 : 0;
  const provinceBonus = provinceMatches(museum.nama_provinsi, candidate.location || candidate.address || candidate.listAddress) ? 0.08 : 0;
  const regencyBonus = museum.nama_kabupaten && normalize(candidate.location || candidate.address || candidate.listAddress).includes(normalize(museum.nama_kabupaten).replace(/^kota |^kabupaten /, '')) ? 0.04 : 0;
  return Math.min(1, nameScore + containsBonus + provinceBonus + regencyBonus);
};

const fetchText = async (url, cache, key = url, retries = 2) => {
  if (cache.pages[key]) return cache.pages[key];

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/json;q=0.9,*/*;q=0.8' },
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const text = await response.text();
      cache.pages[key] = text;
      return text;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }

  throw lastError;
};

const fetchJson = async (url, cache, key = url) => {
  const text = await fetchText(url, cache, key);
  return JSON.parse(text);
};

const toAbsoluteUrl = (url) => {
  if (!url) return null;
  const decoded = decodeHtml(url);
  if (decoded.startsWith('http://') || decoded.startsWith('https://')) return decoded;
  return new URL(decoded, 'https://museum.kemenbud.go.id').toString();
};

const parseListPage = (html) => {
  const matches = [];
  const profileRegex = /<a\b[^>]*href=["']([^"']*\/museum\/profile\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = profileRegex.exec(html)) !== null) {
    matches.push({
      index: match.index,
      end: profileRegex.lastIndex,
      url: toAbsoluteUrl(match[1]),
      name: stripTags(match[2]),
    });
  }

  return matches.map((item, index) => {
    const next = matches[index + 1];
    const segment = html.slice(item.end, next ? next.index : html.length);
    const lines = htmlToLines(segment)
      .filter((line) => !/^image\b/i.test(line))
      .filter((line) => !/^(testimoni|nama|email|penyajian informasi|kemudahan pengguna|performa sistem|batal kirim testimoni)$/i.test(line))
      .filter((line) => !/^[0-9]+$|^...$|^[<>‹›]+$/.test(line));
    const address = emptyToNull(lines[0]);
    const description = emptyToNull(lines.slice(1).join(' '));

    return {
      url: item.url,
      listName: item.name,
      listAddress: address,
      listDescription: description,
    };
  }).filter((item) => item.url && item.listName);
};

const scrapeOfficialList = async (cache) => {
  if (cache.officialRecords && cache.officialRecords.length > 0) return cache.officialRecords;

  const byUrl = new Map();
  for (let page = 1; page <= 90; page += 1) {
    const url = page === 1 ? OFFICIAL_LIST_URL : `${OFFICIAL_LIST_URL}?page=${page}`;
    const html = await fetchText(url, cache, `official-list-${page}`);
    const records = parseListPage(html);

    records.forEach((record) => {
      if (!byUrl.has(record.url)) byUrl.set(record.url, record);
    });

    process.stdout.write(`\rScraped official list page ${page}, records: ${byUrl.size}`);
    if (records.length === 0) break;
  }
  process.stdout.write('\n');

  cache.officialRecords = Array.from(byUrl.values());
  return cache.officialRecords;
};

const firstH1 = (html) => {
  const h1s = Array.from(String(html || '').matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi))
    .map((match) => stripTags(match[1]))
    .filter(Boolean);
  return h1s.find((item) => !/^(nomor pendaftaran|jenis museum|tipe museum|pemilik|pengelola)$/i.test(item)) || h1s[0] || null;
};

const sectionAfter = (lines, title, stopTitles) => {
  const start = lines.findIndex((line) => normalize(line) === normalize(title));
  if (start === -1) return null;
  const stop = lines.findIndex((line, index) => index > start && stopTitles.some((stopTitle) => normalize(line) === normalize(stopTitle)));
  const section = lines.slice(start + 1, stop === -1 ? lines.length : stop)
    .filter((line) => !/^lihat semua$/i.test(line))
    .filter((line) => !/^\d+\s+koleksi$/i.test(line));
  return emptyToNull(section.join(' '));
};

const extractImageUrl = (html) => {
  const imgRegex = /<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi;
  const ignored = ['logo', 'icon', 'user', 'star', 'no_image', 'landingpage', '.svg'];
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    const url = toAbsoluteUrl(match[1]);
    const raw = decodeHtml(match[0]).toLowerCase();
    if (!url) continue;
    if (ignored.some((word) => raw.includes(word) || url.toLowerCase().includes(word))) continue;
    return url;
  }

  return null;
};

const parseYear = (...values) => {
  const text = values.filter(Boolean).join(' ');
  const sentences = text.split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter(Boolean);

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    const hasRelevantPhrase = /(didirikan|dibangun|diresmikan|dibuka|berdiri|mulai didirikan|mulai dibangun|pendirian museum)/i.test(sentence);
    if (!hasRelevantPhrase) continue;
    if (/didirikan untuk/.test(lower) && !/didirikan\s+(pada|sejak|tahun|tanggal|bulan)/.test(lower)) continue;

    const years = Array.from(sentence.matchAll(/\b(1[6-9]\d{2}|20[0-2]\d)\b/g)).map((match) => parseInt(match[1], 10));
    if (years.length > 0) return years[0];
  }

  return null;
};

const parseSchedule = (value) => {
  const text = emptyToNull(value);
  if (!text) return { openingHours: null, ticketPrice: null };

  const dayPattern = /(Senin|Selasa|Rabu|Kamis|Jumat|Sabtu|Minggu|Tanggal Merah|Hari Libur Nasional|Hari Besar Nasional)/i;
  const lines = text
    .split(/(?=(?:Senin|Selasa|Rabu|Kamis|Jumat|Sabtu|Minggu|Tanggal Merah|Hari Libur Nasional|Hari Besar Nasional)\b)/i)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => dayPattern.test(line));

  const prices = new Set();
  const openingParts = [];

  lines.forEach((line) => {
    const foundPrices = line.match(/Rp\.?\s*[0-9.]+/gi) || [];
    foundPrices.forEach((price) => {
      const amount = price.match(/[0-9][0-9.]*/);
      if (amount) prices.add(`Rp. ${amount[0]}`);
    });
    const cleanLine = line
      .replace(/Rp\.?\s*[0-9.]+/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (cleanLine) openingParts.push(cleanLine);
  });

  const priceValues = Array.from(prices)
    .map((price) => ({ label: price, value: parseInt(price.replace(/\D/g, ''), 10) || 0 }));
  const paidPrices = priceValues.filter((item) => item.value > 0);
  let ticketPrice = null;
  if (paidPrices.length === 1) ticketPrice = paidPrices[0].label;
  if (paidPrices.length > 1) {
    const sorted = paidPrices.sort((a, b) => a.value - b.value);
    ticketPrice = `${sorted[0].label} - ${sorted[sorted.length - 1].label}`;
  }
  if (!ticketPrice && priceValues.length > 0) ticketPrice = 'Gratis';

  return {
    openingHours: emptyToNull(openingParts.join('; ')),
    ticketPrice,
  };
};

const scrapeOfficialProfiles = async (records, cache) => {
  const detailed = [];
  const stopTitles = ['Koleksi Museum', 'Visi', 'Misi', 'Lokasi Museum', 'Jadwal Kunjungan', 'Testimoni'];

  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    const html = await fetchText(record.url, cache, `official-profile-${record.url}`);
    const lines = htmlToLines(html);
    const history = sectionAfter(lines, 'Sejarah', stopTitles);
    const location = sectionAfter(lines, 'Lokasi Museum', ['Jadwal Kunjungan', 'Testimoni']);
    const visitSchedule = sectionAfter(lines, 'Jadwal Kunjungan', ['Testimoni']);
    const parsedSchedule = parseSchedule(visitSchedule);

    detailed.push({
      ...record,
      name: firstH1(html) || record.listName,
      address: record.listAddress || location,
      description: history || record.listDescription,
      location,
      openingHours: parsedSchedule.openingHours,
      ticketPrice: parsedSchedule.ticketPrice,
      yearBuilt: parseYear(history, record.listDescription),
      imageUrl: extractImageUrl(html),
      sourceUrl: record.url,
    });

    if ((index + 1) % 10 === 0 || index + 1 === records.length) {
      console.log(`Scraped official profile ${index + 1}/${records.length}`);
    }
  }

  return detailed;
};

const sourceIdToOsmUrl = (sourceId) => {
  const match = String(sourceId || '').match(/^(node|way|relation)\/(\d+)$/);
  if (!match) return null;
  return `https://api.openstreetmap.org/api/0.6/${match[1]}/${match[2]}.json`;
};

const buildOsmAddress = (tags = {}) => {
  const pieces = [
    tags['addr:street'] && tags['addr:housenumber'] ? `${tags['addr:street']} No. ${tags['addr:housenumber']}` : tags['addr:street'],
    tags['addr:subdistrict'] || tags['addr:village'] || tags['addr:neighbourhood'],
    tags['addr:district'] || tags['addr:city'],
    tags['addr:county'],
    tags['addr:province'] || tags['is_in:state'],
    tags['addr:postcode'],
  ].filter(Boolean);

  return emptyToNull(tags['addr:full'] || tags.address || pieces.join(', '));
};

const cleanUrl = (value) => {
  const text = emptyToNull(value);
  if (!text || text === '-') return null;
  if (text.startsWith('http://') || text.startsWith('https://')) return text;
  if (/^[a-z0-9.-]+\.[a-z]{2,}/i.test(text)) return `https://${text}`;
  return null;
};

const osmTagValue = (tags, names) => names.map((name) => tags[name]).find((value) => emptyToNull(value));

const fetchOsmData = async (museum, cache) => {
  const url = sourceIdToOsmUrl(museum.source_id);
  if (!url) return null;

  try {
    const json = await fetchJson(url, cache, `osm-${museum.source_id}`);
    const element = json.elements && json.elements[0];
    if (!element || !element.tags) return null;

    const tags = element.tags;
    const website = cleanUrl(osmTagValue(tags, ['website', 'contact:website', 'url']));
    const fee = emptyToNull(tags.fee);
    const charge = emptyToNull(tags.charge);

    let ticketPrice = null;
    if (charge) ticketPrice = charge;
    else if (fee === 'no') ticketPrice = 'Gratis';
    else if (fee === 'yes') ticketPrice = 'Berbayar';

    const image = cleanUrl(osmTagValue(tags, ['image', 'wikimedia_commons']));

    return {
      sourceUrl: `https://www.openstreetmap.org/${museum.source_id}`,
      description: osmTagValue(tags, ['description:id', 'description']),
      address: buildOsmAddress(tags),
      openingHours: osmTagValue(tags, ['opening_hours']),
      ticketPrice,
      website,
      imageUrl: image,
      wikidata: emptyToNull(tags.wikidata),
      wikipedia: emptyToNull(tags.wikipedia),
      yearBuilt: parseYear(tags.start_date, tags.description),
    };
  } catch {
    return null;
  }
};

const commonsImageUrl = (fileName) => {
  const normalizedFileName = emptyToNull(fileName);
  if (!normalizedFileName) return null;
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(normalizedFileName.replace(/^File:/i, ''))}`;
};

const getClaimValue = (entity, property) => {
  const claim = entity.claims && entity.claims[property] && entity.claims[property][0];
  if (!claim || !claim.mainsnak || !claim.mainsnak.datavalue) return null;
  return claim.mainsnak.datavalue.value;
};

const wikidataYear = (entity) => {
  const value = getClaimValue(entity, 'P571') || getClaimValue(entity, 'P1619');
  if (!value || !value.time) return null;
  const match = value.time.match(/[+-](\d{4})/);
  return match ? parseInt(match[1], 10) : null;
};

const fetchWikipediaSummary = async (titleWithLang, cache) => {
  const text = emptyToNull(titleWithLang);
  if (!text) return null;

  let lang = 'id';
  let title = text;
  const tagged = text.match(/^([a-z-]+):(.+)$/i);
  if (tagged) {
    lang = tagged[1].toLowerCase();
    title = tagged[2];
  }

  try {
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`;
    const json = await fetchJson(url, cache, `wikipedia-summary-${lang}-${title}`);
    return {
      sourceUrl: json.content_urls && json.content_urls.desktop && json.content_urls.desktop.page,
      description: emptyToNull(json.extract),
      imageUrl: json.originalimage && cleanUrl(json.originalimage.source),
    };
  } catch {
    return null;
  }
};

const fetchWikidataData = async (wikidataId, cache) => {
  const id = emptyToNull(wikidataId);
  if (!id || !/^Q\d+$/.test(id)) return null;

  try {
    const json = await fetchJson(`https://www.wikidata.org/wiki/Special:EntityData/${id}.json`, cache, `wikidata-${id}`);
    const entity = json.entities && json.entities[id];
    if (!entity) return null;

    const websiteClaim = getClaimValue(entity, 'P856');
    const imageClaim = getClaimValue(entity, 'P18');
    const sitelinks = entity.sitelinks || {};
    const wikipediaTitle = sitelinks.idwiki ? `id:${sitelinks.idwiki.title}` : (sitelinks.enwiki ? `en:${sitelinks.enwiki.title}` : null);
    const summary = wikipediaTitle ? await fetchWikipediaSummary(wikipediaTitle, cache) : null;

    return {
      sourceUrl: `https://www.wikidata.org/wiki/${id}`,
      description: summary && summary.description ? summary.description : (entity.descriptions && entity.descriptions.id && entity.descriptions.id.value),
      website: cleanUrl(websiteClaim),
      imageUrl: summary && summary.imageUrl ? summary.imageUrl : commonsImageUrl(imageClaim),
      yearBuilt: wikidataYear(entity),
      wikipediaSourceUrl: summary && summary.sourceUrl,
    };
  } catch {
    return null;
  }
};

const searchWikipediaByName = async (museum, cache) => {
  const query = `${museum.nama_museum} ${museum.nama_provinsi || ''}`.trim();
  try {
    const url = `https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&utf8=1&srlimit=1&origin=*`;
    const json = await fetchJson(url, cache, `wikipedia-search-${query}`);
    const first = json.query && json.query.search && json.query.search[0];
    if (!first) return null;
    const score = Math.max(tokenDice(museum.nama_museum, first.title), levenshteinRatio(museum.nama_museum, first.title));
    if (score < 0.78) return null;
    return fetchWikipediaSummary(`id:${first.title}`, cache);
  } catch {
    return null;
  }
};

const bestOfficialMatch = (museum, officialRecords) => {
  let best = null;
  let bestScore = 0;

  for (const candidate of officialRecords) {
    const score = candidateScore(museum, candidate);
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  if (!best || bestScore < 0.72) return null;
  return { ...best, matchScore: bestScore };
};

const choose = (...values) => {
  for (const value of values) {
    const text = emptyToNull(value);
    if (text && text !== '-') return text;
  }
  return null;
};

const buildEnrichment = async (museum, officialRecords, cache) => {
  const official = bestOfficialMatch(museum, officialRecords);
  const osm = await fetchOsmData(museum, cache);
  const wikidata = osm && osm.wikidata ? await fetchWikidataData(osm.wikidata, cache) : null;
  const wikiFromOsm = osm && osm.wikipedia ? await fetchWikipediaSummary(osm.wikipedia, cache) : null;
  const wikiSearch = !wikidata && !wikiFromOsm ? await searchWikipediaByName(museum, cache) : null;

  const sources = [];
  const addSource = (source) => {
    if (source && !sources.includes(source)) sources.push(source);
  };
  if (official) addSource(`Kemenbud SRN Museum: ${official.sourceUrl}`);
  if (osm) addSource(`OpenStreetMap: ${osm.sourceUrl}`);
  if (wikidata) addSource(`Wikidata: ${wikidata.sourceUrl}`);
  if (wikidata && wikidata.wikipediaSourceUrl) addSource(`Wikipedia: ${wikidata.wikipediaSourceUrl}`);
  if (wikiFromOsm && wikiFromOsm.sourceUrl) addSource(`Wikipedia: ${wikiFromOsm.sourceUrl}`);
  if (wikiSearch && wikiSearch.sourceUrl) addSource(`Wikipedia: ${wikiSearch.sourceUrl}`);

  return {
    id: museum.id,
    nama_museum: museum.nama_museum,
    match: official ? {
      source: 'Kemenbud SRN Museum',
      score: Number(official.matchScore.toFixed(3)),
      name: official.name,
      url: official.sourceUrl,
    } : null,
    data: {
      deskripsi: fallbackDash(choose(official && official.description, wikiFromOsm && wikiFromOsm.description, wikidata && wikidata.description, wikiSearch && wikiSearch.description, osm && osm.description)),
      tahun_dibangun: official && official.yearBuilt ? official.yearBuilt : (osm && osm.yearBuilt) || (wikidata && wikidata.yearBuilt) || parseYear(wikiFromOsm && wikiFromOsm.description, wikiSearch && wikiSearch.description),
      alamat_lengkap: fallbackDash(choose(official && official.address, osm && osm.address)),
      jam_buka: fallbackDash(choose(official && official.openingHours, osm && osm.openingHours)),
      harga_tiket: fallbackDash(choose(official && official.ticketPrice, osm && osm.ticketPrice)),
      website: choose(osm && osm.website, wikidata && wikidata.website),
      sumber_informasi: fallbackDash(sources.join(' | ')),
      foto_url: choose(official && official.imageUrl, osm && osm.imageUrl, wikiFromOsm && wikiFromOsm.imageUrl, wikidata && wikidata.imageUrl, wikiSearch && wikiSearch.imageUrl),
    },
  };
};

const loadCache = async () => {
  try {
    const raw = await fs.readFile(CACHE_PATH, 'utf8');
    const cache = JSON.parse(raw);
    cache.pages = cache.pages || {};
    return cache;
  } catch {
    return { pages: {} };
  }
};

const saveCache = async (cache) => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2));
};

const backupCurrentRows = async (rows) => {
  await fs.mkdir(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `museum-detail-backup-${stamp}.json`);
  await fs.writeFile(backupPath, JSON.stringify(rows, null, 2));
  return backupPath;
};

const updateMuseum = async (id, data) => {
  await client.query(`
    UPDATE museum
    SET deskripsi = $1,
        tahun_dibangun = $2,
        alamat_lengkap = $3,
        jam_buka = $4,
        harga_tiket = $5,
        website = $6,
        sumber_informasi = $7,
        foto_url = $8
    WHERE id = $9
  `, [
    data.deskripsi,
    data.tahun_dibangun || null,
    data.alamat_lengkap,
    data.jam_buka,
    data.harga_tiket,
    data.website || null,
    data.sumber_informasi,
    data.foto_url || null,
    id,
  ]);
};

const main = async () => {
  const cache = await loadCache();
  if (REFRESH_OFFICIAL_PROFILES) cache.officialDetailedRecords = [];
  await client.connect();

  const where = FORCE
    ? ''
    : `WHERE COALESCE(
        NULLIF(m.deskripsi, ''), NULLIF(m.alamat_lengkap, ''), NULLIF(m.jam_buka, ''),
        NULLIF(m.harga_tiket, ''), NULLIF(m.website, ''), NULLIF(m.sumber_informasi, ''), NULLIF(m.foto_url, '')
      ) IS NULL AND m.tahun_dibangun IS NULL`;
  const limitSql = LIMIT ? `LIMIT ${LIMIT}` : '';
  const museumResult = await client.query(`
    SELECT m.id, m.source_id, m.nama_museum, m.latitude, m.longitude,
           p.nama_provinsi, k.nama_kabupaten, kt.nama_kategori,
           m.deskripsi, m.tahun_dibangun, m.alamat_lengkap, m.jam_buka,
           m.harga_tiket, m.website, m.sumber_informasi, m.foto_url
    FROM museum m
    LEFT JOIN provinsi p ON m.provinsi_id = p.id
    LEFT JOIN kabupaten k ON m.kabupaten_id = k.id
    LEFT JOIN kategori kt ON m.kategori_id = kt.id
    ${where}
    ORDER BY m.id
    ${limitSql}
  `);

  const museums = museumResult.rows;
  const officialList = await scrapeOfficialList(cache);
  await saveCache(cache);

  const targetOfficialUrls = new Set();
  museums.forEach((museum) => {
    const listMatch = bestOfficialMatch(museum, officialList);
    if (listMatch && listMatch.url) targetOfficialUrls.add(listMatch.url);
  });

  const cachedDetailed = Array.isArray(cache.officialDetailedRecords) ? cache.officialDetailedRecords : [];
  const detailedByUrl = new Map(cachedDetailed.map((record) => [record.sourceUrl || record.url, record]));
  const profilesToFetch = officialList.filter((record) => targetOfficialUrls.has(record.url) && !detailedByUrl.has(record.url));
  const fetchedDetailed = profilesToFetch.length > 0 ? await scrapeOfficialProfiles(profilesToFetch, cache) : [];
  fetchedDetailed.forEach((record) => detailedByUrl.set(record.sourceUrl, record));

  cache.officialDetailedRecords = Array.from(detailedByUrl.values());
  await saveCache(cache);

  const officialDetailed = cache.officialDetailedRecords.filter((record) => targetOfficialUrls.has(record.sourceUrl || record.url));
  const backupPath = SHOULD_APPLY ? await backupCurrentRows(museums) : null;
  const enrichments = [];

  for (let index = 0; index < museums.length; index += 1) {
    const museum = museums[index];
    const enrichment = await buildEnrichment(museum, officialDetailed, cache);
    enrichments.push(enrichment);
    if (SHOULD_APPLY) await updateMuseum(enrichment.id, enrichment.data);
    if (index % 10 === 0) await saveCache(cache);
    process.stdout.write(`\rEnriched ${index + 1}/${museums.length}: ${museum.nama_museum}`);
  }
  process.stdout.write('\n');

  const stats = {
    database: process.env.DB_NAME,
    mode: SHOULD_APPLY ? 'applied' : 'dry-run',
    force: FORCE,
    totalTargetRows: museums.length,
    officialListRecords: officialList.length,
    officialProfileRecords: officialDetailed.length,
    officialMatchedRows: enrichments.filter((item) => item.match).length,
    rowsWithDescription: enrichments.filter((item) => item.data.deskripsi && item.data.deskripsi !== '-').length,
    rowsWithOpeningHours: enrichments.filter((item) => item.data.jam_buka && item.data.jam_buka !== '-').length,
    rowsWithTicketPrice: enrichments.filter((item) => item.data.harga_tiket && item.data.harga_tiket !== '-').length,
    rowsWithWebsite: enrichments.filter((item) => item.data.website).length,
    rowsWithImage: enrichments.filter((item) => item.data.foto_url).length,
    backupPath,
  };

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(REPORT_PATH, JSON.stringify({ stats, enrichments }, null, 2));
  await saveCache(cache);
  await client.end();

  console.log(JSON.stringify(stats, null, 2));
  console.log(`Report written to ${REPORT_PATH}`);
  if (!SHOULD_APPLY) console.log('Dry-run only. Run again with --apply to update the database.');
};

main().catch(async (error) => {
  try {
    await client.end();
  } catch {
    // ignore close errors
  }
  console.error(error);
  process.exit(1);
});
