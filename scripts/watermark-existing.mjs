#!/usr/bin/env node
/**
 * Watermerkt bestaande projectfoto's in Supabase Storage met terugwerkende kracht.
 *
 * Leest NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY uit .env.local
 * (of uit de omgeving). Haalt alle foto's uit de `projects`-tabel, watermerkt ze
 * met scripts/watermark.png en zet ze op dezelfde storage-paden terug (upsert),
 * zodat de bestaande URL's blijven werken.
 *
 * Idempotent: al verwerkte paden worden bijgehouden in scripts/.watermarked.json
 * en overgeslagen bij een herhaalde run.
 *
 * Gebruik:  node scripts/watermark-existing.mjs           (echt uitvoeren)
 *           node scripts/watermark-existing.mjs --dry     (alleen tonen)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BUCKET = "project-photos";
const DRY = process.argv.includes("--dry");
const MANIFEST = path.join(__dirname, ".watermarked.json");

// --- env inladen (.env.local heeft voorrang) ---
function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const p = path.join(ROOT, name);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}
loadEnv();

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("✗ Zet NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } });
const watermarkSrc = fs.readFileSync(path.join(__dirname, "watermark.png"));
const done = fs.existsSync(MANIFEST) ? new Set(JSON.parse(fs.readFileSync(MANIFEST, "utf8"))) : new Set();

function storagePath(url) {
  const marker = `/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
}

async function watermark(input, contentType) {
  const oriented = await sharp(input, { failOn: "none" }).rotate().toBuffer();
  const base = sharp(oriented, { failOn: "none" });
  const meta = await base.metadata();
  const W = meta.width ?? 1600, H = meta.height ?? 1200;
  const wmW = Math.max(180, Math.round(W * 0.26));
  const wm = await sharp(watermarkSrc).resize({ width: wmW }).toBuffer();
  const wmMeta = await sharp(wm).metadata();
  const m = Math.round(W * 0.025);
  const left = Math.max(0, W - (wmMeta.width ?? wmW) - m);
  const top = Math.max(0, H - (wmMeta.height ?? 0) - m);
  let pipe = base.composite([{ input: wm, left, top }]);
  let ct = contentType;
  if (/png/.test(contentType)) pipe = pipe.png();
  else if (/webp/.test(contentType)) pipe = pipe.webp({ quality: 90 });
  else { pipe = pipe.jpeg({ quality: 90 }); ct = "image/jpeg"; }
  return { buffer: await pipe.toBuffer(), contentType: ct };
}

const CT_BY_EXT = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

async function main() {
  const { data: projects, error } = await supabase.from("projects").select("slug, images, cover");
  if (error) { console.error("✗ DB-fout:", error.message); process.exit(1); }

  // unieke storage-paden verzamelen
  const paths = new Set();
  for (const p of projects ?? []) {
    for (const u of [...(p.images ?? []), p.cover].filter(Boolean)) {
      const sp = storagePath(u);
      if (sp) paths.add(sp);
    }
  }
  const todo = [...paths].filter((p) => !done.has(p));
  console.log(`${paths.size} foto's gevonden, ${todo.length} te verwerken${DRY ? " (dry-run)" : ""}.`);

  let ok = 0, fail = 0;
  for (const sp of todo) {
    try {
      if (DRY) { console.log("  zou watermerken:", sp); ok++; continue; }
      const { data: blob, error: dErr } = await supabase.storage.from(BUCKET).download(sp);
      if (dErr) throw new Error(dErr.message);
      const input = Buffer.from(await blob.arrayBuffer());
      const ext = (sp.split(".").pop() || "jpg").toLowerCase();
      const { buffer, contentType } = await watermark(input, CT_BY_EXT[ext] || "image/jpeg");
      const { error: uErr } = await supabase.storage.from(BUCKET).upload(sp, buffer, { contentType, upsert: true });
      if (uErr) throw new Error(uErr.message);
      done.add(sp); ok++;
      console.log("  ✓", sp);
    } catch (e) {
      fail++;
      console.log("  ✗", sp, "—", e.message);
    }
  }
  if (!DRY) fs.writeFileSync(MANIFEST, JSON.stringify([...done], null, 2));
  console.log(`Klaar: ${ok} gewatermerkt, ${fail} mislukt.`);
}

main();
