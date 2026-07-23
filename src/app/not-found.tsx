import Link from "next/link";
import { ArrowRight, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <section className="flex min-h-[80vh] items-center justify-center bg-rebu-cream">
      <div className="container-rebu text-center">
        <p className="font-display text-8xl font-medium text-rebu-green/20 md:text-[12rem]">404</p>
        <h1 className="mt-4 font-display text-3xl font-medium text-ink md:text-5xl">
          Pagina niet gevonden
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          De pagina die je zoekt bestaat niet of is verplaatst.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/" className="btn-primary">
            <Home className="h-4 w-4" /> Naar homepage
          </Link>
          <Link href="/offerte" className="btn-secondary">
            Offerte aanvragen <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/producten" className="btn-ghost">
            <Search className="h-4 w-4" /> Producten bekijken
          </Link>
        </div>
      </div>
    </section>
  );
}
