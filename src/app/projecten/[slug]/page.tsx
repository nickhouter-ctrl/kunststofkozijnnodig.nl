import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, MapPin, Tag, Calendar, Check } from "lucide-react";
import { getProject, projects } from "@/lib/projects";
import { ProjectGallery } from "@/components/ProjectGallery";
import { CTASection } from "@/components/CTASection";

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      images: [{ url: project.cover }],
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const currentIdx = projects.findIndex((p) => p.slug === slug);
  const nextProject = projects[(currentIdx + 1) % projects.length];

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[70vh] overflow-hidden bg-rebu-green-dark text-white">
        <Image
          src={project.cover}
          alt={project.title}
          fill
          priority
          className="object-cover opacity-40"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-rebu-green-dark via-rebu-green-dark/80 to-rebu-green-dark/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-rebu-green-dark/90 via-rebu-green/30 to-transparent" />

        <div className="container-rebu relative flex min-h-[70vh] flex-col justify-end py-20">
          <Link
            href="/projecten"
            className="mb-8 inline-flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Terug naar alle projecten
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <span className="chip bg-white/15 text-white ring-1 ring-white/25">
              <Tag className="h-3 w-3" /> {project.category}
            </span>
            <span className="chip bg-white/10 text-white/85 ring-1 ring-white/15">
              <MapPin className="h-3 w-3" /> {project.location}
            </span>
            <span className="chip bg-white/10 text-white/85 ring-1 ring-white/15">
              <Calendar className="h-3 w-3" /> {project.year}
            </span>
          </div>

          <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-[1.05] md:text-7xl">
            {project.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/80">{project.summary}</p>
        </div>
      </section>

      {/* Details */}
      <section className="section bg-rebu-green text-white">
        <div className="container-rebu grid gap-14 lg:grid-cols-[1fr_380px]">
          <div>
            <span className="section-eyebrow text-rebu-cream/90">Over dit project</span>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
              Wat we hebben gedaan
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-white/85">{project.description}</p>
          </div>

          <aside className="rounded-3xl border border-white/15 bg-white/10 p-8 backdrop-blur-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-rebu-cream/90">
              Project details
            </h3>
            <dl className="mt-5 space-y-5 text-sm">
              <div>
                <dt className="text-white/60">Type</dt>
                <dd className="mt-1 font-medium">{project.category}</dd>
              </div>
              <div>
                <dt className="text-white/60">Locatie</dt>
                <dd className="mt-1 font-medium">{project.location}</dd>
              </div>
              <div>
                <dt className="text-white/60">Jaar</dt>
                <dd className="mt-1 font-medium">{project.year}</dd>
              </div>
              <div>
                <dt className="text-white/60">Producten</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {project.products.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs text-white ring-1 ring-white/20"
                    >
                      <Check className="h-3 w-3" /> {p}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
            <Link
              href="/offerte"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-rebu-green-dark transition-colors hover:bg-rebu-cream"
            >
              Soortgelijk project? <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </section>

      {/* Gallery */}
      <section className="section bg-rebu-green-dark text-white">
        <div className="container-rebu">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="section-eyebrow text-rebu-cream/90">Fotogalerij</span>
              <h2 className="mt-3 font-display text-3xl font-semibold md:text-5xl">
                Alle foto's van dit project
              </h2>
              <p className="mt-3 text-white/70">
                {project.gallery.length} foto's — klik op een foto om 'm groot te bekijken.
              </p>
            </div>
          </div>
          <ProjectGallery images={project.gallery} title={project.title} />
        </div>
      </section>

      {/* Next project */}
      <section className="relative overflow-hidden bg-rebu-green py-24 text-white">
        <div className="absolute inset-0 opacity-30">
          <Image src={nextProject.cover} alt="" fill className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-rebu-green-dark via-rebu-green/70 to-rebu-green/40" />
        <div className="container-rebu relative text-center">
          <span className="section-eyebrow text-rebu-cream/90">Volgend project</span>
          <h3 className="mt-3 font-display text-4xl font-semibold md:text-6xl">
            {nextProject.title}
          </h3>
          <p className="mt-3 text-white/80">{nextProject.location} · {nextProject.year}</p>
          <Link
            href={`/projecten/${nextProject.slug}`}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold text-rebu-green-dark transition-transform hover:scale-105"
          >
            Bekijk project <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <CTASection />
    </>
  );
}
