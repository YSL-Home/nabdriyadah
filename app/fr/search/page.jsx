import { Suspense } from "react";
import SearchClient from "../../search/SearchClient";

export const metadata = {
  title: "Recherche | Sports Pulse",
  description: "Recherchez des articles et actualités sur Sports Pulse.",
  alternates: { canonical: "https://nabdriyadah.com/fr/search/" },
};

export default function SearchPage() {
  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
      <Suspense
        fallback={
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-3)" }}>
            Chargement…
          </div>
        }
      >
        <SearchClient />
      </Suspense>
    </main>
  );
}
