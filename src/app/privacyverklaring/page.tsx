import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacyverklaring",
  description: "Privacyverklaring van Kunststofkozijnnodig.nl — hoe wij omgaan met persoonsgegevens.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Privacy"
        title="Privacyverklaring"
        description="Wij respecteren jouw privacy. Hieronder lees je hoe Kunststofkozijnnodig.nl omgaat met persoonsgegevens."
        image="/images/project-latten-4.webp"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Privacyverklaring", href: "/privacyverklaring" },
        ]}
      />
      <section className="section bg-white">
        <div className="container-rebu prose prose-neutral mx-auto max-w-3xl">
          <h2>Welke gegevens verwerken wij?</h2>
          <p>
            Wanneer je een offerte aanvraagt of contact met ons opneemt verwerken wij je naam, adres, e-mailadres,
            telefoonnummer en de details van je aanvraag. Deze gegevens gebruiken we uitsluitend om contact op te
            nemen en een offerte op maat op te stellen.
          </p>
          <h2>Hoe lang bewaren wij je gegevens?</h2>
          <p>
            Wij bewaren je gegevens niet langer dan noodzakelijk. Offerteaanvragen worden na afhandeling
            gearchiveerd volgens de wettelijke bewaartermijnen.
          </p>
          <h2>Jouw rechten</h2>
          <p>
            Je hebt recht op inzage, correctie en verwijdering van je gegevens. Stuur een e-mail naar{" "}
            <a href={site.emailHref}>{site.email}</a> voor een verzoek.
          </p>
          <h2>Cookies</h2>
          <p>
            Onze website gebruikt functionele cookies. Voor statistieken en marketing plaatsen we alleen cookies
            nadat je hier toestemming voor hebt gegeven.
          </p>
          <h2>Contact</h2>
          <p>
            {site.name}, {site.address.street}, {site.address.postalCode} {site.address.city}. Telefoon{" "}
            {site.phone}. E-mail <a href={site.emailHref}>{site.email}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
