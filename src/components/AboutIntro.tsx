import Image from "next/image";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

const highlights = [
  "Eigen team van ervaren monteurs",
  "Persoonlijk advies van eigenaar Nick",
  "Duitse topkwaliteit (SKG 2‑ster)",
  "Levering & montage in heel Nederland",
  "Korte lijnen met de fabriek",
  "Ook internationaal leverbaar",
];

export function AboutIntro() {
  return (
    <section className="section bg-paper">
      <div className="container-rebu grid items-center gap-14 lg:grid-cols-2">
        <div className="relative">
          <div className="relative overflow-hidden border border-ink/10">
            <Image
              src="/images/villa-kozijn.jpg"
              alt="Kunststofkozijnnodig.nl aan het werk"
              width={900}
              height={1100}
              className="h-[560px] w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 hidden bg-rebu-green-dark p-6 text-white md:block">
            <p className="font-display text-4xl font-medium">100+</p>
            <p className="mt-1 text-[0.72rem] uppercase tracking-[0.16em] text-white/70">Projecten per jaar</p>
          </div>
        </div>

        <div>
          <span className="eyebrow">Wie zijn wij</span>
          <h2 className="mt-5 font-display text-3xl font-medium leading-[1.06] tracking-[-0.01em] text-ink sm:text-4xl md:text-[2.7rem]">
            Een jong team, <span className="italic text-rebu-green">ouderwets</span> vakmanschap.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-ink-soft md:text-[1.05rem]">
            Kunststofkozijnnodig.nl wordt geleid door een enthousiast team jonge ondernemers met een grote passie voor hun vak. Wij plaatsen jouw kunststof kozijnen met veel liefde en aandacht, waarbij kwaliteit altijd voorop staat.
          </p>
          <p className="mt-4 text-ink-soft">
            Ons doel: iedereen topkwaliteit kozijnen bieden, geheel naar wens en met een lange levensduur, tegen scherpe prijzen.
          </p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-sm text-ink-soft">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center bg-rebu-green/10 text-rebu-green">
                  <Check className="h-3 w-3" />
                </span>
                {h}
              </li>
            ))}
          </ul>

          <Link href="/over-ons" className="link-underline mt-10">
            Meer over Kunststofkozijnnodig.nl <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
