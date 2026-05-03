"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import ArticleImage from "./ArticleImage";
import { leagueNames, sportNames } from "../../lib/i18n";

/* ── Title / description resolution by lang ───────────── */
function getTitle(article, lang) {
  if (lang === "en") return article.en_title || article.sourceTitle || article.title;
  if (lang === "fr") return article.fr_title || article.sourceTitle || article.title;
  return article.title;
}

function getDesc(article, lang) {
  if (lang === "en") return article.en_description || article.description;
  if (lang === "fr") return article.fr_description || article.description;
  return article.description;
}

function articleHref(slug, prefix) {
  return `${prefix}/articles/${slug}/`;
}

/* ── Sport / league badge label ──────────────────────── */
function sportLabel(league, sport, lang = "ar") {
  if (league && leagueNames[league]) return leagueNames[league][lang] || leagueNames[league].ar;
  if (sport  && sportNames[sport])   return sportNames[sport][lang]   || sportNames[sport].ar;
  return sportNames.football[lang] || "كرة القدم";
}

/* ── Sport accent color ──────────────────────────────── */
function sportAccent(league, sport) {
  if (league === "premier-league")   return "#7c3aed";
  if (league === "la-liga")          return "#ea580c";
  if (league === "bundesliga")       return "#dc2626";
  if (league === "serie-a")          return "#b45309";
  if (league === "ligue-1")          return "#1d4ed8";
  if (league === "champions-league") return "#d97706";
  if (league === "saudi-pro-league") return "#15803d";
  if (league === "eredivisie")       return "#dc2626";
  if (sport  === "basketball")       return "#c2410c";
  if (sport  === "tennis")           return "#15803d";
  if (sport  === "padel")            return "#7c3aed";
  if (sport  === "futsal")           return "#0f766e";
  return "#2563eb";
}

/* ── Date formatter ──────────────────────────────────── */
function formatDate(iso, lang = "ar") {
  if (!iso) return "";
  try {
    const locale = lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : "ar-SA-u-nu-latn";
    return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short" });
  } catch { return ""; }
}

/* ── See-all text ────────────────────────────────────── */
const SEE_ALL = { ar: "عرض الكل →", fr: "Voir tout →", en: "See all →" };
const LATEST  = { ar: "آخر المقالات", fr: "Derniers articles", en: "Latest articles" };

/* ── Motion presets ──────────────────────────────────── */
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

/* ── Badge ───────────────────────────────────────────── */
function Badge({ accent, children }) {
  return (
    <span style={{
      display:      "inline-block",
      padding:      "3px 9px",
      borderRadius: "999px",
      fontSize:     "11px",
      fontWeight:   700,
      color:        accent,
      background:   accent + "22",
      border:       `1px solid ${accent}44`,
      whiteSpace:   "nowrap",
    }}>
      {children}
    </span>
  );
}

/* ════════════════════════════════════════════════════════
   MAIN EXPORT
   ════════════════════════════════════════════════════════ */
export default function HomepageClient({
  featured, secondary, grid, sidebar,
  basketball, tennis, padel,
  lang = "ar", prefix = "", tr = {},
}) {
  const isRTL = lang === "ar";
  const seeAll = SEE_ALL[lang] || SEE_ALL.ar;

  return (
    <div>
      {/* ── HERO ZONE ─────────────────────────────────── */}
      <section style={{ marginBottom: "30px" }}>
        <div className="hero-layout">

          {/* Featured */}
          {featured && (
            <motion.div className="hero-featured" {...fadeUp(0)}>
              <Link href={articleHref(featured.slug, prefix)} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                <div className="card-hover hero-card-inner img-zoom" style={{
                  position: "relative", borderRadius: "20px", overflow: "hidden", height: "100%",
                  background: "var(--bg-card)", boxShadow: "var(--shadow)",
                  border: "1px solid var(--border)"
                }}>
                  <ArticleImage
                    src={featured.image} imageUrl={featured.imageUrl} alt={getTitle(featured, lang)}
                    sport={featured.sport} league={featured.league} slug={featured.slug}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)" }}
                  />
                  <div className="hero-overlay" style={{ position: "absolute", inset: 0 }} />
                  <div style={{ position: "absolute", top: "16px", [isRTL ? "right" : "left"]: "16px", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", padding: "5px 12px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.15)" }}>
                    <Badge accent={sportAccent(featured.league, featured.sport)}>
                      {sportLabel(featured.league, featured.sport, lang)}
                    </Badge>
                  </div>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 24px 26px" }}>
                    <div style={{ fontSize: "clamp(18px, 2.2vw, 28px)", fontWeight: 800, color: "white", lineHeight: 1.45, marginBottom: "10px", direction: isRTL ? "rtl" : "ltr" }}>
                      {getTitle(featured, lang)}
                    </div>
                    <p style={{ margin: 0, fontSize: "14px", color: "rgba(255,255,255,0.65)", lineHeight: 1.75, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", direction: isRTL ? "rtl" : "ltr" }}>
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
                    <div className="card-hover hero-sec-inner img-zoom" style={{
                      position: "relative", borderRadius: "16px", overflow: "hidden", height: "100%",
                      background: "var(--bg-card)", boxShadow: "var(--shadow)",
                      border: "1px solid var(--border)"
                    }}>
                      <ArticleImage
                        src={article.image} imageUrl={article.imageUrl} alt={getTitle(article, lang)}
                        sport={article.sport} league={article.league} slug={article.slug}
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)" }}
                      />
                      <div className="hero-overlay" style={{ position: "absolute", inset: 0 }} />
                      <div style={{ position: "absolute", top: "12px", [isRTL ? "right" : "left"]: "12px" }}>
                        <Badge accent={accent}>{sportLabel(article.league, article.sport, lang)}</Badge>
                      </div>
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 16px" }}>
                        <div style={{ fontSize: "14px", fontWeight: 800, color: "white", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", direction: isRTL ? "rtl" : "ltr" }}>
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

      {/* ── LATEST NEWS ───────────────────────────────── */}
      <SectionHeader
        title={tr.latestNews || "Latest news"}
        href={`${prefix}/sport/football/`}
        seeAll={seeAll}
        delay={0.15}
      />

      <div className="content-layout" style={{ marginBottom: "36px" }}>
        {/* 3-col grid */}
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

        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: isRTL ? -16 : 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.2, ease }}
        >
          <SidebarList
            articles={sidebar}
            title={`📋 ${LATEST[lang]}`}
            lang={lang}
            prefix={prefix}
          />
        </motion.aside>
      </div>

      {/* ── OTHER SPORTS ──────────────────────────────── */}
      {basketball.length > 0 && (
        <SportRow
          articles={basketball}
          label={`🏀 ${tr.basketball || "Basketball"}`}
          href={`${prefix}/sport/basketball/`}
          accent="#c2410c"
          lang={lang}
          prefix={prefix}
          seeAll={seeAll}
        />
      )}
      {tennis.length > 0 && (
        <SportRow
          articles={tennis}
          label={`🎾 ${tr.tennis || "Tennis"}`}
          href={`${prefix}/sport/tennis/`}
          accent="#15803d"
          lang={lang}
          prefix={prefix}
          seeAll={seeAll}
        />
      )}
      {padel.length > 0 && (
        <SportRow
          articles={padel}
          label={`🏸 ${tr.padel || "Padel"}`}
          href={`${prefix}/sport/padel/`}
          accent="#7c3aed"
          lang={lang}
          prefix={prefix}
          seeAll={seeAll}
        />
      )}
    </div>
  );
}

/* ── Section header ──────────────────────────────────── */
function SectionHeader({ title, href, seeAll, delay = 0 }) {
  return (
    <motion.div
      {...fadeUp(delay)}
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}
    >
      <h2 style={{ margin: 0, fontSize: "19px", fontWeight: 800, color: "var(--text-1)", display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ display: "block", width: "4px", height: "22px", borderRadius: "2px", background: "var(--grad-accent, var(--section-bar))", flexShrink: 0, boxShadow: "0 0 10px var(--accent-glow)" }} />
        {title}
      </h2>
      {href && (
        <Link href={href} className="btn-ghost" style={{ fontSize: "12px", padding: "6px 14px" }}>
          {seeAll}
        </Link>
      )}
    </motion.div>
  );
}

/* ── News card ───────────────────────────────────────── */
function NewsCard({ article, lang, prefix }) {
  const accent = sportAccent(article.league, article.sport);
  const isRTL  = lang === "ar";
  return (
    <motion.div variants={staggerChild}>
      <Link href={articleHref(article.slug, prefix)} style={{ textDecoration: "none", display: "block" }}>
        <div
          className="card-hover news-card-inner img-zoom"
          style={{
            background:    "var(--bg-card)",
            borderRadius:  "14px",
            overflow:      "hidden",
            border:        "1px solid var(--news-card-border)",
            boxShadow:     "var(--shadow)",
          }}
        >
          <ArticleImage
            src={article.image} imageUrl={article.imageUrl} alt={getTitle(article, lang)}
            sport={article.sport} league={article.league} slug={article.slug}
            style={{ height: "155px", display: "block", transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)" }}
          />
          <div style={{ padding: "13px 14px" }}>
            <div style={{ marginBottom: "7px", display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap" }}>
              <Badge accent={accent}>{sportLabel(article.league, article.sport, lang)}</Badge>
              {article.publishedAt && (
                <span style={{ color: "var(--text-3)", fontSize: "11px" }}>
                  {formatDate(article.publishedAt, lang)}
                </span>
              )}
            </div>
            <h3 style={{
              margin: "0 0 5px 0", fontSize: "14px", fontWeight: 800,
              color: "var(--text-1)", lineHeight: 1.55,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
              direction: isRTL ? "rtl" : "ltr",
            }}>
              {getTitle(article, lang)}
            </h3>
            <p style={{
              margin: 0, fontSize: "12px", color: "var(--text-2)", lineHeight: 1.7,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
              direction: isRTL ? "rtl" : "ltr",
            }}>
              {getDesc(article, lang)}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Sidebar list ────────────────────────────────────── */
function SidebarList({ articles, title, lang, prefix }) {
  const isRTL = lang === "ar";
  return (
    <div style={{
      background:    "var(--bg-card)",
      borderRadius:  "16px",
      border:        "1px solid var(--border)",
      boxShadow:     "var(--shadow)",
      overflow:      "hidden",
    }}>
      <div style={{ padding: "13px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg-soft)" }}>
        <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-1)" }}>{title}</span>
      </div>
      {articles.map((article, i) => {
        const accent = sportAccent(article.league, article.sport);
        return (
          <Link key={article.slug} href={articleHref(article.slug, prefix)} style={{ textDecoration: "none", display: "block" }}>
            <div
              className="sidebar-row"
              style={{
                padding:      "11px 16px",
                borderBottom: i < articles.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div style={{ marginBottom: "4px" }}>
                <Badge accent={accent}>{sportLabel(article.league, article.sport, lang)}</Badge>
              </div>
              <div style={{
                fontSize: "13px", fontWeight: 700, color: "var(--text-1)", lineHeight: 1.55,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                direction: isRTL ? "rtl" : "ltr",
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

/* ── Sport row ───────────────────────────────────────── */
function SportRow({ articles, label, href, accent, lang, prefix, seeAll }) {
  const isRTL = lang === "ar";
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
              <div className="card-hover img-zoom" style={{
                background:    "var(--bg-card)",
                borderRadius:  "14px",
                overflow:      "hidden",
                border:        "1px solid var(--border)",
                boxShadow:     "var(--shadow)",
              }}>
                <ArticleImage
                  src={article.image} imageUrl={article.imageUrl} alt={getTitle(article, lang)}
                  sport={article.sport} league={article.league} slug={article.slug}
                  style={{ height: "130px", display: "block", transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)" }}
                />
                <div style={{ padding: "11px 12px" }}>
                  <div style={{ marginBottom: "5px" }}>
                    <Badge accent={ac}>{sportLabel(article.league, article.sport, lang)}</Badge>
                  </div>
                  <div style={{
                    fontSize: "13px", fontWeight: 800, color: "var(--text-1)", lineHeight: 1.5,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    direction: isRTL ? "rtl" : "ltr",
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
