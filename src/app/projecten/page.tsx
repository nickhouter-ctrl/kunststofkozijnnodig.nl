import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ProjectsGrid } from "@/components/ProjectsGrid";
import { CTASection } from "@/components/CTASection";

export const metadata: Metadata = {
  title: "Projecten — zo werkt Rebu Kozijnen",
  description: "Een selectie van recente projecten van Rebu Kozijnen. Klik op een project om alle foto's en details te bekijken.",
};

export default function ProjectenPage() {
  return (
    <>
      <PageHero
        eyebrow="Onze projecten"
        title="Elke gevel een verhaal."
        description="Klik op een project om alle foto's, details en gebruikte producten te bekijken."
        image="/images/project-zaandam-3.jpg"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Projecten", href: "/projecten" },
        ]}
      />

      <section className="section bg-rebu-green-dark text-white">
        <div className="container-rebu">
          <ProjectsGrid />
        </div>
      </section>

      <CTASection />
    </>
  );
}
