import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Neem vrijblijvend contact op met Rebu Kozijnen in Wormerveer. Telefoon, WhatsApp, e-mail of kom langs op afspraak.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Neem contact op"
        title="Liever direct contact? Wij staan voor je klaar."
        description="Bel, mail of stuur een WhatsApp-bericht — we reageren meestal binnen een paar uur. Voor een offerte op maat kun je ook direct onze configurator invullen."
        image="/images/hero-main.jpg"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Contact", href: "/contact" },
        ]}
      />

      <section className="section bg-white">
        <div className="container-rebu grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <div className="card">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rebu-green/10 text-rebu-green">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">Bezoekadres</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  {site.address.street}
                  <br />
                  {site.address.postalCode} {site.address.city}
                </p>
                <a
                  href="https://www.google.nl/maps/dir//Rebu+kozijnen+-+Kunststof+kozijnen.,+Samsonweg+26+F,+1521+RM+Wormerveer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-rebu-green hover:text-rebu-green-dark"
                >
                  Route plannen <ArrowRight className="h-3 w-3" />
                </a>
              </div>

              <div className="card">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rebu-green/10 text-rebu-green">
                  <Phone className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">Bel direct</h3>
                <a href={site.phoneHref} className="mt-2 block text-sm text-neutral-600 hover:text-rebu-green">
                  {site.phone}
                </a>
                <a
                  href={site.social.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-rebu-green hover:text-rebu-green-dark"
                >
                  <MessageCircle className="h-3 w-3" /> WhatsApp ons
                </a>
              </div>

              <div className="card">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rebu-green/10 text-rebu-green">
                  <Mail className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">E-mail</h3>
                <a href={site.emailHref} className="mt-2 block text-sm text-neutral-600 hover:text-rebu-green">
                  {site.email}
                </a>
              </div>

              <div className="card">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rebu-green/10 text-rebu-green">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">Openingstijden</h3>
                <ul className="mt-2 space-y-1 text-sm text-neutral-600">
                  {site.hours.map((h) => (
                    <li key={h.day} className="flex justify-between gap-4">
                      <span>{h.day}</span>
                      <span className="text-neutral-500">{h.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-3xl shadow-soft">
              <iframe
                title="Rebu Kozijnen locatie"
                src="https://maps.google.com/maps?q=Samsonweg+26F+Wormerveer&t=&z=14&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="480"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="border-0"
              />
            </div>

            <div className="mt-10 rounded-3xl bg-rebu-green p-10 text-white">
              <h2 className="font-display text-3xl font-semibold md:text-4xl">
                Liever direct een offerte?
              </h2>
              <p className="mt-3 max-w-xl text-white/80">
                Gebruik onze stap-voor-stap configurator en ontvang binnen 1 werkdag een prijs op maat.
              </p>
              <Link href="/offerte" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-rebu-green-dark hover:bg-rebu-cream">
                Start offerte <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
