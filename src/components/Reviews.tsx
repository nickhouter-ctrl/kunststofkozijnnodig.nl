import { Star, Quote } from "lucide-react";
import { reviews } from "@/lib/content";

export function Reviews() {
  return (
    <section className="section bg-rebu-cream">
      <div className="container-rebu">
        <div className="mx-auto max-w-3xl text-center">
          <span className="section-eyebrow">Wat klanten zeggen</span>
          <h2 className="section-title mt-3">
            5 sterren, keer op keer <span className="italic text-rebu-green">verdiend.</span>
          </h2>
          <div className="mt-5 flex items-center justify-center gap-2 text-sm text-neutral-600">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span>5,0 gemiddeld op Google — geverifieerd via Trustindex</span>
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <article key={r.name} className="card relative flex flex-col">
              <Quote className="absolute right-6 top-6 h-10 w-10 text-rebu-green/10" />
              <div className="flex gap-1">
                {[...Array(r.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-neutral-700">"{r.body}"</p>
              <div className="mt-6 flex items-center gap-3 border-t border-rebu-stone pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rebu-green/10 text-sm font-semibold text-rebu-green">
                  {r.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-rebu-charcoal">{r.name}</p>
                  <p className="text-xs text-neutral-500">{r.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
