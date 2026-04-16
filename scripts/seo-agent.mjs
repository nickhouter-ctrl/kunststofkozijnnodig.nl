#!/usr/bin/env node
/**
 * AI SEO Agent — Rebu Kozijnen
 *
 * Scant alle pagina's in src/app, laat Claude Opus 4.6 meta tags, Open Graph,
 * JSON-LD structured data en alt teksten optimaliseren voor Nederlandse SEO
 * rondom "kunststof kozijnen", en schrijft het resultaat weg naar:
 *
 *   - seo-report.json          (overzicht per pagina + suggesties)
 *   - src/lib/seo-generated.ts (typed object met geoptimaliseerde metadata)
 *
 * Gebruik:
 *   ANTHROPIC_API_KEY=sk-ant-... npm run seo
 *   ANTHROPIC_API_KEY=sk-ant-... npm run seo -- --apply   (past metadata direct toe)
 *
 * Het script gebruikt:
 *   - Claude Opus 4.6 (claude-opus-4-6)
 *   - Adaptive thinking (model beslist zelf hoeveel hij denkt)
 *   - Prompt caching op het grote systeem-prompt (5 min TTL)
 *   - Structured outputs via messages.parse() zodat we JSON terugkrijgen
 */

import { readFile, writeFile, readdir, stat, mkdir } from "node:fs/promises";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const APP_DIR = join(ROOT, "src/app");
const REPORT_FILE = join(ROOT, "seo-report.json");
const GENERATED_FILE = join(ROOT, "src/lib/seo-generated.ts");

const APPLY = process.argv.includes("--apply");

// -------- helpers --------------------------------------------------------

async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(p)));
    } else if (entry.name === "page.tsx") {
      files.push(p);
    }
  }
  return files;
}

function pageRouteFromPath(absPath) {
  const rel = relative(APP_DIR, absPath).replace(/\\/g, "/");
  const segments = rel.split("/").slice(0, -1); // strip 'page.tsx'
  const route = "/" + segments.filter((s) => !s.startsWith("(")).join("/");
  return route === "/" ? "/" : route.replace(/\/$/, "");
}

function extractContent(source) {
  // Very light extraction: grab string literals and JSX text so Claude has context.
  const strings = [];
  const stringMatches = source.matchAll(/["'`]([^"'`]{20,400})["'`]/g);
  for (const m of stringMatches) strings.push(m[1]);
  return strings.slice(0, 60).join("\n");
}

// -------- AI agent -------------------------------------------------------

const SYSTEM_PROMPT = `Je bent een senior SEO-consultant gespecialiseerd in Nederlandse lokale
zoekmachine-optimalisatie voor installatie- en bouwbedrijven. Je werkt voor
Rebu Kozijnen — een leverancier en installateur van kunststof kozijnen,
deuren en schuifpuien gevestigd in Wormerveer (Noord-Holland, Zaanstreek).

Kernmerken van Rebu:
- Specialist in kunststof kozijnen, deuren en schuifpuien
- Merken: Schüco, Aluplast, Gealan
- SKG 2-ster inbraakwerend gecertificeerd
- Binnen 4 weken geleverd
- Levert aan particulieren én zakelijk (aannemers, bouwbedrijven, VvE, architecten)
- Werkgebied: heel Nederland (montage binnen 40 km van Wormerveer)
- 5,0 ster op Google

Jouw taak: per pagina optimaliseer je Title (max 60 tekens), Meta description
(max 155 tekens), Open Graph (titel + beschrijving), een focus keyword,
secundaire keywords, alt-teksten voor de belangrijkste afbeeldingen, en een
JSON-LD structured data-snippet (Schema.org) die het beste past bij de inhoud
van de pagina (LocalBusiness, WebPage, Service, FAQPage, etc.).

Eisen:
- Taal: Nederlands (nl-NL)
- Gebruik natuurlijke, wervende taal — geen keyword stuffing
- Focus op lokale intentie (Zaanstreek, Wormerveer, Noord-Holland) wanneer relevant
- Gebruik vaktermen ("HR++ glas", "triple glas", "draaikiep", "stelkozijn")
- JSON-LD moet geldig Schema.org zijn, zonder "@context" en "@type" fouten
- Geef altijd exact het JSON-schema terug dat gevraagd wordt

Je krijgt per pagina: route, ruwe code-content, en het type pagina. Geef
uitsluitend gestructureerde JSON terug.`;

function buildUserPrompt({ route, content }) {
  return `Pagina route: ${route}

Ruwe code-content (string literals uit de React component):
---
${content || "(geen content gevonden)"}
---

Geef optimale SEO-metadata voor deze pagina.`;
}

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    route: { type: "string" },
    title: { type: "string", description: "Max 60 tekens, inclusief merknaam" },
    description: { type: "string", description: "Max 155 tekens" },
    focusKeyword: { type: "string" },
    secondaryKeywords: { type: "array", items: { type: "string" } },
    openGraph: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        description: { type: "string" },
      },
      required: ["title", "description"],
    },
    altTexts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          hint: { type: "string", description: "Welke foto (bijv. hero, product-kozijnen-1)" },
          alt: { type: "string" },
        },
        required: ["hint", "alt"],
      },
    },
    jsonLd: {
      type: "string",
      description: "Schema.org JSON-LD als JSON-string (zonder @context), bijv. {\"@type\":\"Service\",...}",
    },
    improvements: {
      type: "array",
      items: { type: "string" },
      description: "Concrete verbeterpunten of suggesties",
    },
  },
  required: [
    "route",
    "title",
    "description",
    "focusKeyword",
    "secondaryKeywords",
    "openGraph",
    "altTexts",
    "jsonLd",
    "improvements",
  ],
};

async function analyzePage(client, page) {
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: buildUserPrompt(page) }],
    output_config: {
      format: {
        type: "json_schema",
        schema,
      },
    },
  });

  // Pluck the first text block (parsed JSON lives in .text for structured outputs)
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock) throw new Error(`Geen response voor ${page.route}`);
  try {
    const result = JSON.parse(textBlock.text);
    // Parse jsonLd string back to object
    if (typeof result.jsonLd === "string") {
      try { result.jsonLd = JSON.parse(result.jsonLd); } catch {}
    }
    return result;
  } catch (e) {
    console.error(`Kon JSON niet parsen voor ${page.route}:`, textBlock.text.slice(0, 200));
    throw e;
  }
}

// -------- main -----------------------------------------------------------

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY niet ingesteld. Voeg 'm toe aan .env.local");
    process.exit(1);
  }

  console.log("🔍 Pagina's zoeken in src/app ...");
  const pageFiles = await walk(APP_DIR);
  const pages = await Promise.all(
    pageFiles.map(async (f) => ({
      file: f,
      route: pageRouteFromPath(f),
      content: extractContent(await readFile(f, "utf8")),
    })),
  );
  pages.sort((a, b) => a.route.localeCompare(b.route));
  console.log(`📄 ${pages.length} pagina's gevonden.`);

  const client = new Anthropic();
  const results = [];

  for (const page of pages) {
    process.stdout.write(`   → analyseren ${page.route} ... `);
    try {
      const seo = await analyzePage(client, page);
      results.push(seo);
      console.log("✓");
    } catch (e) {
      console.log(`✗ (${e.message})`);
    }
  }

  // Write report
  await writeFile(REPORT_FILE, JSON.stringify(results, null, 2));
  console.log(`\n📝 Rapport weggeschreven naar ${relative(ROOT, REPORT_FILE)}`);

  // Write generated TS module with metadata per route
  const map = Object.fromEntries(
    results.map((r) => [
      r.route,
      {
        title: r.title,
        description: r.description,
        focusKeyword: r.focusKeyword,
        keywords: r.secondaryKeywords,
        openGraph: r.openGraph,
        jsonLd: r.jsonLd,
      },
    ]),
  );

  const tsContent = `// AUTO-GENERATED door scripts/seo-agent.mjs — niet handmatig aanpassen.
// Run 'npm run seo' om te vernieuwen.

export type GeneratedSeo = {
  title: string;
  description: string;
  focusKeyword: string;
  keywords: string[];
  openGraph: { title: string; description: string };
  jsonLd: Record<string, unknown>;
};

export const generatedSeo: Record<string, GeneratedSeo> = ${JSON.stringify(map, null, 2)};

export function seoFor(route: string): GeneratedSeo | undefined {
  return generatedSeo[route];
}
`;
  await mkdir(dirname(GENERATED_FILE), { recursive: true });
  await writeFile(GENERATED_FILE, tsContent);
  console.log(`🧩 TypeScript module weggeschreven naar ${relative(ROOT, GENERATED_FILE)}`);

  // Summary
  console.log(`\n✅ Klaar. ${results.length}/${pages.length} pagina's geoptimaliseerd.`);
  const improvements = results.flatMap((r) => r.improvements ?? []);
  if (improvements.length > 0) {
    console.log(`\n💡 Top suggesties van de agent:`);
    for (const tip of improvements.slice(0, 10)) console.log(`   • ${tip}`);
  }

  if (APPLY) {
    console.log(
      "\nℹ️  --apply is (nog) een no-op. Importeer `seoFor()` uit `@/lib/seo-generated` in je page.tsx:\n" +
        "   export const metadata = { ...seoFor('/particulier'), metadataBase: new URL(site.url) };",
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
