import { workflow } from "@/lib/content";

export function Workflow() {
  return (
    <section className="section bg-white">
      <div className="container-rebu">
        <div className="mx-auto max-w-3xl text-center">
          <span className="section-eyebrow">Hoe wij te werk gaan</span>
          <h2 className="section-title mt-3">
            Een helder <span className="italic text-rebu-green">6-stappenplan</span>
          </h2>
          <p className="mt-5 text-lg text-neutral-600">
            Van het eerste inmeetmoment tot de laatste PUR‑afwerking — je weet precies wat er gebeurt en wanneer.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workflow.map((s) => (
            <div
              key={s.step}
              className="group relative overflow-hidden rounded-2xl border border-rebu-stone bg-rebu-cream p-8 transition-all hover:border-rebu-green hover:shadow-soft"
            >
              <div className="flex items-start justify-between">
                <span className="font-display text-5xl font-semibold text-rebu-green/20 transition-colors group-hover:text-rebu-green/40">
                  {s.step}
                </span>
                <div className="mt-2 h-px w-16 bg-rebu-green/30" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-rebu-charcoal">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
