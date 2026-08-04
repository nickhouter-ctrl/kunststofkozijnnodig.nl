import { z } from "zod";

const dimensionSchema = z.object({
  width: z.number().min(1, "Vul breedte in").optional(),
  height: z.number().min(1, "Vul hoogte in").optional(),
  note: z.string().max(200).optional(),
});

const quoteItemSchema = z.object({
  product: z.enum(["kozijnen", "deuren", "schuifpuien"]),
  quantity: z.number().int().min(1).max(99),
  dimensions: z.array(dimensionSchema).optional(),
});

export const quoteSchema = z.object({
  customerType: z.enum(["particulier", "zakelijk"]),
  projectType: z.enum(["renovatie", "nieuwbouw", "uitbouw", "anders"]),
  items: z.array(quoteItemSchema).min(1, "Selecteer minimaal 1 product"),
  service: z.enum(["leveren", "leveren-plaatsen"]),
  houtlookVerbinding: z.boolean().optional().default(false),
  brand: z.enum(["geen-voorkeur", "schuco", "aluplast", "gealan", "k-vision"]),
  colorBuiten: z.enum(["wit-9016", "wit-9001", "wit-folie", "creme", "antraciet", "zwart", "houtlook", "anders"]),
  colorBinnen: z.enum(["wit-9016", "wit-9001", "wit-folie", "creme", "antraciet", "zwart", "houtlook", "anders"]),
  glass: z.enum(["hr++", "triple", "inbraakwerend", "advies"]),
  timeline: z.enum(["zo-snel-mogelijk", "1-3-maanden", "3-6-maanden", "flexibel"]),
  notes: z.string().max(2000).optional().default(""),
  description: z.string().max(2000).optional().default(""),
  attachments: z.array(z.object({
    name: z.string(),
    type: z.string(),
    data: z.string(), // base64
  })).max(5).optional().default([]),

  firstName: z.string().min(2, "Vul je voornaam in"),
  lastName: z.string().min(2, "Vul je achternaam in"),
  email: z.string().email("Ongeldig e-mailadres"),
  phone: z.string().min(8, "Vul een geldig telefoonnummer in"),
  street: z.string().min(2, "Vul je straat in"),
  houseNumber: z.string().min(1, "Vul je huisnummer in"),
  postalCode: z.string().min(6, "Ongeldige postcode"),
  city: z.string().min(2, "Vul je woonplaats in"),
  companyName: z.string().optional().default(""),

  consent: z.boolean().refine((v) => v === true, "Je moet akkoord gaan met de privacyverklaring"),
});

export type QuoteData = z.infer<typeof quoteSchema>;
export type QuoteItem = z.infer<typeof quoteItemSchema>;
export type Dimension = z.infer<typeof dimensionSchema>;

export const LABELS: Record<string, string> = {
  particulier: "Particulier",
  zakelijk: "Zakelijk",
  renovatie: "Renovatie bestaande woning",
  nieuwbouw: "Nieuwbouw",
  uitbouw: "Uit- of aanbouw",
  anders: "Anders / weet ik nog niet",
  kozijnen: "Kozijnen",
  deuren: "Deuren",
  schuifpuien: "Schuifpuien",
  leveren: "Alleen leveren",
  "leveren-plaatsen": "Leveren + plaatsen",
  "geen-voorkeur": "Geen voorkeur — adviseer mij",
  schuco: "Schüco",
  aluplast: "Aluplast",
  gealan: "Gealan",
  "k-vision": "K-Vision",
  "wit-9016": "Wit (RAL 9016) zonder folie",
  "wit-9001": "Crèmewit (RAL 9001) zonder folie",
  "wit-folie": "Wit met folie (nerf)",
  creme: "Crème met folie (nerf)",
  antraciet: "Antraciet (RAL 7016)",
  zwart: "Zwart (RAL 9005)",
  houtlook: "Houtlook",
  "hr++": "HR++ glas",
  triple: "Triple glas",
  inbraakwerend: "Inbraakwerend glas",
  advies: "Advies op maat",
  "zo-snel-mogelijk": "Zo snel mogelijk",
  "1-3-maanden": "Binnen 1 – 3 maanden",
  "3-6-maanden": "Binnen 3 – 6 maanden",
  flexibel: "Flexibel",
};

export function label(key: string): string {
  return LABELS[key] ?? key;
}
