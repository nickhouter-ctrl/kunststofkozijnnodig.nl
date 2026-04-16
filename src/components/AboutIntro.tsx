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
    <section className="section bg-white">
      <div className="container-rebu grid items-center gap-14 lg:grid-cols-2">
        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl shadow-glow">
            <Image
              src="/images/villa-kozijn.jpg"
              alt="Rebu Kozijnen aan het werk"
              width={900}
              height={1100}
              className="h-[560px] w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 hidden rounded-2xl bg-rebu-green p-6 text-white shadow-glow md:block">
            <p className="font-display text-4xl font-semibold">100+</p>
            <p className="text-xs uppercase tracking-wider text-white/80">Projecten per jaar</p>
          </div>
        </div>

        <div>
          <span className="section-eyebrow">Wie zijn wij</span>
          <h2 className="section-title mt-3">
            Een jong team, <span className="italic text-rebu-green">ouderwets</span> vakmanschap.
          </h2>
          <p className="mt-6 text-lg text-neutral-600">
            Rebu Kozijnen wordt geleid door een enthousiast team jonge ondernemers met een grote passie voor hun vak. Wij plaatsen jouw kunststof kozijnen met veel liefde en aandacht, waarbij kwaliteit altijd voorop staat.
          </p>
          <p className="mt-4 text-neutral-600">
            Ons doel: iedereen topkwaliteit kozijnen bieden, geheel naar wens en met een lange levensduur, tegen scherpe prijzen.
          </p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-sm text-neutral-700">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-rebu-green/10 text-rebu-green">
                  <Check className="h-3 w-3" />
                </span>
                {h}
              </li>
            ))}
          </ul>

          <Link href="/over-ons" className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-rebu-green transition-colors hover:text-rebu-green-dark">
            Meer over Rebu Kozijnen <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
