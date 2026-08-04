import type { Metadata } from "next";

// De adminpagina is een client component en kan zelf geen metadata exporteren;
// daarom staat de noindex hier. Zonder dit is /admin gewoon indexeerbaar.
export const metadata: Metadata = {
  title: "Beheer",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
