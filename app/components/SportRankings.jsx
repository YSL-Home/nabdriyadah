"use client";

/**
 * SportRankings — Classement compact affiché avant les articles
 * Les données sont passées en props depuis le Server Component parent
 * (évite d'importer les JSON dans le client bundle)
 */

import { useState } from "react";

const MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };

const LABELS = {
  ar: { pts: "نق", wl: "ف/خ", player: "اللاعب / الفريق", tab_men: "رجال", tab_women: "سيدات", source: "المصدر" },
  en: { pts: "pts", wl: "W/L", player: "Player / Team",    tab_men: "Men",   tab_women: "Women",   source: "Source" },
  fr: { pts: "pts", wl: "V/D", player: "Joueur / Équipe",  tab_men: "Hommes",tab_women: "Femmes",  source: "Source" },
};

function RankBadge({ rank }) {
  if (MEDAL[rank]) return <span style={{ fontSize: "17px", lineHeight: 1 }}>{MEDAL[rank]}</span>;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: "26px", height: "26px", borderRadius: "50%",
      background: "#f3f4f6", color: "#6b7280",
      fontSize: "12px", fontWeight: 800, flexShrink: 0
    }}>{rank}</span>
  );
}

function Row({ entry, pointsLabel, isDark, isTeam }) {
  const border = isDark ? "rgba(255,255,255,0.07)" : "#f3f4f6";
  const nameColor = isDark ? "#f1f5f9" : "#111827";
  const subColor  = isDark ? "#94a3b8" : "#6b7280";
  const ptColor   = isDark ? "#60a5fa" : "#1d4ed8";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "10px",
      padding: "9px 14px", borderBottom: `1px solid ${border}`,
    }}>
      <RankBadge rank={entry.rank} />

      {/* Image : flag (joueur) ou logo (équipe) */}
      {entry.flag && (
        <img src={entry.flag} alt={entry.country || ""} width={26} height={18}
          style={{ objectFit: "cover", borderRadius: "3px", flexShrink: 0 }} />
      )}
      {!entry.flag && entry.logo && (
        <img src={entry.logo} alt={entry.name} width={26} height={26}
          style={{ objectFit: "contain", borderRadius: "4px", flexShrink: 0 }} />
      )}
      {!entry.flag && !entry.logo && (
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: isDark ? "#334155" : "#e2e8f0", flexShrink: 0 }} />
      )}

      {/* Nom */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: nameColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {entry.name}
        </div>
        {entry.team && <div style={{ fontSize: "11px", color: subColor }}>{entry.team}</div>}
        {!entry.team && entry.country && <div style={{ fontSize: "11px", color: subColor }}>{entry.country}</div>}
      </div>

      {/* Stats */}
      {entry.points !== undefined && (
        <span style={{ fontSize: "13px", fontWeight: 800, color: ptColor, flexShrink: 0 }}>
          {typeof entry.points === "number" && entry.points < 100
            ? entry.points.toFixed(2)
            : Number(entry.points).toLocaleString()}
          <span style={{ fontSize: "9px", color: isDark ? "#64748b" : "#9ca3af", marginInlineStart: "2px" }}>{pointsLabel}</span>
        </span>
      )}
      {entry.won !== undefined && (
        <span style={{ fontSize: "12px", fontWeight: 700, color: ptColor, flexShrink: 0 }}>
          {entry.won}W – {entry.lost}L
        </span>
      )}
    </div>
  );
}

function Table({ title, entries = [], accentColor, pointsLabel, isTeam, isDark, sourceUrl, sourceLabel }) {
  const top = entries.slice(0, 10);
  const bg  = isDark ? "rgba(255,255,255,0.04)" : "white";
  const brd = isDark ? "rgba(255,255,255,0.09)" : "#e5e7eb";
  const hBg = isDark ? "rgba(255,255,255,0.06)" : "#f8fafc";
  const hC  = isDark ? "#64748b" : "#9ca3af";

  return (
    <div style={{ background: bg, border: `1px solid ${brd}`, borderRadius: "18px", overflow: "hidden", boxShadow: isDark ? "none" : "0 3px 14px rgba(0,0,0,0.06)" }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(120deg, ${accentColor}dd 0%, ${accentColor}88 100%)`,
        padding: "11px 16px", display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <span style={{ fontSize: "13px", fontWeight: 800, color: "white" }}>{title}</span>
        {sourceUrl && (
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
            ↗ {sourceLabel}
          </a>
        )}
      </div>
      {/* Column titles */}
      <div style={{ display: "flex", gap: "10px", padding: "5px 14px", background: hBg, fontSize: "10px", fontWeight: 700, color: hC, direction: "ltr", borderBottom: `1px solid ${brd}` }}>
        <span style={{ width: 26 }}>#</span>
        <span style={{ width: 26 }}></span>
        <span style={{ flex: 1 }}></span>
        <span>{pointsLabel}</span>
      </div>
      {top.map((entry, i) => (
        <Row key={i} entry={entry} pointsLabel={pointsLabel} isDark={isDark} isTeam={isTeam} />
      ))}
    </div>
  );
}

export default function SportRankings({
  sport,
  lang = "ar",
  isDark = false,
  // data props from Server Component
  data,    // primary: ATP, NBA, F1, golf, men padel, PL standings
  data2,   // secondary: WTA, women padel
  accentColor = "#1d4ed8",
  accentColor2 = "#7c3aed",
  titlePrimary,
  titleSecondary,
  pointsLabel,
  sourceUrl,
  sourceLabel,
  sourceUrl2,
  sourceLabel2,
}) {
  const t = LABELS[lang] || LABELS.ar;
  const isRTL = lang === "ar";
  const ptsLbl = pointsLabel || t.pts;
  const hasTabs = Boolean(data2?.length);

  const [tab, setTab] = useState(0);

  const tabBtnStyle = (active) => ({
    padding: "5px 14px", borderRadius: "999px", border: "none", cursor: "pointer",
    fontSize: "12px", fontWeight: 700, transition: "all .15s",
    background: active ? accentColor : (isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9"),
    color: active ? "white" : (isDark ? "#94a3b8" : "#6b7280"),
  });

  const currentData = tab === 0 ? (data || []) : (data2 || []);
  const currentTitle = tab === 0 ? titlePrimary : (titleSecondary || titlePrimary);
  const currentAccent = tab === 0 ? accentColor : accentColor2;
  const currentSrc = tab === 0 ? sourceUrl : (sourceUrl2 || sourceUrl);
  const currentSrcLabel = tab === 0 ? sourceLabel : (sourceLabel2 || sourceLabel);
  const isTeam = !!(currentData[0]?.logo || currentData[0]?.won !== undefined);

  return (
    <section style={{ direction: isRTL ? "rtl" : "ltr", marginBottom: "28px" }}>
      {hasTabs && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
          <button style={tabBtnStyle(tab === 0)} onClick={() => setTab(0)}>
            {sport === "tennis" ? t.tab_men : t.tab_men}
          </button>
          <button style={tabBtnStyle(tab === 1)} onClick={() => setTab(1)}>
            {sport === "tennis" ? t.tab_women : t.tab_women}
          </button>
        </div>
      )}
      <Table
        title={currentTitle}
        entries={currentData}
        accentColor={currentAccent}
        pointsLabel={isTeam ? t.wl : ptsLbl}
        isTeam={isTeam}
        isDark={isDark}
        sourceUrl={currentSrc}
        sourceLabel={currentSrcLabel}
      />
    </section>
  );
}
