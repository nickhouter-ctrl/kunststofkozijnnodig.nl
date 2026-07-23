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
    <section className="relative overflow-hidden border-b border-ink/10 bg-rebu-cream">
      <div className="container-rebu relative grid gap-12 py-16 md:grid-cols-2 md:items-end md:py-24">
        <div>
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-[0.7rem] uppercase tracking-[0.16em] text-ink-soft">
            {breadcrumb.map((b, i) => (
              <span key={b.href} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="h-3 w-3 text-ink-soft/50" />}
                <Link href={b.href} className="transition-colors hover:text-ink">
                  {b.label}
                </Link>
              </span>
            ))}
          </nav>
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="mt-5 max-w-2xl font-display text-4xl font-medium leading-[1.04] tracking-[-0.01em] text-ink md:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">{description}</p>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-[5/4]">
          <Image src={image} alt="" fill priority sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
        </div>
      </div>
    </section>
  );
}
