"use client";
import { useState, useMemo, useCallback, useEffect } from "react";

const ITEMS_PER_PAGE = 24;
import Link from "next/link";
import ArticleImage from "./ArticleImage";

/* ── i18n ──────────────────────────────────────────── */
const T = {
  ar: {
    search: "ابحث بكلمة مفتاحية، فريق، لاعب...",
    sport: "الرياضة", all: "الكل", date: "التاريخ",
    competition: "البطولة", topic: "الموضوع",
    h24: "آخر 24 ساعة", w1: "آخر أسبوع", m1: "آخر شهر", allTime: "كل الوقت",
    results: (n) => `${n} نتيجة`, noResults: "لا توجد نتائج لهذا البحث",
    reset: "إعادة ضبط الفلاتر", sortNew: "الأحدث أولاً", sortOld: "الأقدم أولاً",
    sort: "ترتيب",
    sports: { football:"كرة القدم", basketball:"كرة السلة", tennis:"التنس", padel:"البادل", futsal:"الصالات" },
    leagues: {
      "premier-league":"الإنجليزي","la-liga":"الإسباني","bundesliga":"البوندسليغا",
      "serie-a":"السيريا آ","ligue-1":"الليغ 1","champions-league":"أبطال أوروبا",
      "saudi-pro-league":"السعودي","eredivisie":"الهولندي","mixed":"مختلطة",
    },
  },
  en: {
    search: "Search by keyword, team, player...",
    sport: "Sport", all: "All", date: "Date",
    competition: "Competition", topic: "Topic",
    h24: "Last 24h", w1: "Last week", m1: "Last month", allTime: "All time",
    results: (n) => `${n} results`, noResults: "No results for this search",
    reset: "Reset filters", sortNew: "Newest first", sortOld: "Oldest first",
    sort: "Sort",
    sports: { football:"Football", basketball:"Basketball", tennis:"Tennis", padel:"Padel", futsal:"Futsal" },
    leagues: {
      "premier-league":"Premier League","la-liga":"La Liga","bundesliga":"Bundesliga",
      "serie-a":"Serie A","ligue-1":"Ligue 1","champions-league":"Champions League",
      "saudi-pro-league":"Saudi Pro League","eredivisie":"Eredivisie","mixed":"Mixed",
    },
  },
  fr: {
    search: "Rechercher par mot-clé, équipe, joueur...",
    sport: "Sport", all: "Tout", date: "Date",
    competition: "Compétition", topic: "Thème",
    h24: "Dernières 24h", w1: "Dernière semaine", m1: "Dernier mois", allTime: "Tout",
    results: (n) => `${n} résultats`, noResults: "Aucun résultat pour cette recherche",
    reset: "Réinitialiser", sortNew: "Plus récent d'abord", sortOld: "Plus ancien d'abord",
    sort: "Trier",
    sports: { football:"Football", basketball:"Basketball", tennis:"Tennis", padel:"Padel", futsal:"Futsal" },
    leagues: {
      "premier-league":"Premier League","la-liga":"La Liga","bundesliga":"Bundesliga",
      "serie-a":"Série A","ligue-1":"Ligue 1","champions-league":"Ligue des Champions",
      "saudi-pro-league":"Saudi Pro League","eredivisie":"Eredivisie","mixed":"Mixte",
    },
  },
};

function fmtDate(iso, lang = "ar") {
  if (!iso) return "";
  try {
    const locale = lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : "ar-SA-u-nu-latn";
    return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  } catch { return ""; }
}

function hasArabic(text) { return /[؀-ۿ]/.test(text || ""); }

function getTitle(a, lang) {
  if (lang === "en") {
    if (a.en_title) return a.en_title;
    if (a.sourceTitle && !hasArabic(a.sourceTitle)) return a.sourceTitle;
    return null; // filtered out for non-Arabic pages
  }
  if (lang === "fr") {
    // Priorité : titre FR → titre EN → sourceTitle non-arabe → masqué
    if (a.fr_title) return a.fr_title;
    if (a.en_title) return a.en_title;               // fallback EN (mieux que RSS brut ou arabe)
    if (a.sourceTitle && !hasArabic(a.sourceTitle)) return a.sourceTitle;
    return null;
  }
  return a.title;
}
function getDesc(a, lang) {
  if (lang === "en") return a.en_description || (!hasArabic(a.description) ? a.description : "") || "";
  if (lang === "fr") return a.fr_description || a.en_description || (!hasArabic(a.description) ? a.description : "") || "";
  return a.description;
}

/* ── Select chip ────────────────────────────────────── */
function Chip({ label, active, onClick, accent = "#4f8eff" }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 14px", borderRadius: "999px", border: `1.5px solid ${active ? accent : "var(--border)"}`,
        background: active ? accent + "22" : "var(--bg-soft)",
        color: active ? accent : "var(--text-2)",
        fontWeight: active ? 700 : 500, fontSize: "13px", cursor: "pointer",
        transition: "all 0.15s", whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

/* ── Filter Select ──────────────────────────────────── */
function FilterSelect({ value, onChange, options, placeholder, accent = "#4f8eff" }) {
  const active = value !== "";
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: "8px 32px 8px 12px", borderRadius: "12px",
        border: `1.5px solid ${active ? accent : "var(--border)"}`,
        background: active ? accent + "15" : "var(--bg-soft)",
        color: active ? accent : "var(--text-2)",
        fontWeight: active ? 700 : 500, fontSize: "13px", cursor: "pointer",
        appearance: "none", WebkitAppearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "left 10px center",
        minWidth: "130px",
      }}
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════ */
export default function ArticleFiltersClient({
  articles = [],
  lang = "ar",
  prefix = "",
  primaryColor = "#4f8eff",
  showSportFilter = false,
}) {
  const t = T[lang] || T.ar;
  const isRTL = lang === "ar";

  const [keyword,     setKeyword]     = useState("");
  const [sportFilter, setSportFilter] = useState("");
  const [leagueFilter,setLeagueFilter]= useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [dateFilter,  setDateFilter]  = useState("");
  const [sortOrder,   setSortOrder]   = useState("new");
  const [page,        setPage]        = useState(1);

  /* ── Extract unique values from articles ── */
  const sports  = useMemo(() => [...new Set(articles.map(a => a.sport).filter(Boolean))], [articles]);
  const leagues = useMemo(() => [...new Set(articles.map(a => a.league).filter(x => x && x !== "mixed"))], [articles]);
  const topics  = useMemo(() => [...new Set(articles.flatMap(a => a.topicTags || []).filter(Boolean))].slice(0, 12), [articles]);

  const dateOptions = [
    { value: "24h", label: t.h24 },
    { value: "7d",  label: t.w1  },
    { value: "30d", label: t.m1  },
  ];

  const hasFilters = keyword || sportFilter || leagueFilter || topicFilter || dateFilter;

  const resetFilters = useCallback(() => {
    setKeyword(""); setSportFilter(""); setLeagueFilter("");
    setTopicFilter(""); setDateFilter(""); setSortOrder("new");
  }, []);

  /* ── Filter + sort ── */
  const filtered = useMemo(() => {
    const now = Date.now();
    const cutoffs = { "24h": 86400000, "7d": 604800000, "30d": 2592000000 };
    const kw = keyword.trim().toLowerCase();

    let result = articles.filter(a => {
      // For non-Arabic langs, hide articles without a proper translated title
      if (lang !== "ar" && !getTitle(a, lang)) return false;
      if (sportFilter  && a.sport   !== sportFilter)  return false;
      if (leagueFilter && a.league  !== leagueFilter) return false;
      if (topicFilter  && !(a.topicTags || []).includes(topicFilter)) return false;
      if (dateFilter) {
        const age = now - new Date(a.publishedAt || 0).getTime();
        if (age > cutoffs[dateFilter]) return false;
      }
      if (kw) {
        const haystack = [
          getTitle(a, lang), getDesc(a, lang),
          a.sourceTitle, ...(a.topicTags || []), a.keywords?.join(" ") || ""
        ].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(kw)) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      const da = new Date(a.publishedAt || 0).getTime();
      const db = new Date(b.publishedAt || 0).getTime();
      return sortOrder === "new" ? db - da : da - db;
    });

    return result;
  }, [articles, keyword, sportFilter, leagueFilter, topicFilter, dateFilter, sortOrder, lang]);

  useEffect(() => { setPage(1); }, [filtered]);

  return (
    <div style={{ direction: isRTL ? "rtl" : "ltr" }}>

      {/* ── Filter bar ─────────────────────────────── */}
      <div style={{
        background: "var(--bg-card)", borderRadius: "20px",
        border: "1px solid var(--border)", padding: "16px 20px",
        marginBottom: "24px", boxShadow: "var(--shadow)",
      }}>
        {/* Search input */}
        <div style={{ position: "relative", marginBottom: "14px" }}>
          <span style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: "14px", fontSize: "16px", pointerEvents: "none" }}>🔍</span>
          <input
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder={t.search}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: isRTL ? "10px 44px 10px 16px" : "10px 16px 10px 44px",
              borderRadius: "12px", border: `1.5px solid ${keyword ? primaryColor : "var(--border)"}`,
              background: "var(--bg-soft)", color: "var(--text-1)",
              fontSize: "14px", outline: "none",
              transition: "border-color 0.15s",
            }}
          />
          {keyword && (
            <button onClick={() => setKeyword("")} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "left" : "right"]: "12px", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: "16px" }}>✕</button>
          )}
        </div>

        {/* Chip rows */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>

          {/* Sport filter (only if multiple sports) */}
          {showSportFilter && sports.length > 1 && sports.map(s => (
            <Chip
              key={s}
              label={t.sports[s] || s}
              active={sportFilter === s}
              onClick={() => setSportFilter(prev => prev === s ? "" : s)}
              accent={primaryColor}
            />
          ))}

          {/* Date chips */}
          {dateOptions.map(o => (
            <Chip key={o.value} label={o.label} active={dateFilter === o.value}
              onClick={() => setDateFilter(prev => prev === o.value ? "" : o.value)}
              accent="#f59e0b"
            />
          ))}

          {/* League select */}
          {leagues.length > 1 && (
            <FilterSelect
              value={leagueFilter}
              onChange={setLeagueFilter}
              placeholder={`🏆 ${t.competition}`}
              accent="#7c3aed"
              options={leagues.map(l => ({ value: l, label: t.leagues[l] || l }))}
            />
          )}

          {/* Topic select */}
          {topics.length > 0 && (
            <FilterSelect
              value={topicFilter}
              onChange={setTopicFilter}
              placeholder={`🏷 ${t.topic}`}
              accent="#0ea5e9"
              options={topics.map(tp => ({ value: tp, label: tp }))}
            />
          )}

          {/* Sort */}
          <FilterSelect
            value={sortOrder}
            onChange={setSortOrder}
            placeholder={t.sort}
            accent="#6b7280"
            options={[
              { value: "new", label: t.sortNew },
              { value: "old", label: t.sortOld },
            ]}
          />

          {/* Reset */}
          {hasFilters && (
            <button onClick={resetFilters} style={{ padding: "7px 14px", borderRadius: "999px", border: "1.5px solid #dc2626", background: "#dc262618", color: "#dc2626", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
              ✕ {t.reset}
            </button>
          )}
        </div>

        {/* Results count */}
        <div style={{ marginTop: "12px", color: "var(--text-3)", fontSize: "13px", fontWeight: 600 }}>
          {t.results(filtered.length)}
          {hasFilters && <span style={{ color: primaryColor }}> · {lang === "ar" ? "فلتر نشط" : lang === "fr" ? "Filtre actif" : "Filter active"}</span>}
        </div>
      </div>

      {/* ── Results grid ──────────────────────────── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-3)" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
          <div style={{ fontSize: "18px", fontWeight: 700 }}>{hasFilters ? t.noResults : lang === "en" ? "Translated articles loading soon — check back shortly!" : lang === "fr" ? "Articles traduits bientôt disponibles — revenez dans quelques instants !" : t.noResults}</div>
          {!hasFilters && lang !== "ar" && (
            <div style={{ marginTop: "10px", fontSize: "14px", color: "var(--text-3)", opacity: 0.7 }}>
              {lang === "en" ? "Our system is translating content automatically every hour." : "Notre système traduit le contenu automatiquement chaque heure."}
            </div>
          )}
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px",
        }}>
          {filtered.slice(0, page * ITEMS_PER_PAGE).map(a => (
            <ArticleCard key={a.slug} article={a} lang={lang} prefix={prefix} primaryColor={primaryColor} t={t} />
          ))}
        </div>
      )}

      {filtered.length > page * ITEMS_PER_PAGE && (
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <button
            onClick={() => setPage(p => p + 1)}
            style={{
              padding: "12px 32px", background: "var(--accent)", color: "white",
              border: "none", borderRadius: "8px", fontSize: "15px",
              cursor: "pointer", marginTop: "24px",
            }}
          >
            تحميل المزيد
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Article card ────────────────────────────────────── */
function ArticleCard({ article: a, lang, prefix, primaryColor, t }) {
  const accent = {
    "premier-league":"#7c3aed","la-liga":"#ea580c","bundesliga":"#dc2626",
    "serie-a":"#b45309","ligue-1":"#1d4ed8","champions-league":"#d97706",
    "saudi-pro-league":"#15803d","eredivisie":"#b91c1c",
    football:"#2563eb",basketball:"#c2410c",tennis:"#15803d",padel:"#7c3aed",futsal:"#0f766e",
  }[a.league] || primaryColor;

  return (
    <Link href={`${prefix}/articles/${a.slug}/`} style={{ textDecoration: "none", display: "block" }}>
      <article
        className="card-hover"
        style={{
          background: "var(--bg-card)", borderRadius: "18px", overflow: "hidden",
          border: "1px solid var(--border)", boxShadow: "var(--shadow)", height: "100%",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
      >
        <ArticleImage
          src={a.image} imageUrl={a.imageUrl} alt={getTitle(a, lang)}
          sport={a.sport} league={a.league} slug={a.slug}
          style={{ height: "175px", display: "block" }}
        />
        <div style={{ padding: "14px 16px 16px" }}>
          {/* Badge + date */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
            <span style={{ padding: "4px 10px", borderRadius: "999px", background: accent + "20", color: accent, fontSize: "11px", fontWeight: 700, border: `1px solid ${accent}33` }}>
              {t.leagues[a.league] || t.sports[a.sport] || a.sport}
            </span>
            {a.publishedAt && (
              <span style={{ color: "var(--text-3)", fontSize: "11px" }}>
                🕐 {fmtDate(a.publishedAt, lang)}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 style={{
            margin: "0 0 7px", fontSize: "15px", fontWeight: 800,
            color: "var(--text-1)", lineHeight: 1.55,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {getTitle(a, lang)}
          </h3>

          {/* Description */}
          <p style={{
            margin: 0, fontSize: "13px", color: "var(--text-2)", lineHeight: 1.65,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {getDesc(a, lang)}
          </p>

          {/* Tags */}
          {(a.topicTags || []).length > 0 && (
            <div style={{ marginTop: "10px", display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {(a.topicTags || []).slice(0, 3).map(tag => (
                <span key={tag} style={{ padding: "2px 8px", borderRadius: "999px", background: "var(--bg-soft)", color: "var(--text-3)", fontSize: "10px", fontWeight: 600 }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
