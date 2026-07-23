import { workflow } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";

export function Workflow() {
  return (
    <section className="section bg-paper">
      <div className="container-rebu">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="eyebrow justify-center">Hoe wij te werk gaan</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-5 font-display text-3xl font-medium leading-[1.06] tracking-[-0.01em] text-ink sm:text-4xl md:text-[2.7rem]">
              Een helder <span className="italic text-rebu-green">6-stappenplan</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-soft md:text-[1.05rem]">
              Van het eerste inmeetmoment tot de laatste PUR‑afwerking — je weet precies wat er gebeurt en wanneer.
            </p>
          </Reveal>
        </div>

        <ol className="mt-16 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {workflow.map((s, idx) => (
            <Reveal as="li" key={s.step} delay={idx * 0.05}>
              <div className="border-t border-ink/15 pt-6">
                <span className="font-display text-4xl font-medium text-rebu-green/40">{s.step}</span>
                <h3 className="mt-3 font-display text-xl font-medium leading-snug text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
