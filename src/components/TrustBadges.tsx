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
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20 transition-all group-hover:bg-white/20 group-hover:ring-white/40">
                <badge.icon className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-white sm:text-base">
                {badge.title}
              </h3>
              <p className="mt-1 text-xs text-white/60 sm:text-sm">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
