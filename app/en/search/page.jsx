import { Suspense } from "react";
import SearchClient from "../../search/SearchClient";

export const metadata = {
  title: "Search | Sports Pulse",
  description: "Search articles and news on Sports Pulse.",
  alternates: { canonical: "https://nabdriyadah.com/en/search/" },
};

export default function SearchPage() {
  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
      <Suspense
        fallback={
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-3)" }}>
            Loading…
          </div>
        }
      >
        <SearchClient />
      </Suspense>
    </main>
  );
}
