import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, MapPin, Tag, Calendar, Check, Star, Quote } from "lucide-react";
import { createServiceClient, type Project } from "@/lib/supabase";
import { ProjectGallery } from "@/components/ProjectGallery";
import { CTASection } from "@/components/CTASection";
import { projects as staticProjects, getProject as getStaticProject } from "@/lib/projects";

export const revalidate = 60;

async function getProject(slug: string): Promise<Project | null> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase.from("projects").select("*").eq("slug", slug).eq("published", true).single();
    return data as Project | null;
  } catch { return null; }
}

async function getAllProjects() {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase.from("projects").select("slug, title, location, year, cover").eq("published", true).order("sort_order");
    return data ?? [];
  } catch {
    return staticProjects.map((p) => ({ slug: p.slug, title: p.title, location: p.location, year: p.year, cover: p.cover }));
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getProject(slug)) ?? getStaticProject(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    openGraph: { title: p.title, description: p.summary, images: p.cover ? [{ url: p.cover }] : undefined },
    alternates: { canonical: `/projecten/${slug}` },
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  const staticP = getStaticProject(slug);
  if (!project && !staticP) notFound();

  const p = project ?? { ...staticP!, id: staticP!.slug, review_text: null, review_name: null, review_rating: 5, images: staticP!.gallery, sort_order: 0, published: true, created_at: "", updated_at: "" };
  const allProjects = await getAllProjects();
  const currentIdx = allProjects.findIndex((x: any) => x.slug === slug);
  const nextProject = allProjects[(currentIdx + 1) % allProjects.length];
  const gallery = p.images?.length > 0 ? p.images : (staticP?.gallery ?? []);

  return (
    <>
      <section className="relative min-h-[70vh] overflow-hidden bg-rebu-green-dark text-white">
        {p.cover && <Image src={p.cover} alt={p.title} fill priority className="object-cover opacity-40" sizes="100vw" />}
        <div className="absolute inset-0 bg-gradient-to-t from-rebu-green-dark via-rebu-green-dark/80 to-rebu-green-dark/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-rebu-green-dark/90 via-rebu-green/30 to-transparent" />
        <div className="container-rebu relative flex min-h-[70vh] flex-col justify-end py-20">
          <Link href="/projecten" className="mb-8 inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"><ArrowLeft className="h-4 w-4" /> Terug</Link>
          <div className="flex flex-wrap items-center gap-3">
            <span className="chip border-white/25 bg-white/10 text-white"><Tag className="h-3 w-3" /> {p.category}</span>
            {p.location && <span className="chip border-white/20 bg-white/10 text-white/85"><MapPin className="h-3 w-3" /> {p.location}</span>}
            <span className="chip border-white/20 bg-white/10 text-white/85"><Calendar className="h-3 w-3" /> {p.year}</span>
          </div>
          <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-[1.05] md:text-7xl">{p.title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/80">{p.summary}</p>
        </div>
      </section>

      <section className="section bg-rebu-green text-white">
        <div className="container-rebu grid gap-14 lg:grid-cols-[1fr_380px]">
          <div>
            <span className="section-eyebrow text-rebu-cream/90">Over dit project</span>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">Wat we hebben geleverd</h2>
            <div className="mt-6 whitespace-pre-line text-lg leading-relaxed text-white/85">{p.description}</div>
            {p.review_text && (
              <div className="mt-10 border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-yellow-300">{[...Array(p.review_rating ?? 5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
                <blockquote className="mt-4 italic text-white/90"><Quote className="mb-2 h-5 w-5 text-white/40" />&ldquo;{p.review_text}&rdquo;</blockquote>
                {p.review_name && <p className="mt-3 text-sm font-semibold text-rebu-cream">— {p.review_name}</p>}
              </div>
            )}
          </div>
          <aside className="border border-white/15 bg-white/10 p-8 backdrop-blur-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-rebu-cream/90">Project details</h3>
            <dl className="mt-5 space-y-5 text-sm">
              <div><dt className="text-white/60">Type</dt><dd className="mt-1 font-medium">{p.category}</dd></div>
              {p.location && <div><dt className="text-white/60">Locatie</dt><dd className="mt-1 font-medium">{p.location}</dd></div>}
              <div><dt className="text-white/60">Jaar</dt><dd className="mt-1 font-medium">{p.year}</dd></div>
              <div><dt className="text-white/60">Producten</dt><dd className="mt-2 flex flex-wrap gap-1.5">{p.products.map((prod: string) => <span key={prod} className="inline-flex items-center gap-1 border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs text-white"><Check className="h-3 w-3" /> {prod}</span>)}</dd></div>
            </dl>
            <Link href="/offerte" className="btn-light mt-8 w-full">Soortgelijk project? <ArrowRight className="h-4 w-4" /></Link>
          </aside>
        </div>
      </section>

      <section className="section bg-rebu-green-dark text-white">
        <div className="container-rebu">
          <div className="mb-12"><span className="section-eyebrow text-rebu-cream/90">Fotogalerij</span><h2 className="mt-3 font-display text-3xl font-semibold md:text-5xl">Alle foto&apos;s</h2><p className="mt-3 text-white/70">{gallery.length} foto&apos;s — klik om groot te bekijken.</p></div>
          <ProjectGallery images={gallery} title={p.title} />
        </div>
      </section>

      {nextProject && (
        <section className="relative overflow-hidden bg-rebu-green py-24 text-white">
          {nextProject.cover && <div className="absolute inset-0 opacity-30"><Image src={nextProject.cover} alt="" fill className="object-cover" /></div>}
          <div className="absolute inset-0 bg-gradient-to-t from-rebu-green-dark via-rebu-green/70 to-rebu-green/40" />
          <div className="container-rebu relative text-center">
            <span className="section-eyebrow text-rebu-cream/90">Volgend project</span>
            <h3 className="mt-3 font-display text-4xl font-semibold md:text-6xl">{nextProject.title}</h3>
            <Link href={`/projecten/${nextProject.slug}`} className="btn-light mt-8">Bekijk project <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      )}
      <CTASection />
    </>
  );
}
