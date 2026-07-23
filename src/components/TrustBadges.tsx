import { ShieldCheck, Award, BadgeCheck, Clock } from "lucide-react";

const badges = [
  {
    icon: ShieldCheck,
    title: "SKG 2-ster certificaat",
    description: "Inbraakwerend conform Politiekeurmerk",
  },
  {
    icon: Award,
    title: "KOMO keurmerk",
    description: "Onafhankelijk kwaliteitskeurmerk",
  },
  {
    icon: BadgeCheck,
    title: "Laagste prijs garantie",
    description: "Altijd de scherpste prijs voor topkwaliteit",
  },
  {
    icon: Clock,
    title: "30+ jaar garantie",
    description: "Duurzame kozijnen die meegaan",
  },
];

export function TrustBadges() {
  return (
    <section className="bg-rebu-green-dark py-14">
      <div className="container-rebu">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
          {badges.map((badge) => (
            <div
              key={badge.title}
              className="group flex flex-col items-center text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center border border-white/12 bg-white/5 text-white transition-colors group-hover:bg-white/10 group-hover:border-white/30">
                <badge.icon className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <h3 className="mt-4 font-display text-base font-medium text-white sm:text-lg">
                {badge.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-white/60 sm:text-sm">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
