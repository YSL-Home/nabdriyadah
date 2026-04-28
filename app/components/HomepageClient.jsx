"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import ArticleImage from "./ArticleImage";

/* ── Utilities ─────────────────────────────────────── */
function sportLabel(league, sport) {
  const map = {
    "premier-league":   "الإنجليزي",
    "la-liga":          "الإسباني",
    "bundesliga":       "البوندسليغا",
    "serie-a":          "السيريا آ",
    "ligue-1":          "الليغ 1",
    "champions-league": "أبطال أوروبا",
    "saudi-pro-league": "السعودي",
    "eredivisie":       "الهولندي",
  };
  if (map[league]) return map[league];
  if (sport === "basketball") return "كرة السلة";
  if (sport === "tennis")     return "التنس";
  if (sport === "padel")      return "البادل";
  if (sport === "futsal")     return "الصالات";
  return "كرة القدم";
}

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

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("ar-SA-u-nu-latn", { day: "numeric", month: "short" });
  } catch { return ""; }
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
      display:      "inline-block",
      padding:      "3px 9px",
      borderRadius: "999px",
      fontSize:     "11px",
      fontWeight:   700,
      color:        accent,
      background:   accent + "22",
      border:       `1px solid ${accent}44`,
    }}>
      {children}
    </span>
  );
}

/* ── Main ─────────────────────────────────────────── */
export default function HomepageClient({ featured, secondary, grid, sidebar, basketball, tennis, padel }) {
  return (
    <div>
      {/* ── HERO ZONE ─────────────────────────────────── */}
      <section style={{ marginBottom: "30px" }}>
        <div className="hero-layout">

          {/* Featured */}
          {featured && (
            <motion.div className="hero-featured" {...fadeUp(0)}>
              <Link href={`/articles/${featured.slug}/`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                <div className="card-hover hero-card-inner" style={{
                  position: "relative", borderRadius: "20px", overflow: "hidden", height: "100%",
                  background: "var(--bg-card)", boxShadow: "var(--shadow)",
                  border: "1px solid var(--border)"
                }}>
                  <ArticleImage
                    src={featured.image} imageUrl={featured.imageUrl} alt={featured.title}
                    sport={featured.sport} league={featured.league} slug={featured.slug}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                  />
                  {/* Gradient overlay — fonctionne dans les 2 thèmes car l'image a un fond */}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)" }} />
                  {/* League badge */}
                  <div style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", padding: "5px 12px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.15)" }}>
                    <Badge accent={sportAccent(featured.league, featured.sport)}>
                      {sportLabel(featured.league, featured.sport)}
                    </Badge>
                  </div>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 24px 26px" }}>
                    <div style={{ fontSize: "clamp(18px, 2.2vw, 28px)", fontWeight: 800, color: "white", lineHeight: 1.45, marginBottom: "10px" }}>
                      {featured.title}
                    </div>
                    <p style={{ margin: 0, fontSize: "14px", color: "rgba(255,255,255,0.65)", lineHeight: 1.75, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {featured.description}
                    </p>
                    {featured.publishedAt && (
                      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginTop: "10px" }}>
                        {formatDate(featured.publishedAt)}
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
                  <Link href={`/articles/${article.slug}/`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                    <div className="card-hover hero-sec-inner" style={{
                      position: "relative", borderRadius: "16px", overflow: "hidden", height: "100%",
                      background: "var(--bg-card)", boxShadow: "var(--shadow)",
                      border: "1px solid var(--border)"
                    }}>
                      <ArticleImage
                        src={article.image} imageUrl={article.imageUrl} alt={article.title}
                        sport={article.sport} league={article.league} slug={article.slug}
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                      />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)" }} />
                      <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                        <Badge accent={accent}>{sportLabel(article.league, article.sport)}</Badge>
                      </div>
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 16px" }}>
                        <div style={{ fontSize: "14px", fontWeight: 800, color: "white", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {article.title}
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
      <SectionHeader title="أحدث الأخبار" href="/sport/football/" delay={0.15} />

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
            <NewsCard key={article.slug} article={article} />
          ))}
        </motion.div>

        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.2, ease }}
        >
          <SidebarList articles={sidebar} title="📋 آخر المقالات" />
        </motion.aside>
      </div>

      {/* ── OTHER SPORTS ──────────────────────────────── */}
      {basketball.length > 0 && (
        <SportRow sport="basketball" articles={basketball} label="🏀 كرة السلة" href="/sport/basketball/" accent="#c2410c" />
      )}
      {tennis.length > 0 && (
        <SportRow sport="tennis" articles={tennis} label="🎾 التنس" href="/sport/tennis/" accent="#15803d" />
      )}
      {padel.length > 0 && (
        <SportRow sport="padel" articles={padel} label="🏸 البادل" href="/sport/padel/" accent="#7c3aed" />
      )}
    </div>
  );
}

/* ── Section header ──────────────────────────────────── */
function SectionHeader({ title, href, delay = 0 }) {
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
          عرض الكل ←
        </Link>
      )}
    </motion.div>
  );
}

/* ── News card ───────────────────────────────────────── */
function NewsCard({ article }) {
  const accent = sportAccent(article.league, article.sport);
  return (
    <motion.div variants={staggerChild}>
      <Link href={`/articles/${article.slug}/`} style={{ textDecoration: "none", display: "block" }}>
        <div
          className="card-hover news-card-inner"
          style={{
            background:    "var(--bg-card)",
            borderRadius:  "14px",
            overflow:      "hidden",
            border:        "1px solid var(--news-card-border)",
            boxShadow:     "var(--shadow)",
          }}
        >
          <ArticleImage
            src={article.image} imageUrl={article.imageUrl} alt={article.title}
            sport={article.sport} league={article.league} slug={article.slug}
            style={{ height: "155px", display: "block" }}
          />
          <div style={{ padding: "13px 14px" }}>
            <div style={{ marginBottom: "7px", display: "flex", alignItems: "center", gap: "7px" }}>
              <Badge accent={accent}>{sportLabel(article.league, article.sport)}</Badge>
              {article.publishedAt && (
                <span style={{ color: "var(--text-3)", fontSize: "11px" }}>
                  {formatDate(article.publishedAt)}
                </span>
              )}
            </div>
            <h3 style={{
              margin: "0 0 5px 0", fontSize: "14px", fontWeight: 800,
              color: "var(--text-1)", lineHeight: 1.55,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
            }}>
              {article.title}
            </h3>
            <p style={{
              margin: 0, fontSize: "12px", color: "var(--text-2)", lineHeight: 1.7,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
            }}>
              {article.description}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Sidebar list ───────────────────────────────────── */
function SidebarList({ articles, title }) {
  return (
    <div style={{
      background:    "var(--bg-card)",
      borderRadius:  "16px",
      border:        "1px solid var(--border)",
      boxShadow:     "var(--shadow)",
      overflow:      "hidden",
    }}>
      <div style={{ padding: "13px 16px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-1)" }}>{title}</span>
      </div>
      {articles.map((article, i) => {
        const accent = sportAccent(article.league, article.sport);
        return (
          <Link key={article.slug} href={`/articles/${article.slug}/`} style={{ textDecoration: "none", display: "block" }}>
            <div
              className="sidebar-row"
              style={{
                padding:      "11px 16px",
                borderBottom: i < articles.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div style={{ marginBottom: "4px" }}>
                <Badge accent={accent}>{sportLabel(article.league, article.sport)}</Badge>
              </div>
              <div style={{
                fontSize: "13px", fontWeight: 700, color: "var(--text-1)", lineHeight: 1.55,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
              }}>
                {article.title}
              </div>
              {article.publishedAt && (
                <div style={{ color: "var(--text-3)", fontSize: "11px", marginTop: "4px" }}>
                  {formatDate(article.publishedAt)}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/* ── Sport row ────────────────────────────────────── */
function SportRow({ articles, label, href, accent }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease }}
      style={{ marginBottom: "32px" }}
    >
      <SectionHeader title={label} href={href} />
      <div className="sport-row">
        {articles.map((article) => {
          const ac = sportAccent(article.league, article.sport);
          return (
            <Link key={article.slug} href={`/articles/${article.slug}/`} style={{ textDecoration: "none", display: "block" }} className="sport-row-card">
              <div className="card-hover" style={{
                background:    "var(--bg-card)",
                borderRadius:  "14px",
                overflow:      "hidden",
                border:        "1px solid var(--border)",
                boxShadow:     "var(--shadow)",
              }}>
                <ArticleImage
                  src={article.image} imageUrl={article.imageUrl} alt={article.title}
                  sport={article.sport} league={article.league} slug={article.slug}
                  style={{ height: "130px", display: "block" }}
                />
                <div style={{ padding: "11px 12px" }}>
                  <div style={{ marginBottom: "5px" }}>
                    <Badge accent={ac}>{sportLabel(article.league, article.sport)}</Badge>
                  </div>
                  <div style={{
                    fontSize: "13px", fontWeight: 800, color: "var(--text-1)", lineHeight: 1.5,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                  }}>
                    {article.title}
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
