"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home,
  Briefcase,
  Hammer,
  Building,
  Blocks,
  HelpCircle,
  Truck,
  Wrench,
  Sparkles,
  Clock,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  PartyPopper,
  Minus,
  Plus,
  Ruler,
  X,
  FileImage,
} from "lucide-react";
import { label, type QuoteData, type QuoteItem, type Dimension } from "@/lib/quote";
import { FileUpload, type Attachment } from "./FileUpload";

type PartialQuote = Partial<Omit<QuoteData, "items" | "attachments">> & {
  items?: QuoteItem[];
  attachments?: Attachment[];
};

const PRODUCTS = ["kozijnen", "deuren", "schuifpuien"] as const;

const STEPS = [
  { id: "customer", title: "Type klant", short: "Klant" },
  { id: "project", title: "Project", short: "Project" },
  { id: "products", title: "Producten & aantal", short: "Producten" },
  { id: "dimensions", title: "Afmetingen", short: "Afmetingen" },
  { id: "specs", title: "Specificaties", short: "Specs" },
  { id: "timeline", title: "Planning", short: "Planning" },
  { id: "contact", title: "Contactgegevens", short: "Contact" },
  { id: "review", title: "Bevestigen", short: "Bevestigen" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

export function QuoteWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<PartialQuote>({
    items: [],
    attachments: [],
    houtlookVerbinding: false,
    brand: "geen-voorkeur",
    glass: "advies",
    timeline: "flexibel",
    notes: "",
    description: "",
    consent: false,
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const current = STEPS[stepIndex];
  const update = <K extends keyof QuoteData>(key: K, value: QuoteData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  // Item helpers
  const items = data.items ?? [];
  const hasProduct = (p: string) => items.some((i) => i.product === p);
  const getItem = (p: string) => items.find((i) => i.product === p);

  const toggleProduct = (p: (typeof PRODUCTS)[number]) => {
    if (hasProduct(p)) {
      update("items", items.filter((i) => i.product !== p) as QuoteItem[]);
    } else {
      update("items", [...items, { product: p, quantity: 1, dimensions: [{}] }] as QuoteItem[]);
    }
  };

  const setItemQuantity = (product: string, qty: number) => {
    const clamped = Math.max(1, Math.min(99, qty));
    update(
      "items",
      items.map((i) => {
        if (i.product !== product) return i;
        // Adjust dimensions array to match quantity
        const dims = i.dimensions ?? [];
        const newDims = Array.from({ length: clamped }, (_, idx) => dims[idx] ?? {});
        return { ...i, quantity: clamped, dimensions: newDims };
      }) as QuoteItem[],
    );
  };

  const setDimension = (product: string, idx: number, field: keyof Dimension, value: number | string) => {
    update(
      "items",
      items.map((i) => {
        if (i.product !== product) return i;
        const dims = [...(i.dimensions ?? [])];
        dims[idx] = { ...dims[idx], [field]: value };
        return { ...i, dimensions: dims };
      }) as QuoteItem[],
    );
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const canContinue = (() => {
    switch (current.id as StepId) {
      case "customer":
        return !!data.customerType;
      case "project":
        return !!data.projectType;
      case "products":
        return items.length > 0 && items.every((i) => i.quantity >= 1) && !!data.service;
      case "dimensions":
        return true; // Dimensions are optional
      case "specs":
        return !!data.brand && !!data.colorBuiten && !!data.colorBinnen && !!data.glass;
      case "timeline":
        return !!data.timeline;
      case "contact":
        return !!(data.firstName && data.lastName && data.email && data.phone && data.street && data.houseNumber && data.postalCode && data.city);
      case "review":
        return !!data.consent;
    }
  })();

  const next = () => canContinue && stepIndex < STEPS.length - 1 && setStepIndex((i) => i + 1);
  const prev = () => stepIndex > 0 && setStepIndex((i) => i - 1);

  const submit = async () => {
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/offerte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Er ging iets mis");
      setStatus("success");
    } catch (e) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Onbekende fout");
    }
  };

  if (status === "success") {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-10 text-center shadow-glow ring-1 ring-black/5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rebu-green/10 text-rebu-green">
          <PartyPopper className="h-8 w-8" />
        </div>
        <h2 className="mt-6 font-display text-3xl font-semibold text-rebu-charcoal">Bedankt, {data.firstName}!</h2>
        <p className="mt-4 text-neutral-600">
          Je aanvraag is ontvangen. We nemen binnen 1 werkdag contact met je op via{" "}
          <span className="font-semibold text-rebu-charcoal">{data.email}</span> of{" "}
          <span className="font-semibold text-rebu-charcoal">{data.phone}</span>.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-secondary">Terug naar home</Link>
          <Link href="/projecten" className="btn-primary">Bekijk onze projecten</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Progress */}
      <div className="mb-10 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-black/5">
        <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-500">
          <span>Stap {stepIndex + 1} van {STEPS.length}</span>
          <span className="text-rebu-green">{current.title}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-rebu-stone">
          <div className="h-full rounded-full bg-rebu-green transition-all duration-500 ease-out" style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }} />
        </div>
        <div className="mt-4 hidden items-center justify-between gap-2 md:flex">
          {STEPS.map((s, i) => (
            <div key={s.id} className={`flex flex-1 items-center gap-2 text-xs ${i <= stepIndex ? "text-rebu-green" : "text-neutral-400"}`}>
              <span className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-[10px] font-bold ${i < stepIndex ? "bg-rebu-green text-white" : i === stepIndex ? "border-2 border-rebu-green text-rebu-green" : "border border-neutral-300 text-neutral-400"}`}>
                {i < stepIndex ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <span className="hidden font-medium lg:inline">{s.short}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="rounded-3xl bg-white p-6 shadow-glow ring-1 ring-black/5 md:p-10">

        {/* Step 1: Customer type */}
        {current.id === "customer" && (
          <StepShell title="Voor wie vraag je de offerte aan?" subtitle="Zo kunnen we je het beste helpen.">
            <OptionGrid cols={2}>
              <BigOption icon={Home} label="Particulier" description="Voor mijn eigen woning" selected={data.customerType === "particulier"} onSelect={() => update("customerType", "particulier")} />
              <BigOption icon={Briefcase} label="Zakelijk" description="Aannemer, bouwbedrijf, VvE of architect" selected={data.customerType === "zakelijk"} onSelect={() => update("customerType", "zakelijk")} />
            </OptionGrid>
          </StepShell>
        )}

        {/* Step 2: Project type */}
        {current.id === "project" && (
          <StepShell title="Wat voor project gaat het om?" subtitle="Een korte schets helpt ons bij de juiste materialen.">
            <OptionGrid cols={2}>
              <BigOption icon={Hammer} label={label("renovatie")} description="Bestaande kozijnen vervangen" selected={data.projectType === "renovatie"} onSelect={() => update("projectType", "renovatie")} />
              <BigOption icon={Building} label={label("nieuwbouw")} description="Nieuwbouw project" selected={data.projectType === "nieuwbouw"} onSelect={() => update("projectType", "nieuwbouw")} />
              <BigOption icon={Blocks} label={label("uitbouw")} description="Aanbouw of uitbreiding" selected={data.projectType === "uitbouw"} onSelect={() => update("projectType", "uitbouw")} />
              <BigOption icon={HelpCircle} label={label("anders")} description="Nog niet zeker, ik wil advies" selected={data.projectType === "anders"} onSelect={() => update("projectType", "anders")} />
            </OptionGrid>
          </StepShell>
        )}

        {/* Step 3: Products + quantity per product + service */}
        {current.id === "products" && (
          <StepShell title="Wat heb je nodig en hoeveel?" subtitle="Selecteer de producten en vul per product het aantal in.">
            <div className="space-y-4">
              {PRODUCTS.map((p) => {
                const selected = hasProduct(p);
                const item = getItem(p);
                return (
                  <div
                    key={p}
                    className={`rounded-2xl border-2 p-5 transition-all ${selected ? "border-rebu-green bg-rebu-green/5" : "border-rebu-stone hover:border-rebu-green/40"}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => toggleProduct(p)}
                        className="flex flex-1 items-center gap-4 text-left"
                      >
                        <div className={`flex h-6 w-6 flex-none items-center justify-center rounded-lg transition-colors ${selected ? "bg-rebu-green text-white" : "border border-neutral-300"}`}>
                          {selected && <Check className="h-3.5 w-3.5" />}
                        </div>
                        <span className={`font-display text-xl font-semibold ${selected ? "text-rebu-green" : "text-rebu-charcoal"}`}>
                          {label(p)}
                        </span>
                      </button>

                      {selected && item && (
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setItemQuantity(p, item.quantity - 1)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-rebu-cream text-rebu-green-dark hover:bg-rebu-stone disabled:opacity-40" disabled={item.quantity <= 1}>
                            <Minus className="h-4 w-4" />
                          </button>
                          <input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={99}
                            value={item.quantity}
                            onChange={(e) => setItemQuantity(p, parseInt(e.target.value, 10) || 1)}
                            className="w-16 appearance-none bg-transparent text-center font-display text-2xl font-semibold tabular-nums text-rebu-charcoal focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                          <button type="button" onClick={() => setItemQuantity(p, item.quantity + 1)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-rebu-green text-white hover:bg-rebu-green-dark">
                            <Plus className="h-4 w-4" />
                          </button>
                          <span className="ml-1 text-sm text-neutral-500">stuks</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {items.length > 0 && (
              <div className="mt-4 rounded-xl bg-rebu-stone/50 px-4 py-3 text-sm text-neutral-600">
                Totaal: <span className="font-semibold text-rebu-charcoal">{totalItems}</span> {totalItems === 1 ? "stuk" : "stuks"} ({items.map((i) => `${i.quantity}× ${label(i.product)}`).join(", ")})
              </div>
            )}

            <p className="mt-8 mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Dienstverlening</p>
            <OptionGrid cols={2}>
              <BigOption icon={Truck} label={label("leveren")} description="Ik laat het zelf plaatsen" selected={data.service === "leveren"} onSelect={() => update("service", "leveren")} />
              <BigOption icon={Wrench} label={label("leveren-plaatsen")} description="Inclusief montage door Rebu" selected={data.service === "leveren-plaatsen"} onSelect={() => update("service", "leveren-plaatsen")} />
            </OptionGrid>

            <p className="mt-8 mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Houtlook verbinding</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => update("houtlookVerbinding", true)}
                className={`flex-1 rounded-2xl border-2 px-5 py-4 text-left transition-all ${data.houtlookVerbinding ? "border-rebu-green bg-rebu-green/5 shadow-soft" : "border-rebu-stone hover:border-rebu-green/40"}`}
              >
                <p className={`font-display text-lg font-semibold ${data.houtlookVerbinding ? "text-rebu-green" : "text-rebu-charcoal"}`}>Ja, houtlook verbinding</p>
                <p className="mt-1 text-sm text-neutral-500">Hoekverbinding met houtlook uitstraling</p>
                {data.houtlookVerbinding && <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-rebu-green/10 px-2.5 py-0.5 text-xs font-medium text-rebu-green"><Check className="h-3 w-3" /> Geselecteerd</span>}
              </button>
              <button
                type="button"
                onClick={() => update("houtlookVerbinding", false)}
                className={`flex-1 rounded-2xl border-2 px-5 py-4 text-left transition-all ${!data.houtlookVerbinding ? "border-rebu-green bg-rebu-green/5 shadow-soft" : "border-rebu-stone hover:border-rebu-green/40"}`}
              >
                <p className={`font-display text-lg font-semibold ${!data.houtlookVerbinding ? "text-rebu-green" : "text-rebu-charcoal"}`}>Nee, standaard (verstek)</p>
                <p className="mt-1 text-sm text-neutral-500">Standaard verstekverbinding</p>
                {!data.houtlookVerbinding && <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-rebu-green/10 px-2.5 py-0.5 text-xs font-medium text-rebu-green"><Check className="h-3 w-3" /> Geselecteerd</span>}
              </button>
            </div>
          </StepShell>
        )}

        {/* Step 4: Dimensions per item */}
        {current.id === "dimensions" && (
          <StepShell title="Afmetingen & foto's" subtitle="Vul afmetingen in per stuk en voeg eventueel foto's of tekeningen toe. Alles is optioneel — we meten sowieso in bij een afspraak.">
            {items.map((item) => (
              <div key={item.product} className="mb-8">
                <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-rebu-charcoal">
                  <Ruler className="h-5 w-5 text-rebu-green" />
                  {label(item.product)} — {item.quantity} {item.quantity === 1 ? "stuk" : "stuks"}
                </h3>
                <div className="space-y-3">
                  {Array.from({ length: item.quantity }, (_, idx) => {
                    const dim = item.dimensions?.[idx] ?? {};
                    return (
                      <div key={idx} className="flex flex-wrap items-center gap-3 rounded-xl border border-rebu-stone bg-rebu-cream p-4">
                        <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-rebu-green/10 text-xs font-bold text-rebu-green">
                          {idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            inputMode="numeric"
                            placeholder="Breedte"
                            value={dim.width ?? ""}
                            onChange={(e) => setDimension(item.product, idx, "width", parseInt(e.target.value, 10) || 0)}
                            className="w-24 rounded-lg border border-rebu-stone bg-white px-3 py-2 text-sm focus:border-rebu-green focus:outline-none focus:ring-1 focus:ring-rebu-green/20"
                          />
                          <span className="text-sm text-neutral-400">×</span>
                          <input
                            type="number"
                            inputMode="numeric"
                            placeholder="Hoogte"
                            value={dim.height ?? ""}
                            onChange={(e) => setDimension(item.product, idx, "height", parseInt(e.target.value, 10) || 0)}
                            className="w-24 rounded-lg border border-rebu-stone bg-white px-3 py-2 text-sm focus:border-rebu-green focus:outline-none focus:ring-1 focus:ring-rebu-green/20"
                          />
                          <span className="text-xs text-neutral-400">cm</span>
                        </div>
                        <input
                          type="text"
                          placeholder="Opmerking (optioneel)"
                          value={dim.note ?? ""}
                          onChange={(e) => setDimension(item.product, idx, "note", e.target.value)}
                          className="min-w-[160px] flex-1 rounded-lg border border-rebu-stone bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-rebu-green focus:outline-none focus:ring-1 focus:ring-rebu-green/20"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* File upload */}
            <div className="mt-8 border-t border-rebu-stone pt-8">
              <h3 className="mb-2 font-display text-xl font-semibold text-rebu-charcoal">
                Foto's of tekeningen toevoegen
              </h3>
              <p className="mb-4 text-sm text-neutral-500">
                Voeg foto's toe van je huidige kozijnen, een plattegrond of een technische tekening. Dit helpt ons bij het maken van een nauwkeurige offerte.
              </p>
              <FileUpload
                files={data.attachments ?? []}
                onChange={(files) => setData((d) => ({ ...d, attachments: files }))}
              />
            </div>
          </StepShell>
        )}

        {/* Step 5: Specs */}
        {current.id === "specs" && (
          <StepShell title="Specificaties" subtitle="Nog niet zeker? Kies 'geen voorkeur' en wij adviseren.">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Merk voorkeur</p>
            <OptionGrid cols={4}>
              {(["geen-voorkeur", "schuco", "aluplast", "gealan"] as const).map((b) => (
                <MiniOption key={b} label={label(b)} selected={data.brand === b} onSelect={() => update("brand", b)} />
              ))}
            </OptionGrid>

            <p className="mt-8 mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Kleur buitenkant</p>
            <ColorPicker value={data.colorBuiten} onChange={(v) => update("colorBuiten", v)} />

            <p className="mt-8 mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Kleur binnenkant</p>
            <ColorPicker value={data.colorBinnen} onChange={(v) => update("colorBinnen", v)} />

            <p className="mt-8 mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Glastype</p>
            <OptionGrid cols={4}>
              {(["hr++", "triple", "inbraakwerend", "advies"] as const).map((g) => (
                <MiniOption key={g} label={label(g)} selected={data.glass === g} onSelect={() => update("glass", g)} />
              ))}
            </OptionGrid>
          </StepShell>
        )}

        {/* Step 6: Timeline */}
        {current.id === "timeline" && (
          <StepShell title="Wanneer wil je starten?" subtitle="Geen zorgen — dit is een inschatting, niet bindend.">
            <OptionGrid cols={2}>
              <BigOption icon={Sparkles} label={label("zo-snel-mogelijk")} description="Liefst binnen 4 weken" selected={data.timeline === "zo-snel-mogelijk"} onSelect={() => update("timeline", "zo-snel-mogelijk")} />
              <BigOption icon={Clock} label={label("1-3-maanden")} description="Planning al in zicht" selected={data.timeline === "1-3-maanden"} onSelect={() => update("timeline", "1-3-maanden")} />
              <BigOption icon={Clock} label={label("3-6-maanden")} description="Nog tijd om te beslissen" selected={data.timeline === "3-6-maanden"} onSelect={() => update("timeline", "3-6-maanden")} />
              <BigOption icon={HelpCircle} label={label("flexibel")} description="Ik oriënteer me nog" selected={data.timeline === "flexibel"} onSelect={() => update("timeline", "flexibel")} />
            </OptionGrid>
            <div className="mt-8">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Opmerkingen of wensen (optioneel)</label>
              <textarea className="input min-h-[100px] resize-y" placeholder="Bijv. specifieke wensen, bouwjaar woning..." value={data.notes ?? ""} onChange={(e) => update("notes", e.target.value)} />
            </div>
          </StepShell>
        )}

        {/* Step 7: Contact */}
        {current.id === "contact" && (
          <StepShell title="Jouw gegevens" subtitle="We gebruiken deze alleen om contact op te nemen over je offerte.">
            <div className="grid gap-4 md:grid-cols-2">
              {data.customerType === "zakelijk" && (
                <div className="md:col-span-2">
                  <Label>Bedrijfsnaam</Label>
                  <input className="input" value={data.companyName ?? ""} onChange={(e) => update("companyName", e.target.value)} placeholder="Jouw Bedrijf B.V." />
                </div>
              )}
              <div><Label>Voornaam *</Label><input className="input" value={data.firstName ?? ""} onChange={(e) => update("firstName", e.target.value)} /></div>
              <div><Label>Achternaam *</Label><input className="input" value={data.lastName ?? ""} onChange={(e) => update("lastName", e.target.value)} /></div>
              <div><Label>E-mailadres *</Label><input type="email" className="input" value={data.email ?? ""} onChange={(e) => update("email", e.target.value)} /></div>
              <div><Label>Telefoonnummer *</Label><input type="tel" className="input" value={data.phone ?? ""} onChange={(e) => update("phone", e.target.value)} placeholder="+31 6 ..." /></div>
              <div className="md:col-span-2"><Label>Straat *</Label><input className="input" value={data.street ?? ""} onChange={(e) => update("street", e.target.value)} /></div>
              <div><Label>Huisnummer *</Label><input className="input" value={data.houseNumber ?? ""} onChange={(e) => update("houseNumber", e.target.value)} /></div>
              <div><Label>Postcode *</Label><input className="input" value={data.postalCode ?? ""} onChange={(e) => update("postalCode", e.target.value)} placeholder="1521 RM" /></div>
              <div className="md:col-span-2"><Label>Woonplaats *</Label><input className="input" value={data.city ?? ""} onChange={(e) => update("city", e.target.value)} /></div>
            </div>
          </StepShell>
        )}

        {/* Step 8: Review */}
        {current.id === "review" && (
          <StepShell title="Even checken" subtitle="Controleer je gegevens, voeg eventueel een beschrijving toe en verstuur.">
            <div className="grid gap-4 md:grid-cols-2">
              <ReviewCard title="Type aanvraag" items={[
                ["Klant", label(data.customerType ?? "")],
                ["Project", label(data.projectType ?? "")],
                ["Dienst", label(data.service ?? "")],
                ["Houtlook", data.houtlookVerbinding ? "Ja, houtlook verbinding" : "Nee, standaard (verstek)"],
              ]} />
              <ReviewCard title="Specs" items={[
                ["Merk", label(data.brand ?? "")],
                ["Buiten", label(data.colorBuiten ?? "")],
                ["Binnen", label(data.colorBinnen ?? "")],
                ["Glas", label(data.glass ?? "")],
                ["Planning", label(data.timeline ?? "")],
              ]} />
            </div>

            {/* Items overview */}
            <div className="mt-4 rounded-2xl border border-rebu-stone bg-rebu-cream p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-rebu-green">Producten & afmetingen</p>
              {items.map((item) => (
                <div key={item.product} className="mb-4 last:mb-0">
                  <p className="font-semibold text-rebu-charcoal">{label(item.product)} — {item.quantity}×</p>
                  {item.dimensions && item.dimensions.some((d) => d.width || d.height) && (
                    <ul className="mt-1 space-y-0.5 text-sm text-neutral-600">
                      {item.dimensions.map((d, i) => (
                        (d.width || d.height) && (
                          <li key={i}>
                            #{i + 1}: {d.width ?? "?"}×{d.height ?? "?"} cm
                            {d.note && <span className="text-neutral-400"> — {d.note}</span>}
                          </li>
                        )
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <ReviewCard title="Contact" items={[
              ["Naam", `${data.firstName ?? ""} ${data.lastName ?? ""}`],
              ["E-mail", data.email ?? ""],
              ["Telefoon", data.phone ?? ""],
              ["Adres", `${data.street ?? ""} ${data.houseNumber ?? ""}, ${data.postalCode ?? ""} ${data.city ?? ""}`],
            ]} />

            {/* Attachments preview */}
            {(data.attachments?.length ?? 0) > 0 && (
              <div className="mt-4 rounded-2xl border border-rebu-stone bg-rebu-cream p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-rebu-green">Bijlagen</p>
                <div className="flex flex-wrap gap-2">
                  {data.attachments!.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs ring-1 ring-rebu-stone">
                      <FileImage className="h-3 w-3 text-rebu-green" />
                      <span className="max-w-[120px] truncate text-rebu-charcoal">{f.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mt-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Beschrijving van je project (optioneel)</label>
              <textarea
                className="input min-h-[120px] resize-y"
                placeholder="Geef hier een korte beschrijving van je project, speciale wensen of aanvullende informatie..."
                value={data.description ?? ""}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>

            <label className="mt-6 flex items-start gap-3 text-sm text-neutral-700">
              <input type="checkbox" className="mt-0.5 h-5 w-5 flex-none rounded border-rebu-stone text-rebu-green focus:ring-rebu-green" checked={data.consent ?? false} onChange={(e) => update("consent", e.target.checked)} />
              <span>Ik ga akkoord met de <Link href="/privacyverklaring" className="text-rebu-green underline">privacyverklaring</Link> en dat Rebu Kozijnen contact met mij opneemt over deze aanvraag.</span>
            </label>

            {status === "error" && (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                <div>
                  <p className="font-semibold">Er ging iets mis</p>
                  <p className="text-red-600">{errorMsg}</p>
                </div>
              </div>
            )}
          </StepShell>
        )}

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between border-t border-rebu-stone pt-6">
          <button type="button" onClick={prev} disabled={stepIndex === 0} className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-neutral-500 transition-colors hover:text-rebu-green-dark disabled:cursor-not-allowed disabled:opacity-30">
            <ArrowLeft className="h-4 w-4" /> Vorige
          </button>
          {current.id !== "review" ? (
            <button type="button" onClick={next} disabled={!canContinue} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
              Volgende <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" onClick={submit} disabled={!canContinue || status === "submitting"} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
              {status === "submitting" ? (<><Loader2 className="h-4 w-4 animate-spin" /> Versturen...</>) : (<>Verstuur aanvraag <ArrowRight className="h-4 w-4" /></>)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function StepShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <div><h2 className="font-display text-2xl font-semibold text-rebu-charcoal md:text-3xl">{title}</h2><p className="mt-2 text-neutral-600">{subtitle}</p><div className="mt-8">{children}</div></div>;
}

function OptionGrid({ cols, children }: { cols: 2 | 3 | 4; children: React.ReactNode }) {
  const map = { 2: "md:grid-cols-2", 3: "sm:grid-cols-2 md:grid-cols-3", 4: "sm:grid-cols-2 md:grid-cols-4" };
  return <div className={`grid gap-3 ${map[cols]}`}>{children}</div>;
}

function BigOption({ icon: Icon, label, description, selected, onSelect }: { icon: React.ComponentType<{ className?: string }>; label: string; description: string; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} className={`group relative flex items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all ${selected ? "border-rebu-green bg-rebu-green/5 shadow-soft" : "border-rebu-stone bg-white hover:border-rebu-green/40 hover:shadow-soft"}`}>
      <div className={`flex h-12 w-12 flex-none items-center justify-center rounded-xl transition-colors ${selected ? "bg-rebu-green text-white" : "bg-rebu-stone text-rebu-green"}`}><Icon className="h-5 w-5" /></div>
      <div className="flex-1 pr-6">
        <p className={`font-display text-lg font-semibold ${selected ? "text-rebu-green" : "text-rebu-charcoal"}`}>{label}</p>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      </div>
      {selected && <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-rebu-green text-white"><Check className="h-3 w-3" /></span>}
    </button>
  );
}

const COLOR_OPTIONS = [
  { v: "wit-9016" as const, color: "#ffffff", label: "Wit 9016 (zonder folie)" },
  { v: "wit-9001" as const, color: "#f5f0e6", label: "Crèmewit 9001 (zonder folie)" },
  { v: "wit-folie" as const, color: "#f8f8f5", label: "Wit met folie (nerf)" },
  { v: "creme" as const, color: "#ede4cc", label: "Crème met folie (nerf)" },
  { v: "antraciet" as const, color: "#3a3f42", label: "Antraciet (7016)" },
  { v: "zwart" as const, color: "#0d0d0d", label: "Zwart (9005)" },
  { v: "houtlook" as const, color: "linear-gradient(135deg,#8b5e3c,#6d4728)", label: "Houtlook (nerf)" },
  { v: "anders" as const, color: "transparent", label: "Anders / RAL op maat" },
] as const;

function ColorPicker({ value, onChange }: { value: string | undefined; onChange: (v: "wit-9016" | "wit-9001" | "wit-folie" | "creme" | "antraciet" | "zwart" | "houtlook" | "anders") => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {COLOR_OPTIONS.map((c) => (
        <button
          key={c.v}
          type="button"
          onClick={() => onChange(c.v)}
          className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${value === c.v ? "border-rebu-green bg-rebu-green/5" : "border-rebu-stone hover:border-rebu-green/40"}`}
        >
          <span
            className={`h-8 w-8 flex-none rounded-full ${c.v === "wit-9016" || c.v === "wit-9001" || c.v === "wit-folie" ? "ring-1 ring-neutral-300" : ""} ${c.v === "anders" ? "ring-2 ring-dashed ring-neutral-300" : ""}`}
            style={{ background: c.color }}
          />
          <span className="text-sm font-medium text-rebu-charcoal">{c.label}</span>
        </button>
      ))}
    </div>
  );
}

function MiniOption({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} className={`rounded-2xl border-2 px-4 py-4 text-sm font-semibold transition-all ${selected ? "border-rebu-green bg-rebu-green/5 text-rebu-green" : "border-rebu-stone bg-white text-rebu-charcoal hover:border-rebu-green/40"}`}>{label}</button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">{children}</label>;
}

function ReviewCard({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div className="mt-4 rounded-2xl border border-rebu-stone bg-rebu-cream p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-rebu-green">{title}</p>
      <dl className="space-y-2 text-sm">
        {items.map(([k, v]) => (<div key={k} className="flex gap-3"><dt className="w-20 flex-none text-neutral-500">{k}</dt><dd className="text-rebu-charcoal">{v || "—"}</dd></div>))}
      </dl>
    </div>
  );
}
