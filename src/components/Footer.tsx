import Link from "next/link";
import { MessageCircle, MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";

const productLinks = [
  { label: "Kozijnen", href: "/producten/kozijnen" },
  { label: "Deuren", href: "/producten/deuren" },
  { label: "Schuifpuien", href: "/producten/schuifpuien" },
  { label: "Projecten", href: "/projecten" },
];

const companyLinks = [
  { label: "Zakelijk", href: "/zakelijk" },
  { label: "Over ons", href: "/over-ons" },
  { label: "Prijzen", href: "/prijzen" },
  { label: "Particulier", href: "/particulier" },
];

const serviceLinks = [
  { label: "Offerte aanvragen", href: "/offerte" },
  { label: "Veelgestelde vragen", href: "/veelgestelde-vragen" },
  { label: "Besparing", href: "/besparing" },
  { label: "Contact", href: "/contact" },
];

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-white/45">{title}</h3>
      <ul className="mt-5 space-y-3 text-sm">
        {links.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="text-white/75 transition-colors hover:text-white">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-rebu-green-dark text-white">
      <div className="container-rebu py-20 md:py-24">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/logo-white.svg" alt={site.name} className="h-12 w-auto md:h-14" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/60">{site.description}</p>
            <ul className="mt-8 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-none text-rebu-green-light" />
                <span className="text-white/75">
                  {site.address.street}
                  <br />
                  {site.address.postalCode} {site.address.city}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 flex-none text-rebu-green-light" />
                <a href={site.phoneHref} className="text-white/75 transition-colors hover:text-white">
                  {site.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 flex-none text-rebu-green-light" />
                <a href={site.emailHref} className="text-white/75 transition-colors hover:text-white">
                  {site.email}
                </a>
              </li>
            </ul>
            <a
              href={site.social.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 border border-white/25 px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-white hover:text-rebu-green-dark"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-6 lg:col-start-7">
            <FooterColumn title="Assortiment" links={productLinks} />
            <FooterColumn title="Bedrijf" links={companyLinks} />
            <FooterColumn title="Service" links={serviceLinks} />
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-white/12 pt-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="font-display text-2xl font-medium leading-snug text-white">
              Een project in de planning?
            </p>
            <Link href="/offerte" className="mt-4 inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-rebu-green-light hover:text-white">
              Vraag een projectofferte aan <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="text-xs text-white/45 lg:text-right">
            <p>© {new Date().getFullYear()} {site.name}</p>
            <p className="mt-1">KvK {site.kvk} · BTW {site.btw}</p>
            <div className="mt-3 flex gap-5 lg:justify-end">
              <Link href="/privacyverklaring" className="hover:text-white">Privacy</Link>
              <Link href="/algemene-voorwaarden" className="hover:text-white">Voorwaarden</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
