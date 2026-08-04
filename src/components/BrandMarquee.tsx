import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { brands } from "@/lib/brands";

/** Slug van de merkpagina, zodat de logo's naar de specificaties linken. */
function brandHref(name: string): string | null {
  const match = brands.find((b) => b.name.toLowerCase() === name.toLowerCase());
  return match ? `/merken/${match.slug}` : null;
}

export function BrandMarquee() {
  const items = [...site.brands, ...site.brands, ...site.brands];
  return (
    <section className="border-y border-ink/10 bg-rebu-cream py-14">
      <div className="container-rebu">
        <p className="text-center text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-ink-soft">
          Wij werken met Europese topmerken
        </p>
        <div className="mt-8 overflow-hidden">
          <div className="flex w-max animate-marquee items-center gap-16">
            {items.map((b, i) => {
              const href = brandHref(b.name);
              // De marquee toont elk logo drie keer; alleen het eerste blok doet
              // mee voor toetsenbord en screenreaders, de rest is decoratief.
              const isDuplicate = i >= site.brands.length;
              const logo = (
                <Image
                  src={b.logo}
                  alt={isDuplicate ? "" : b.name}
                  width={160}
                  height={64}
                  className="max-h-12 w-auto object-contain"
                />
              );
              return (
                <div
                  key={`${b.name}-${i}`}
                  className="flex h-16 w-40 items-center justify-center grayscale transition-all hover:grayscale-0"
                  aria-hidden={isDuplicate || undefined}
                >
                  {href ? (
                    <Link href={href} tabIndex={isDuplicate ? -1 : undefined}>
                      {logo}
                    </Link>
                  ) : (
                    logo
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <p className="mt-8 text-center">
          <Link
            href="/merken"
            className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-rebu-green transition-colors hover:text-ink"
          >
            Alle profielsystemen vergelijken
          </Link>
        </p>
      </div>
    </section>
  );
}
