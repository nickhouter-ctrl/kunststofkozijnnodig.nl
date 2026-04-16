import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  breadcrumb,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  breadcrumb: { label: string; href: string }[];
}) {
  return (
    <section className="relative overflow-hidden bg-rebu-green-dark text-white">
      <div className="absolute inset-0">
        <Image src={image} alt="" fill priority className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-rebu-green-dark via-rebu-green/85 to-rebu-green-dark" />
        <div className="absolute inset-0 bg-gradient-to-t from-rebu-green-dark via-transparent to-transparent" />
      </div>

      {/* Lighter green glow */}
      <div className="pointer-events-none absolute -left-40 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-rebu-green-light/25 blur-3xl" />

      <div className="container-rebu relative py-20 md:py-28">
        <nav className="mb-6 flex items-center gap-2 text-xs text-white/70">
          {breadcrumb.map((b, i) => (
            <span key={b.href} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="h-3 w-3" />}
              <Link href={b.href} className="transition-colors hover:text-white">
                {b.label}
              </Link>
            </span>
          ))}
        </nav>
        <span className="section-eyebrow text-rebu-cream/90">{eyebrow}</span>
        <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-tight md:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-white/80">{description}</p>
      </div>
    </section>
  );
}
