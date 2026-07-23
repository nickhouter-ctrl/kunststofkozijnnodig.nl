import Image from "next/image";
import { site } from "@/lib/site";

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
            {items.map((b, i) => (
              <div
                key={`${b.name}-${i}`}
                className="flex h-16 w-40 items-center justify-center grayscale transition-all hover:grayscale-0"
              >
                <Image
                  src={b.logo}
                  alt={b.name}
                  width={160}
                  height={64}
                  className="max-h-12 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
