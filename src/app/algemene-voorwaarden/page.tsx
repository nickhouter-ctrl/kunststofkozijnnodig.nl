import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Algemene voorwaarden",
  description: "Algemene voorwaarden van Kunststofkozijnnodig.nl.",
};

export default function AVPage() {
  return (
    <>
      <PageHero
        eyebrow="Juridisch"
        title="Algemene voorwaarden"
        description="De voorwaarden zoals deze van toepassing zijn op al onze leveringen en diensten."
        image="/images/project-latten-8.webp"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Algemene voorwaarden", href: "/algemene-voorwaarden" },
        ]}
      />
      <section className="section bg-white">
        <div className="container-rebu prose prose-neutral mx-auto max-w-3xl">
          <p>
            De algemene voorwaarden van Kunststofkozijnnodig.nl zijn op aanvraag beschikbaar. Stuur een e-mail naar
            info@rebukozijnen.nl voor de meest recente versie.
          </p>
        </div>
      </section>
    </>
  );
}
