import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Palette, Ruler } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CTASection } from "@/components/CTASection";

export const metadata: Metadata = {
  title: "Voordeurmodellen — premium kunststof voordeuren",
  description:
    "Ontdek onze collectie premium kunststof voordeuren. Van modern tot klassiek, 30+ modellen in elke kleur. Schüco kwaliteit, SKG 2-ster.",
};

type DoorModel = {
  model: string;
  title: string;
  description: string;
  color: string;
  accent?: string;
  hasGlass: boolean;
  glassShape?: string;
};

const categories = [
  {
    name: "Style",
    tagline: "Moderne interpretatie van traditie",
    description: "Ontworpen om een krachtige eerste indruk te maken. Minimalistische lijnen met een elegante uitstraling.",
    models: [
      { model: "5000", title: "Minimalisme als inspiratie", description: "Klassiek ontwerp met stijlvolle beleving.", color: "#9A9A98", hasGlass: false },
      { model: "5000-1", title: "Uniek — nieuwe generatie", description: "Benadrukt het eigentijdse karakter van de gevel.", color: "#1A1A1A", hasGlass: false },
      { model: "5010", title: "Eenvoud is niet eenvoudig", description: "Elegantie en veiligheid samenbrengen.", color: "#D4C9B8", hasGlass: true, glassShape: "rect" },
      { model: "5020", title: "Schoonheid die u voelt", description: "Luxe en moderne klasse uitstralen.", color: "#A89880", hasGlass: false },
      { model: "5020-1", title: "Moderne interpretatie", description: "Combinatie van esthetiek en functionaliteit.", color: "#E8E0D0", hasGlass: false },
    ],
  },
  {
    name: "Modern",
    tagline: "Een ontwerp dat voor zichzelf spreekt",
    description: "Architectonische zuiverheid en een harmonie van lijnen die past bij elke bouwstijl.",
    models: [
      { model: "5030", title: "Modern statement", description: "Rust en elegantie in één ontwerp.", color: "#E8E0D0", hasGlass: true, glassShape: "strips" },
      { model: "5040", title: "Details die verfijnen", description: "Esthetiek en innovatie samenkomen.", color: "#9A9A98", hasGlass: false },
      { model: "5050", title: "Eenvoud als rustpunt", description: "Minimalistisch ontwerp met elegantie.", color: "#9A9A98", hasGlass: false },
      { model: "5055", title: "Klassiek en modern", description: "Luxe en stijl uitstralen met geometrische lijnen.", color: "#D4C9B8", hasGlass: true, glassShape: "strips" },
      { model: "5060", title: "Lijnen die vertrouwen wekken", description: "Functionaliteit en esthetiek naadloos samensmelten.", color: "#A89880", hasGlass: false },
    ],
  },
  {
    name: "Street",
    tagline: "Elegantie zonder compromis",
    description: "Verfijning die het karakter van de woning bepaalt. Perfecte balans tussen design en tijdloze elegantie.",
    models: [
      { model: "5060-1", title: "Elegantie zonder compromis", description: "Moderne uitstraling met tijdloze elegantie.", color: "#9A9A98", hasGlass: true, glassShape: "rect" },
      { model: "5070", title: "Vormgeving die spreekt", description: "Minimalisme en luxe maken de entree een statement.", color: "#5A5A58", hasGlass: false },
      { model: "5080", title: "Innovatie bij elke binnenkomst", description: "Elegantie met functionaliteit combineren.", color: "#3E4347", hasGlass: false },
      { model: "5090", title: "Traditie, vertaald naar vandaag", description: "Harmonie en karakter brengen met eigentijdse uitstraling.", color: "#1A1A1A", hasGlass: false },
      { model: "5090-1", title: "Een stijl die blijft", description: "Verfijning en luxueus karakter uitstralen.", color: "#3E4347", hasGlass: true, glassShape: "strips" },
    ],
  },
  {
    name: "Unique",
    tagline: "Een ontwerp dat voor zichzelf spreekt",
    description: "Innovatie en esthetiek samenbrengen — meer dan een functioneel element, een uitgesproken stijlstatement.",
    models: [
      { model: "5110", title: "Innovatie en karakter", description: "Eigentijdse balans tussen moderne lijnen en elegantie.", color: "#6A6E70", hasGlass: true, glassShape: "rect" },
      { model: "5120", title: "Details die het verschil maken", description: "Verfijnde vormgeving met modern karakter.", color: "#9A9A98", hasGlass: true, glassShape: "strips" },
      { model: "5130", title: "Eenvoud als ultieme luxe", description: "Architectonische zuiverheid op hoog niveau.", color: "#D4C9B8", hasGlass: true, glassShape: "oval" },
      { model: "5140", title: "Klassiek en modern samenkomen", description: "Verfijning en functionaliteit in balans.", color: "#C8BCA8", hasGlass: true, glassShape: "squares" },
      { model: "5150", title: "Lijnen die vertrouwen uitstralen", description: "Rust en zekerheid met eigentijdse vormgeving.", color: "#A89880", hasGlass: true, glassShape: "strips" },
    ],
  },
  {
    name: "Joyful",
    tagline: "De grens tussen binnen en buiten",
    description: "Esthetiek en functionaliteit verenigen. Een harmonie van lijnen en elegantie die aansluit bij uiteenlopende architectonische concepten.",
    models: [
      { model: "5150-1", title: "Een eerste indruk die blijft", description: "Elegantie en veiligheid in perfecte balans.", color: "#1A1A1A", hasGlass: true, glassShape: "strips" },
      { model: "5160", title: "Stijl als dagelijkse inspiratie", description: "Persoonlijke stijl tot uiting brengen.", color: "#9A9A98", accent: "#E8E0D0", hasGlass: true, glassShape: "rect" },
      { model: "5200", title: "Tijdloze schoonheid", description: "Uitgesproken luxueuze uitstraling met krachtig geheel.", color: "#3E4347", hasGlass: true, glassShape: "strips" },
      { model: "5210", title: "Perfectie tot in detail", description: "Minimalistisch ontwerp dat moderne sfeer ademt.", color: "#2A2E30", hasGlass: true, glassShape: "rect" },
      { model: "5220", title: "De grens tussen binnen en buiten", description: "Echte stijlverklaring met harmonie van lijnen.", color: "#C44030", hasGlass: true, glassShape: "rect" },
      { model: "5230", title: "Ontworpen om te imponeren", description: "Krachtige eerste indruk met uitgebalanceerde proporties.", color: "#C44030", accent: "#1A1A1A", hasGlass: true, glassShape: "rect" },
      { model: "5240", title: "Waar luxe en innovatie samenkomen", description: "Eigentijdse balans tussen vorm en functie.", color: "#3040A0", hasGlass: true, glassShape: "rect" },
    ],
  },
  {
    name: "Traditional",
    tagline: "Schoonheid in balans",
    description: "Eenvoud en luxe creëren een entree die elegantie en eigentijds karakter uitstraalt. Tijdloze uitstraling voor uiteenlopende bouwstijlen.",
    models: [
      { model: "5400", title: "Schoonheid in balans", description: "Minimalistisch ontwerp met architectonische zuiverheid.", color: "#D4C9B8", hasGlass: true, glassShape: "strips" },
      { model: "5145", title: "Elegantie die indruk maakt", description: "Moderne entree met verfijning en karakter.", color: "#2A2E30", hasGlass: true, glassShape: "squares" },
      { model: "5145-1", title: "Een stijl die blijft spreken", description: "Harmonie en luxe in één krachtig geheel.", color: "#3E4347", hasGlass: true, glassShape: "squares" },
    ],
  },
  {
    name: "Elegance",
    tagline: "Nieuwe generatie van elegantie",
    description: "Eenvoud en luxe creëren een entree die elegantie en moderne uitstraling straalt. Hoogwaardige materialen garanderen duurzaamheid.",
    models: [
      { model: "5152-1", title: "Nieuwe generatie van elegantie", description: "Architectonische zuiverheid met tijdloze aantrekkingskracht.", color: "#B8A080", hasGlass: true, glassShape: "rect" },
    ],
  },
];

function DoorVisual({ model, color, hasGlass }: { model: DoorModel; color: string; hasGlass: boolean }) {
  return (
    <div className="relative flex aspect-[2/3] items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
      {/* Door shape */}
      <div
        className="relative h-[85%] w-[55%] rounded-sm shadow-lg"
        style={{ backgroundColor: color }}
      >
        {/* Handle */}
        <div className="absolute right-[15%] top-[45%] h-[20%] w-[3%] rounded-full bg-white/40" />
        {hasGlass && (
          <div className="absolute left-[20%] top-[15%] h-[35%] w-[35%] rounded-sm bg-white/20" />
        )}
      </div>
      {/* Model number */}
      <div className="absolute bottom-2 left-3 rounded-full bg-rebu-green px-2.5 py-0.5 text-[10px] font-bold text-white">
        {model.model}
      </div>
    </div>
  );
}

export default function VoordeurenPage() {
  return (
    <>
      <PageHero
        eyebrow="Voordeurmodellen"
        title="Premium kunststof voordeuren."
        description="Ontdek onze collectie van 30+ voordeurmodellen. Van minimalistisch modern tot klassiek elegant — elke deur op maat gemaakt in de kleur van jouw keuze."
        image="/images/project-landsmeer.jpg"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Producten", href: "/producten" },
          { label: "Voordeuren", href: "/voordeuren" },
        ]}
      />

      {/* Key features */}
      <section className="border-b border-rebu-stone bg-white py-10">
        <div className="container-rebu grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { icon: ShieldCheck, title: "SKG 2-ster", sub: "3-puntsvergrendeling standaard" },
            { icon: Palette, title: "Elke kleur mogelijk", sub: "Alle RAL + houtlook kleuren" },
            { icon: Ruler, title: "Op maat gemaakt", sub: "Elke afmeting mogelijk" },
            { icon: ShieldCheck, title: "10 jaar garantie", sub: "Op profiel en constructie" },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-rebu-green/10 text-rebu-green">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-rebu-charcoal">{f.title}</p>
                <p className="text-xs text-neutral-500">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.map((cat, catIdx) => (
        <section key={cat.name} className={`section ${catIdx % 2 === 0 ? "bg-white" : "bg-rebu-cream"}`}>
          <div className="container-rebu">
            <span className="section-eyebrow">{cat.name}</span>
            <h2 className="section-title mt-3">
              {cat.tagline.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="italic text-rebu-green">{cat.tagline.split(" ").slice(-1)}</span>
            </h2>
            <p className="mt-4 max-w-2xl text-neutral-600">{cat.description}</p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {cat.models.map((m) => (
                <div key={m.model} className="group overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-black/5 transition-all hover:-translate-y-1 hover:shadow-glow">
                  <DoorVisual model={m} color={m.color} hasGlass={m.hasGlass} />
                  <div className="p-5">
                    <p className="text-xs font-bold text-rebu-green">Model {m.model}</p>
                    <h3 className="mt-1 font-display text-lg font-semibold text-rebu-charcoal">{m.title}</h3>
                    <p className="mt-1 text-sm text-neutral-600">{m.description}</p>
                    <Link href="/offerte" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-rebu-green hover:text-rebu-green-dark">
                      Offerte aanvragen <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Brochures */}
      <section className="section bg-rebu-cream">
        <div className="container-rebu max-w-3xl text-center">
          <span className="section-eyebrow">Brochures</span>
          <h2 className="section-title mt-3">
            Download de <span className="italic text-rebu-green">volledige catalogus</span>
          </h2>
          <p className="mt-4 text-neutral-600">
            Bekijk alle voordeurmodellen, kleuren en specificaties in onze brochures.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="https://rebukozijnen.nl/wp-content/uploads/2024/10/RebuKozijnen_Catalogus_buitendeuren.pdf-3.pdf" target="_blank" rel="noopener noreferrer" className="btn-primary">
              Aluplast voordeuren (PDF) <ArrowRight className="h-4 w-4" />
            </a>
            <a href="https://rebukozijnen.nl/wp-content/uploads/2024/10/Voordeurmodellen-Gealan_rebukozijnen.pdf" target="_blank" rel="noopener noreferrer" className="btn-secondary">
              Gealan voordeuren (PDF) <ArrowRight className="h-4 w-4" />
            </a>
            <Link href="/kleuren" className="btn-secondary">
              Bekijk alle kleuren <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
