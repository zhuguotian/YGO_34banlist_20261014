// One-time setup (needs internet, Node 18+):
//  1. Downloads the full TCG card list from the public YGOPRODeck API (one request).
//  2. Writes allcards.json — compact [id, name, frameType, tcgStatus] rows used by the
//     "add a card that isn't in the pool" search. Runs entirely in the browser.
//  3. Fills id/type/frameType for the 150 pool cards in cards.json and downloads their
//     small images into img/<id>.jpg, so the site never hotlinks YGOPRODeck (their API
//     guide asks you to re-host images).
// Usage: npm run setup            (only pool cards still missing data/images)
//        npm run setup -- --force (re-resolve and re-download everything)
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CARDS_FILE = path.join(ROOT, 'cards.json');
const ALL_FILE = path.join(ROOT, 'allcards.json');
const IMG_DIR = path.join(ROOT, 'img');
const API = process.env.YGO_API || 'https://db.ygoprodeck.com/api/v7/cardinfo.php';
const FORCE = process.argv.includes('--force');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const STATUS = { Banned: 'F', Forbidden: 'F', Limited: 'L', 'Semi-Limited': 'S' };

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
async function exists(p) { try { await fs.access(p); return true; } catch { return false; } }

// Fallback for a pool card that isn't in the bulk list (e.g. bulk download failed).
async function lookupOne(name) {
  for (const param of ['name', 'fname']) {
    try {
      const json = await fetchJson(`${API}?${param}=${encodeURIComponent(name)}`);
      const list = json.data || [];
      const hit = list.find((c) => c.name.toLowerCase() === name.toLowerCase()) || (param === 'name' ? list[0] : null);
      if (hit) return hit;
    } catch { /* try next */ }
    await sleep(150);
  }
  return null;
}

// ---- 1. full TCG list ----
let all = [];
try {
  console.log('Downloading the TCG card list from YGOPRODeck (one request, may take ~20 s)...');
  const json = await fetchJson(`${API}?format=tcg`);
  all = (json.data || []).filter((c) => c.type !== 'Skill Card' && c.type !== 'Token' && c.frameType !== 'token' && c.frameType !== 'skill');
  console.log(`  ${all.length} TCG cards`);
} catch (e) {
  console.warn(`  Could not download the full list (${e.message}).`);
  console.warn('  Pool cards will be looked up one by one; the "add any card" search needs allcards.json, so rerun setup later.');
}
const byName = new Map(all.map((c) => [c.name.toLowerCase(), c]));

// ---- 2. allcards.json ----
if (all.length) {
  const rows = all
    .map((c) => [c.id, c.name, c.frameType || '', STATUS[c.banlist_info?.ban_tcg] || ''])
    .sort((a, b) => a[1].localeCompare(b[1]));
  const body = JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), count: rows.length, cards: rows });
  await fs.writeFile(ALL_FILE, body);
  console.log(`Wrote allcards.json (${rows.length} cards, ${(body.length / 1024).toFixed(0)} KB)`);
}

// ---- 3. pool cards + images ----
const pool = JSON.parse(await fs.readFile(CARDS_FILE, 'utf8'));
await fs.mkdir(IMG_DIR, { recursive: true });
const missing = [];
let done = 0;
for (const card of pool.cards) {
  if (card.id && !FORCE && (await exists(path.join(IMG_DIR, `${card.id}.jpg`)))) { done++; continue; }
  try {
    let hit = byName.get(card.name.toLowerCase());
    if (!hit) hit = await lookupOne(card.name);
    if (!hit) { missing.push(card.name); continue; }
    card.id = hit.id;
    card.type = hit.type;
    card.frameType = hit.frameType;
    const imgPath = path.join(IMG_DIR, `${hit.id}.jpg`);
    if (FORCE || !(await exists(imgPath))) {
      const url = hit.card_images?.[0]?.image_url_small;
      if (url) {
        const img = await fetch(url);
        if (img.ok) await fs.writeFile(imgPath, Buffer.from(await img.arrayBuffer()));
        await sleep(60);
      }
    }
    done++;
    process.stdout.write(`\r  pool ${done}/${pool.cards.length} ${card.name.slice(0, 48).padEnd(48)}`);
  } catch (e) {
    missing.push(`${card.name} (${e.message})`);
  }
}
await fs.writeFile(CARDS_FILE, JSON.stringify(pool, null, 1));
console.log(`\nResolved ${done}/${pool.cards.length} pool cards.`);
if (missing.length) {
  console.log('Not found (the site shows a text tile for these; fix the name in cards.json and rerun):');
  for (const m of missing) console.log('  - ' + m);
}
