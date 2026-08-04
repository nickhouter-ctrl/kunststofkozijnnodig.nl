import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ProjectsGrid } from "@/components/ProjectsGrid";
import { CTASection } from "@/components/CTASection";
import { createServiceClient } from "@/lib/supabase";
import { projects as staticProjects } from "@/lib/projects";

export const metadata: Metadata = {
  alternates: { canonical: "/projecten" },
  title: "Projecten — zo werkt Kunststofkozijnnodig.nl",
  description: "Een selectie van recente projecten. Klik op een project om alle foto's en details te bekijken.",
};

export const revalidate = 60;

async function getProjects() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("projects")
      .select("slug, title, location, year, category, summary, cover, images")
      .eq("published", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) throw new Error("No data");

    return data.map((p: any) => ({
      slug: p.slug,
      title: p.title,
      location: p.location,
      year: p.year,
      category: p.category,
      summary: p.summary,
      cover: p.cover,
      imageCount: p.images?.length ?? 0,
    }));
  } catch {
    return staticProjects.map((p) => ({
      slug: p.slug,
      title: p.title,
      location: p.location,
      year: p.year,
      category: p.category,
      summary: p.summary,
      cover: p.cover,
      imageCount: p.gallery.length,
    }));
  }
}

export default async function ProjectenPage() {
  const projects = await getProjects();

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
          <ProjectsGrid projects={projects} />
        </div>
      </section>

      <CTASection />
    </>
  );
}
