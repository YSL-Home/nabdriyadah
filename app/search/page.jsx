import { Suspense } from "react";
import SearchClient from "./SearchClient";

export const metadata = {
  title: "بحث | نبض الرياضة",
  description: "ابحث في مقالات وأخبار نبض الرياضة.",
  alternates: { canonical: "https://nabdriyadah.com/search/" },
};

export default function SearchPage() {
  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px", direction: "rtl" }}>
      <Suspense
        fallback={
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-3)" }}>
            جاري التحميل…
          </div>
        }
      >
        <SearchClient />
      </Suspense>
    </main>
  );
}
