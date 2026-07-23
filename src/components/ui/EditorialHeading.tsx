import { Reveal } from "./Reveal";

export function EditorialHeading({
  eyebrow,
  title,
  text,
  align = "left",
  tone = "dark",
  className,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
}) {
  const light = tone === "light";
  return (
    <div className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""} ${className ?? ""}`}>
      {eyebrow && (
        <Reveal>
          <span className={`eyebrow ${light ? "is-light" : ""} ${align === "center" ? "justify-center" : ""}`}>
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2
          className={`mt-5 font-display text-3xl font-medium leading-[1.06] tracking-[-0.01em] sm:text-4xl md:text-[2.7rem] ${
            light ? "text-white" : "text-ink"
          }`}
        >
          {title}
        </h2>
      </Reveal>
      {text && (
        <Reveal delay={0.1}>
          <p className={`mt-5 max-w-2xl text-base leading-relaxed md:text-[1.05rem] ${light ? "text-white/70" : "text-ink-soft"}`}>
            {text}
          </p>
        </Reveal>
      )}
    </div>
  );
}
