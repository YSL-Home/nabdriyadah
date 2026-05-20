import articles from "../../content/articles/seo-articles.json";
import BreakingTicker from "./BreakingTicker";
import HomepageClient from "./HomepageClient";
import { getT, leagueNames, sportNames, siteName } from "../../lib/i18n";

function sortByDate(items) {
  return [...items].sort((a, b) => {
    const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return db - da;
  });
}

function hasTranslation(a, lang) {
  if (lang === "ar") return true;
  if (lang === "en") return !!(a.en_title || (a.sourceTitle && !/[؀-ۿ]/.test(a.sourceTitle)));
  if (lang === "fr") return !!(a.fr_title || a.en_title || (a.sourceTitle && !/[؀-ۿ]/.test(a.sourceTitle)));
  return true;
}

export default function LocalizedHomePage({ lang = "ar" }) {
  const tr = getT(lang);
  const prefix = lang === "ar" ? "" : `/${lang}`;
  const sorted = sortByDate(articles);

  // Pour EN/FR : on ne garde que les articles qui ont une traduction disponible
  const translated = lang === "ar" ? sorted : sorted.filter((a) => hasTranslation(a, lang));

  const recentBreaking = translated.filter((a) => {
    if (!a.publishedAt) return false;
    return Date.now() - new Date(a.publishedAt).getTime() < 24 * 60 * 60 * 1000;
  });
  const breaking  = (recentBreaking.length > 0 ? recentBreaking : translated).slice(0, 8);
  const featured  = translated[0] ?? null;
  const secondary = translated.slice(1, 3);
  const grid      = translated.slice(3, 9);
  const sidebar   = translated.slice(9, 15);
  const basketball = translated.filter((a) => a.sport === "basketball").slice(0, 4);
  const tennis     = translated.filter((a) => a.sport === "tennis").slice(0, 4);
  const padel      = translated.filter((a) => a.sport === "padel").slice(0, 4);

  const isRTL = lang === "ar";

  return (
    <div style={{ background: "var(--bg-page)", minHeight: "100vh", direction: isRTL ? "rtl" : "ltr" }}>
      <BreakingTicker items={breaking} lang={lang} prefix={prefix} />
      <div style={{ maxWidth: "1450px", margin: "0 auto", padding: "20px 16px 60px" }}>
        <HomepageClient
          featured={featured}
          secondary={secondary}
          grid={grid}
          sidebar={sidebar}
          basketball={basketball}
          tennis={tennis}
          padel={padel}
          lang={lang}
          prefix={prefix}
          tr={tr}
        />
      </div>
    </div>
  );
}
