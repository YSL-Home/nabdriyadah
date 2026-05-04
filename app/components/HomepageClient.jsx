"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import ArticleImage from "./ArticleImage";

/* ── Language helpers ───────────────────────────────── */
function getTitle(a, lang) {
  if (lang === "en") return a.en_title || a.sourceTitle || a.title;
  if (lang === "fr") return a.fr_title || a.sourceTitle || a.title;
  return a.title;
}
function getDesc(a, lang) {
  if (lang === "en") return a.en_description || a.description;
  if (lang === "fr") return a.fr_description || a.description;
  return a.description;
}
function articleHref(slug, prefix) {
  return `${prefix}/articles/${slug}/`;
}

/* ── Sport label (multilingual) ─────────────────────── */
const SPORT_LABELS = {
  "premier-league":   { ar: "الإنجليزي",    fr: "Premier League",     en: "Premier League"    },
  "la-liga":          { ar: "الإسباني",     fr: "La Liga",            en: "La Liga"           },
  "bundesliga":       { ar: "البوندسليغا",  fr: "Bundesliga",         en: "Bundesliga"        },
  "serie-a":          { ar: "السيريا آ",    fr: "Serie A",            en: "Serie A"           },
  "ligue-1":          { ar: "الليغ 1",      fr: "Ligue 1",            en: "Ligue 1"           },
  "champions-league": { ar: "أبطال أوروبا", fr: "Ligue des Champions", en: "Champions League"  },
  "saudi-pro-league": { ar: "السعودي",      fr: "Saudi Pro League",   en: "Saudi Pro League"  },
  "eredivisie":       { ar: "الهولندي",     fr: "Eredivisie",         en: "Eredivisie"        },
  "mls":              { ar: "MLS",           fr: "MLS",                en: "MLS"               },
};
const SPORT_FALLBACK = {
  basketball: { ar: "كرة السلة", fr: "Basketball", en: "Basketball" },
  tennis:     { ar: "التنس",    fr: "Tennis",     en: "Tennis"     },
  padel:      { ar: "البادل",   fr: "Padel",      en: "Padel"      },
  futsal:     { ar: "الصالات",  fr: "Futsal",     en: "Futsal"     },
  football:   { ar: "كرة القدم", fr: "Football",  en: "Football"   },
};
function sportLabel(league, sport, lang = "ar") {
  const l = SPORT_LABELS[league];
  if (l) return l[lang] || l.ar;
  const s = SPORT_FALLBACK[sport];
  if (s) return s[lang] || s.ar;
  return SPORT_FALLBACK.football[lang];
}

/* ── UI strings ─────────────────────────────────────── */
const UI = {
  latestNews:   { ar: "أحدث الأخبار",    fr: "Dernières actualités", en: "Latest News"       },
  lastArticles: { ar: "📋 آخر المقالات", fr: "📋 Derniers articles", en: "📋 Latest Articles"  },
  seeAll:       { ar: "عرض الكل ←",      fr: "Voir tout →",          en: "See all →"          },
  basketball:   { ar: "🏀 كرة السلة",    fr: "🏀 Basketball",        en: "🏀 Basketball"       },
  tennis:       { ar: "🎾 التنس",         fr: "🎾 Tennis",            en: "🎾 Tennis"           },
  padel:        { ar: "🏸 البادل",        fr: "🏸 Padel",             en: "🏸 Padel"            },
};
function ui(key, lang) { return UI[key]?.[lang] || UI[key]?.ar || key; }

/* ── Date formatting ────────────────────────────────── */
function formatDate(iso, lang = "ar") {
  if (!iso) return "";
  try {
    const locale = lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : "ar-SA-u-nu-latn";
    return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short" });
  } catch { return ""; }
}

/* ── Sport accent colors ────────────────────────────── */
function sportAccent(league, sport) {
  if (league === "premier-league")   return "#7c3aed";
  if (league === "la-liga")          return "#ea580c";
  if (league === "bundesliga")       return "#dc2626";
  if (league === "serie-a")          return "#b45309";
  if (league === "ligue-1")          return "#1d4ed8";
  if (league === "champions-league") return "#d97706";
  if (league === "saudi-pro-league") return "#15803d";
  if (sport === "basketball")        return "#c2410c";
  if (sport === "tennis")            return "#15803d";
  if (sport === "padel")             return "#7c3aed";
  if (sport === "futsal")            return "#0f766e";
  return "#2563eb";
}

/* ── Motion presets ─────────────────────────────────── */
const ease = [0.22, 1, 0.36, 1];
const fadeUp = (delay = 0, y = 28) => ({
  initial:    { opacity: 0, y },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease },
});
const staggerList = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const staggerChild = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

/* ── Badge ─────────────────────────────────────────── */
function Badge({ accent, children }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 9px", borderRadius: "999px",
      fontSize: "11px", fontWeight: 700, color: accent,
      background: accent + "22", border: `1px solid ${accent}44`,
    }}>
      {children}
    </span>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════ */
export default function HomepageClient({
  featured, secondary, grid, sidebar,
  basketball, tennis, padel,
  lang = "ar", prefix = "",
}) {
  const isRTL = lang === "ar";
  const dir   = isRTL ? "rtl" : "ltr";

  return (
    <div style={{ direction: dir }}>

      {/* ── HERO ─────────────────────────────────────── */}
      <section style={{ marginBottom: "30px" }}>
        <div className="hero-layout">

          {/* Featured */}
          {featured && (
            <motion.div className="hero-featured" {...fadeUp(0)}>
              <Link href={articleHref(featured.slug, prefix)} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                <div className="card-hover hero-card-inner" style={{
                  position: "relative", borderRadius: "20px", overflow: "hidden", height: "100%",
                  background: "var(--bg-card)", boxShadow: "var(--shadow)", border: "1px solid var(--border)",
                }}>
                  <ArticleImage
                    src={featured.image} imageUrl={featured.imageUrl} alt={getTitle(featured, lang)}
                    sport={featured.sport} league={featured.league} slug={featured.slug}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)" }} />
                  <div style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", padding: "5px 12px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.15)" }}>
                    <Badge accent={sportAccent(featured.league, featured.sport)}>
                      {sportLabel(featured.league, featured.sport, lang)}
                    </Badge>
                  </div>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 24px 26px", direction: dir }}>
                    <div style={{ fontSize: "clamp(18px,2.2vw,28px)", fontWeight: 800, color: "white", lineHeight: 1.45, marginBottom: "10px" }}>
                      {getTitle(featured, lang)}
                    </div>
                    <p style={{ margin: 0, fontSize: "14px", color: "rgba(255,255,255,0.65)", lineHeight: 1.75, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {getDesc(featured, lang)}
                    </p>
                    {featured.publishedAt && (
                      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginTop: "10px" }}>
                        {formatDate(featured.publishedAt, lang)}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Secondary column */}
          <div className="hero-secondary">
            {secondary.map((article, i) => {
              const accent = sportAccent(article.league, article.sport);
              return (
                <motion.div key={article.slug} {...fadeUp(0.12 + i * 0.1)} style={{ flex: 1 }}>
                  <Link href={articleHref(article.slug, prefix)} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                    <div className="card-hover hero-sec-inner" style={{
                      position: "relative", borderRadius: "16px", overflow: "hidden", height: "100%",
                      background: "var(--bg-card)", boxShadow: "var(--shadow)", border: "1px solid var(--border)",
                    }}>
                      <ArticleImage
                        src={article.image} imageUrl={article.imageUrl} alt={getTitle(article, lang)}
                        sport={article.sport} league={article.league} slug={article.slug}
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                      />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)" }} />
                      <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                        <Badge accent={accent}>{sportLabel(article.league, article.sport, lang)}</Badge>
                      </div>
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 16px", direction: dir }}>
                        <div style={{ fontSize: "14px", fontWeight: 800, color: "white", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {getTitle(article, lang)}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── LATEST NEWS ──────────────────────────────── */}
      <SectionHeader
        title={ui("latestNews", lang)}
        href={`${prefix}/sport/football/`}
        seeAll={ui("seeAll", lang)}
        delay={0.15}
      />

      <div className="content-layout" style={{ marginBottom: "36px" }}>
        <motion.div
          className="news-grid"
          variants={staggerList}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {grid.map((article) => (
            <NewsCard key={article.slug} article={article} lang={lang} prefix={prefix} />
          ))}
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, x: isRTL ? -16 : 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.2, ease }}
        >
          <SidebarList articles={sidebar} title={ui("lastArticles", lang)} lang={lang} prefix={prefix} />
        </motion.aside>
      </div>

      {/* ── OTHER SPORTS ─────────────────────────────── */}
      {basketball.length > 0 && (
        <SportRow
          articles={basketball}
          label={ui("basketball", lang)}
          href={`${prefix}/sport/basketball/`}
          seeAll={ui("seeAll", lang)}
          accent="#c2410c"
          lang={lang} prefix={prefix}
        />
      )}
      {tennis.length > 0 && (
        <SportRow
          articles={tennis}
          label={ui("tennis", lang)}
          href={`${prefix}/sport/tennis/`}
          seeAll={ui("seeAll", lang)}
          accent="#15803d"
          lang={lang} prefix={prefix}
        />
      )}
      {padel.length > 0 && (
        <SportRow
          articles={padel}
          label={ui("padel", lang)}
          href={`${prefix}/sport/padel/`}
          seeAll={ui("seeAll", lang)}
          accent="#7c3aed"
          lang={lang} prefix={prefix}
        />
      )}
    </div>
  );
}

/* ── Section header ─────────────────────────────────── */
function SectionHeader({ title, href, seeAll = "عرض الكل ←", delay = 0 }) {
  return (
    <motion.div
      {...fadeUp(delay)}
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}
    >
      <h2 style={{ margin: 0, fontSize: "19px", fontWeight: 800, color: "var(--text-1)", display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ display: "block", width: "4px", height: "20px", borderRadius: "2px", background: "var(--section-bar)", flexShrink: 0 }} />
        {title}
      </h2>
      {href && (
        <Link href={href} style={{ color: "var(--section-link)", fontSize: "12px", fontWeight: 700, textDecoration: "none" }}>
          {seeAll}
        </Link>
      )}
    </motion.div>
  );
}

/* ── News card ──────────────────────────────────────── */
function NewsCard({ article, lang, prefix }) {
  const accent = sportAccent(article.league, article.sport);
  return (
    <motion.div variants={staggerChild}>
      <Link href={articleHref(article.slug, prefix)} style={{ textDecoration: "none", display: "block" }}>
        <div className="card-hover news-card-inner" style={{
          background: "var(--bg-card)", borderRadius: "14px", overflow: "hidden",
          border: "1px solid var(--news-card-border)", boxShadow: "var(--shadow)",
        }}>
          <ArticleImage
            src={article.image} imageUrl={article.imageUrl} alt={getTitle(article, lang)}
            sport={article.sport} league={article.league} slug={article.slug}
            style={{ height: "155px", display: "block" }}
          />
          <div style={{ padding: "13px 14px" }}>
            <div style={{ marginBottom: "7px", display: "flex", alignItems: "center", gap: "7px" }}>
              <Badge accent={accent}>{sportLabel(article.league, article.sport, lang)}</Badge>
              {article.publishedAt && (
                <span style={{ color: "var(--text-3)", fontSize: "11px" }}>
                  {formatDate(article.publishedAt, lang)}
                </span>
              )}
            </div>
            <h3 style={{
              margin: "0 0 5px 0", fontSize: "14px", fontWeight: 800, color: "var(--text-1)",
              lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {getTitle(article, lang)}
            </h3>
            <p style={{
              margin: 0, fontSize: "12px", color: "var(--text-2)", lineHeight: 1.7,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {getDesc(article, lang)}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Sidebar list ───────────────────────────────────── */
function SidebarList({ articles, title, lang, prefix }) {
  return (
    <div style={{
      background: "var(--bg-card)", borderRadius: "16px",
      border: "1px solid var(--border)", boxShadow: "var(--shadow)", overflow: "hidden",
    }}>
      <div style={{ padding: "13px 16px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-1)" }}>{title}</span>
      </div>
      {articles.map((article, i) => {
        const accent = sportAccent(article.league, article.sport);
        return (
          <Link key={article.slug} href={articleHref(article.slug, prefix)} style={{ textDecoration: "none", display: "block" }}>
            <div className="sidebar-row" style={{
              padding: "11px 16px",
              borderBottom: i < articles.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <div style={{ marginBottom: "4px" }}>
                <Badge accent={accent}>{sportLabel(article.league, article.sport, lang)}</Badge>
              </div>
              <div style={{
                fontSize: "13px", fontWeight: 700, color: "var(--text-1)", lineHeight: 1.55,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
              }}>
                {getTitle(article, lang)}
              </div>
              {article.publishedAt && (
                <div style={{ color: "var(--text-3)", fontSize: "11px", marginTop: "4px" }}>
                  {formatDate(article.publishedAt, lang)}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/* ── Sport row ──────────────────────────────────────── */
function SportRow({ articles, label, href, seeAll, lang, prefix }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease }}
      style={{ marginBottom: "32px" }}
    >
      <SectionHeader title={label} href={href} seeAll={seeAll} />
      <div className="sport-row">
        {articles.map((article) => {
          const ac = sportAccent(article.league, article.sport);
          return (
            <Link key={article.slug} href={articleHref(article.slug, prefix)} style={{ textDecoration: "none", display: "block" }} className="sport-row-card">
              <div className="card-hover" style={{
                background: "var(--bg-card)", borderRadius: "14px", overflow: "hidden",
                border: "1px solid var(--border)", boxShadow: "var(--shadow)",
              }}>
                <ArticleImage
                  src={article.image} imageUrl={article.imageUrl} alt={getTitle(article, lang)}
                  sport={article.sport} league={article.league} slug={article.slug}
                  style={{ height: "130px", display: "block" }}
                />
                <div style={{ padding: "11px 12px" }}>
                  <div style={{ marginBottom: "5px" }}>
                    <Badge accent={ac}>{sportLabel(article.league, article.sport, lang)}</Badge>
                  </div>
                  <div style={{
                    fontSize: "13px", fontWeight: 800, color: "var(--text-1)", lineHeight: 1.5,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {getTitle(article, lang)}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.section>
  );
}
