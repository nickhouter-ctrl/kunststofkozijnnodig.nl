import Link from "next/link";
import { ArrowRight, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <section className="flex min-h-[80vh] items-center justify-center bg-rebu-cream">
      <div className="container-rebu text-center">
        <p className="font-display text-8xl font-bold text-rebu-green/20 md:text-[12rem]">404</p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-rebu-charcoal md:text-5xl">
          Pagina niet gevonden
        </h1>
        <p className="mt-4 text-lg text-neutral-600">
          De pagina die je zoekt bestaat niet of is verplaatst.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-rebu-green px-6 py-3 text-sm font-semibold text-white hover:bg-rebu-green-dark"
          >
            <Home className="h-4 w-4" /> Naar homepage
          </Link>
          <Link
            href="/offerte"
            className="inline-flex items-center gap-2 rounded-full border border-rebu-green/20 bg-white px-6 py-3 text-sm font-semibold text-rebu-green hover:bg-rebu-green hover:text-white"
          >
            Offerte aanvragen <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/producten"
            className="inline-flex items-center gap-2 rounded-full border border-rebu-green/20 bg-white px-6 py-3 text-sm font-semibold text-rebu-green hover:bg-rebu-green hover:text-white"
          >
            <Search className="h-4 w-4" /> Producten bekijken
          </Link>
        </div>
      </div>
    </section>
  );
}
