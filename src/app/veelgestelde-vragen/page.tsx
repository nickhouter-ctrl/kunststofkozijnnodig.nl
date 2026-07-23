import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CTASection } from "@/components/CTASection";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Veelgestelde vragen over kunststof kozijnen",
  description:
    "Antwoorden op veelgestelde vragen over kunststof kozijnen: prijzen, levertijd, onderhoud, subsidie, isolatie, kleuren en meer. Advies van Kunststofkozijnnodig.nl.",
  keywords: [
    "veelgestelde vragen kunststof kozijnen",
    "FAQ kozijnen",
    "kunststof kozijnen onderhoud",
    "hoelang gaan kunststof kozijnen mee",
    "subsidie kozijnen",
  ],
};

const faqCategories = [
  {
    title: "Algemeen",
    faqs: [
      {
        q: "Hoe lang gaan kunststof kozijnen mee?",
        a: "Kwalitatieve kunststof kozijnen gaan minimaal 30 tot 50 jaar mee. De profielen van Schüco, Aluplast en Gealan die wij gebruiken zijn UV-bestendig, kleurvast en bestand tegen alle weersomstandigheden.",
      },
      {
        q: "Zijn kunststof kozijnen onderhoudsvrij?",
        a: "Vrijwel onderhoudsvrij. Een keer per jaar schoonmaken met een sopje is voldoende. Je hoeft nooit meer te schilderen, schuren of lakken — een groot voordeel ten opzichte van houten kozijnen.",
      },
      {
        q: "Wat is het verschil tussen kunststof en houten kozijnen?",
        a: "Kunststof kozijnen zijn onderhoudsvrij, beter isolerend en goedkoper in gebruik op de lange termijn. Houten kozijnen moeten elke 5-7 jaar geschilderd worden. Met onze houtlook kunststof kozijnen krijg je het beste van twee werelden.",
      },
      {
        q: "In welke kleuren zijn kunststof kozijnen leverbaar?",
        a: "Wij leveren kozijnen in wit, crème, antraciet (RAL 7016), zwart (RAL 9005), diverse houtlook-folies en elke RAL-kleur op maat. Aan de binnenzijde kan een andere kleur dan aan de buitenzijde.",
      },
    ],
  },
  {
    title: "Prijzen & kosten",
    faqs: [
      {
        q: "Wat kosten kunststof kozijnen per m²?",
        a: "De richtprijs ligt tussen €750 en €1.050 per m², inclusief HR++ glas, montage en afwerking. De exacte prijs hangt af van het gekozen profiel, de kleur en het glastype. Bekijk ons volledige prijsoverzicht op de prijzenpagina.",
      },
      {
        q: "Kan ik subsidie krijgen voor nieuwe kozijnen?",
        a: "Ja! Via de ISDE-regeling (Investeringssubsidie Duurzame Energie) kun je circa €41 per m² subsidie krijgen op isolerend glas. Dit geldt voor HR++ en triple glas in bestaande woningen. Wij helpen je graag met de aanvraag.",
      },
      {
        q: "Kan ik mijn kozijnen in termijnen betalen?",
        a: "Ja, wij bieden financieringsmogelijkheden voor particulieren. Je kunt je kozijnen in termijnen aflossen, waarbij de rente fiscaal aftrekbaar is en je boetevrij kunt aflossen. Vraag naar de voorwaarden.",
      },
      {
        q: "Is een offerte gratis en vrijblijvend?",
        a: "Altijd. Wij komen gratis bij je langs om in te meten en bespreken je wensen. Je ontvangt binnen 1 werkdag een transparante offerte. Geen verborgen kosten, geen verplichtingen.",
      },
    ],
  },
  {
    title: "Montage & plaatsing",
    faqs: [
      {
        q: "Hoe lang duurt het plaatsen van nieuwe kozijnen?",
        a: "Bij een gemiddelde woning (10-15 kozijnen) zijn we in 2-3 dagen klaar. Per kozijn rekenen we circa 1-2 uur voor demontage, plaatsing en afwerking. Complexere projecten kunnen langer duren.",
      },
      {
        q: "Wat is de levertijd?",
        a: "Onze standaard levertijd is binnen 4 weken na opname. Dit is fors sneller dan het marktgemiddelde van 8-12 weken. Spoed? Vraag naar onze spoedprocedure.",
      },
      {
        q: "Moet ik zelf iets voorbereiden?",
        a: "Wij regelen alles — van het verwijderen van de oude kozijnen tot het schoon achterlaten van je huis. Het enige dat we vragen is dat je gordijnen en raamdecoratie alvast verwijdert.",
      },
      {
        q: "Kunnen jullie ook alleen leveren zonder montage?",
        a: "Ja, wij leveren ook alleen. Dit is populair bij aannemers en zelfbouwers. Je krijgt dezelfde kwaliteit kozijnen, maar plaatst ze zelf of laat ze door je eigen aannemer plaatsen.",
      },
    ],
  },
  {
    title: "Isolatie & energie",
    faqs: [
      {
        q: "Hoeveel bespaar ik op energie met nieuwe kozijnen?",
        a: "Gemiddeld bespaar je €300-800 per jaar op je energierekening, afhankelijk van de huidige staat van je kozijnen en het gekozen glastype. Triple glas bespaart het meest.",
      },
      {
        q: "Wat is het verschil tussen HR++ en triple glas?",
        a: "HR++ glas heeft een U-waarde van circa 1.1 W/m²K, triple glas circa 0.7 W/m²K. Triple glas isoleert dus circa 40% beter, maar is ook duurder en zwaarder. Voor de meeste woningen is HR++ uitstekend.",
      },
      {
        q: "Zijn kunststof kozijnen inbraakwerend?",
        a: "Standaard leveren wij SKG 2-ster gecertificeerde kozijnen — dit voldoet aan het Politiekeurmerk Veilig Wonen. Upgrade naar SKG 3 is mogelijk voor extra beveiliging.",
      },
      {
        q: "Helpen nieuwe kozijnen tegen geluidsoverlast?",
        a: "Absoluut. Met HR++ glas reduceer je het geluid met circa 30-35 dB. Met triple glas of speciaal geluidsisolerend glas haal je tot 45 dB reductie. Ideaal als je aan een drukke weg woont.",
      },
    ],
  },
  {
    title: "Werkgebied & service",
    faqs: [
      {
        q: "In welk gebied zijn jullie actief?",
        a: "Wij leveren door heel Nederland. Montage verzorgen we voornamelijk in Noord-Holland — Zaanstreek, Amsterdam, Haarlem, Purmerend, Alkmaar, Beverwijk en omgeving (circa 40 km rond Wormerveer).",
      },
      {
        q: "Leveren jullie ook aan bedrijven en aannemers?",
        a: "Ja! Wij zijn een vaste partner voor aannemers, bouwbedrijven, VvE's en architecten. Zakelijke afnemers krijgen scherpe tarieven en gratis klantleads in hun werkgebied.",
      },
      {
        q: "Welke merken gebruiken jullie?",
        a: "Wij werken met drie Europese topmerken: Schüco (Duits, premium), Aluplast (Duits, uitstekende prijs-kwaliteit) en Gealan (Duits, innovatief). Elk merk is KOMO-gecertificeerd.",
      },
      {
        q: "Wat als er iets mis is na plaatsing?",
        a: "Je krijgt 10 jaar fabrieksgarantie op het profiel, 5 jaar op onze plaatsing en 2 jaar op het beslag. Bij problemen staan we binnen 48 uur bij je op de stoep.",
      },
    ],
  },
];

// FAQ structured data for Google Rich Results
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqCategories.flatMap((cat) =>
    cat.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  ),
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <PageHero
        eyebrow="Veelgestelde vragen"
        title="Alles wat je wilt weten over kozijnen."
        description="Van prijzen tot montage, van subsidie tot onderhoud — hier vind je antwoord op de meestgestelde vragen over kunststof kozijnen."
        image="/images/project-zaandam-2.jpg"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Veelgestelde vragen", href: "/veelgestelde-vragen" },
        ]}
      />

      <section className="section bg-paper">
        <div className="container-rebu max-w-4xl">
          {faqCategories.map((cat) => (
            <div key={cat.title} className="mb-14">
              <h2 className="flex items-center gap-4 font-display text-2xl font-medium text-ink md:text-3xl">
                <span className="h-px flex-1 bg-ink/10" />
                <span>{cat.title}</span>
                <span className="h-px flex-1 bg-ink/10" />
              </h2>
              <div className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
                {cat.faqs.map((faq) => (
                  <details key={faq.q} className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-display text-lg font-medium text-ink transition-colors hover:text-rebu-green">
                      {faq.q}
                      <ChevronRight className="h-5 w-5 flex-none text-rebu-green transition-transform group-open:rotate-90" />
                    </summary>
                    <p className="pb-6 leading-relaxed text-ink-soft">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-10 bg-rebu-green-dark p-10 text-center text-white">
            <span className="eyebrow is-light justify-center">Nog vragen?</span>
            <h2 className="mt-4 font-display text-3xl font-medium">Vraag niet beantwoord?</h2>
            <p className="mt-3 leading-relaxed text-white/70">
              Neem gerust contact op — we helpen je graag persoonlijk.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="btn-light">
                Contact opnemen <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/offerte" className="btn-light">
                Offerte aanvragen <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
