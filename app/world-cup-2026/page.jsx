"use client";
import { useState, useEffect, useMemo } from "react";

const PROXY = "/api/live";

// ── Helpers ──────────────────────────────────────────────────────────────────
function ar(n) { return String(n ?? ""); }

function statusColor(s) {
  if (["1H", "2H", "ET", "BT", "P", "LIVE"].includes(s)) return "#16a34a";
  if (["FT", "AET", "PEN"].includes(s)) return "#6b7280";
  if (s === "HT") return "#ca8a04";
  return "#6b7280";
}
function statusLabel(s, elapsed) {
  const m = { HT: "استراحة", FT: "انتهى", AET: "انتهى (و.إ)", PEN: "ترجيح", NS: "لم يبدأ", PST: "مؤجل", CANC: "ملغي", P: "ترجيح", TBD: "يحدد لاحقاً" };
  if (m[s]) return m[s];
  if ((s === "1H" || s === "2H" || s === "ET") && elapsed) return `${ar(elapsed)}'`;
  return s;
}
function isLive(s) { return ["1H", "2H", "ET", "BT", "P", "HT", "LIVE"].includes(s); }
function isFinished(s) { return ["FT", "AET", "PEN"].includes(s); }

function dayLabel(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long" });
}
function timeLabel(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("ar-EG-u-nu-latn", { hour: "2-digit", minute: "2-digit" });
}

// Translate group round → Arabic. e.g. "Group Stage - 1" / "Group A"
function roundLabel(round = "") {
  const r = round.toLowerCase();
  if (r.includes("final") && !r.includes("semi") && !r.includes("quarter")) return "النهائي";
  if (r.includes("semi")) return "نصف النهائي";
  if (r.includes("quarter")) return "ربع النهائي";
  if (r.includes("16")) return "دور الـ16";
  if (r.includes("3rd") || r.includes("third")) return "تحديد المركز الثالث";
  const g = round.match(/Group ([A-L])/i);
  if (g) return `المجموعة ${g[1]}`;
  if (r.includes("group")) return "دور المجموعات";
  return round;
}

// ── Match row ────────────────────────────────────────────────────────────────
function MatchRow({ m }) {
  const s = m.fixture?.status?.short || "NS";
  const live = isLive(s);
  const done = isFinished(s);
  const home = m.teams?.home, away = m.teams?.away, goals = m.goals;
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "10px", alignItems: "center",
      background: "var(--card, #fff)", borderRadius: "14px", padding: "12px 16px",
      border: `1.5px solid ${live ? "#16a34a55" : "var(--border, #e5e7eb)"}`,
      boxShadow: live ? "0 0 14px rgba(22,163,74,0.15)" : "0 2px 8px rgba(0,0,0,0.04)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
        <img src={home?.logo} alt="" style={{ width: "26px", height: "26px", objectFit: "contain" }} />
        <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text, #111827)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{home?.name}</span>
      </div>
      <div style={{ textAlign: "center", minWidth: "62px" }}>
        {(done || live) && goals?.home != null ? (
          <span style={{ fontSize: "20px", fontWeight: 900, color: statusColor(s), letterSpacing: "-0.5px" }}>{ar(goals.home)}-{ar(goals.away)}</span>
        ) : (
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#9ca3af" }}>{timeLabel(m.fixture?.date)}</span>
        )}
        <div style={{ fontSize: "10px", fontWeight: 800, color: statusColor(s), marginTop: "2px" }}>
          {live && "🔴 "}{statusLabel(s, m.fixture?.status?.elapsed)}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-end", minWidth: 0 }}>
        <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text, #111827)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: "left" }}>{away?.name}</span>
        <img src={away?.logo} alt="" style={{ width: "26px", height: "26px", objectFit: "contain" }} />
      </div>
    </div>
  );
}

// ── Standings table (computed from finished group matches) ───────────────────
function computeStandings(matches) {
  const groups = {};
  for (const m of matches) {
    const g = (m.league?.round || "").match(/Group ([A-L])/i);
    if (!g) continue;
    const key = g[1];
    groups[key] ||= {};
    const s = m.fixture?.status?.short;
    for (const side of ["home", "away"]) {
      const t = m.teams[side];
      if (!t?.id) continue;
      groups[key][t.id] ||= { name: t.name, logo: t.logo, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, Pts: 0 };
    }
    if (!isFinished(s) || m.goals?.home == null) continue;
    const h = groups[key][m.teams.home.id], a = groups[key][m.teams.away.id];
    const gh = m.goals.home, ga = m.goals.away;
    h.P++; a.P++; h.GF += gh; h.GA += ga; a.GF += ga; a.GA += gh;
    if (gh > ga) { h.W++; a.L++; h.Pts += 3; }
    else if (gh < ga) { a.W++; h.L++; a.Pts += 3; }
    else { h.D++; a.D++; h.Pts++; a.Pts++; }
  }
  const out = {};
  for (const k of Object.keys(groups).sort()) {
    out[k] = Object.values(groups[k]).sort((x, y) => y.Pts - x.Pts || (y.GF - y.GA) - (x.GF - x.GA) || y.GF - x.GF);
  }
  return out;
}

function GroupTable({ letter, rows }) {
  return (
    <div style={{ background: "var(--card, #fff)", borderRadius: "16px", padding: "14px", border: "1.5px solid var(--border, #e5e7eb)" }}>
      <h3 style={{ margin: "0 0 10px", fontSize: "16px", fontWeight: 900, color: "var(--text, #111827)" }}>المجموعة {letter}</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
        <thead>
          <tr style={{ color: "#9ca3af", fontWeight: 800 }}>
            <th style={{ textAlign: "right", padding: "4px" }}>الفريق</th>
            <th style={{ padding: "4px" }}>لعب</th>
            <th style={{ padding: "4px" }}>+/-</th>
            <th style={{ padding: "4px" }}>نقاط</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t, i) => (
            <tr key={i} style={{ borderTop: "1px solid var(--border, #f3f4f6)", color: "var(--text, #111827)", fontWeight: i < 2 ? 800 : 500, background: i < 2 ? "#16a34a11" : "transparent" }}>
              <td style={{ padding: "6px 4px", display: "flex", alignItems: "center", gap: "6px" }}>
                <img src={t.logo} alt="" style={{ width: "18px", height: "18px", objectFit: "contain" }} />
                {t.name}
              </td>
              <td style={{ textAlign: "center", padding: "6px 4px" }}>{t.P}</td>
              <td style={{ textAlign: "center", padding: "6px 4px" }}>{t.GF - t.GA > 0 ? "+" : ""}{t.GF - t.GA}</td>
              <td style={{ textAlign: "center", padding: "6px 4px", fontWeight: 900 }}>{t.Pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function WorldCupPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("calendar"); // calendar | standings

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch(`${PROXY}?path=${encodeURIComponent("fixtures?league=1&season=2026")}`);
        const data = await res.json();
        if (!alive) return;
        if (data?.errors && Object.keys(data.errors).length && !data.response?.length) {
          setError("سيتم تحديث المباريات قريباً.");
        }
        setMatches(data.response || []);
      } catch {
        if (alive) setError("تعذّر تحميل مباريات كأس العالم.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    const iv = setInterval(load, 60000);
    return () => { alive = false; clearInterval(iv); };
  }, []);

  const liveMatches = useMemo(() => matches.filter(m => isLive(m.fixture?.status?.short)), [matches]);

  // group by day for calendar
  const byDay = useMemo(() => {
    const map = {};
    [...matches].sort((a, b) => (a.fixture?.timestamp || 0) - (b.fixture?.timestamp || 0))
      .forEach(m => {
        const d = (m.fixture?.date || "").slice(0, 10);
        (map[d] ||= []).push(m);
      });
    return map;
  }, [matches]);

  const standings = useMemo(() => computeStandings(matches), [matches]);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg, #f3f4f6)", padding: "24px 16px 52px", direction: "rtl" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Hero */}
        <section style={{ background: "linear-gradient(135deg,#0f172a,#16a34a)", borderRadius: "26px", padding: "30px 26px", color: "#fff", marginBottom: "20px", textAlign: "center", boxShadow: "0 14px 36px rgba(22,163,74,0.22)" }}>
          <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "1px", opacity: 0.85 }}>🇺🇸🇨🇦🇲🇽 2026</div>
          <h1 style={{ margin: "6px 0 8px", fontSize: "40px", fontWeight: 900 }}>كأس العالم 2026</h1>
          <p style={{ margin: 0, fontSize: "15px", opacity: 0.9 }}>المباريات، النتائج المباشرة وترتيب المجموعات — تحديث لحظي</p>
        </section>

        {/* Live now */}
        {liveMatches.length > 0 && (
          <section style={{ marginBottom: "22px" }}>
            <h2 style={{ margin: "0 0 12px", fontSize: "20px", fontWeight: 900, color: "var(--text, #111827)", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#16a34a", boxShadow: "0 0 8px #16a34a" }} /> جارية الآن
            </h2>
            <div style={{ display: "grid", gap: "10px" }}>
              {liveMatches.map(m => <MatchRow key={m.fixture?.id} m={m} />)}
            </div>
          </section>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
          {[["calendar", "📅 المباريات"], ["standings", "🏆 الترتيب"]].map(([k, lbl]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{ flex: 1, padding: "11px", borderRadius: "12px", border: "none", cursor: "pointer", fontSize: "15px", fontWeight: 800,
                background: tab === k ? "#16a34a" : "var(--card, #fff)", color: tab === k ? "#fff" : "var(--text, #374151)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              {lbl}
            </button>
          ))}
        </div>

        {loading && <div style={{ textAlign: "center", padding: "50px", color: "#6b7280" }}>جارٍ التحميل…</div>}
        {!loading && error && matches.length === 0 && (
          <div style={{ background: "var(--card, #fff)", borderRadius: "20px", padding: "40px", textAlign: "center", color: "#6b7280", fontSize: "16px" }}>{error}</div>
        )}

        {/* Calendar */}
        {!loading && tab === "calendar" && Object.keys(byDay).map(day => (
          <section key={day} style={{ marginBottom: "20px" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "16px", fontWeight: 900, color: "var(--text, #111827)" }}>{dayLabel(day + "T00:00:00")}</h2>
            <div style={{ display: "grid", gap: "8px" }}>
              {byDay[day].map(m => <MatchRow key={m.fixture?.id} m={m} />)}
            </div>
          </section>
        ))}

        {/* Standings */}
        {!loading && tab === "standings" && (
          Object.keys(standings).length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "14px" }}>
              {Object.entries(standings).map(([letter, rows]) => <GroupTable key={letter} letter={letter} rows={rows} />)}
            </div>
          ) : (
            <div style={{ background: "var(--card, #fff)", borderRadius: "20px", padding: "40px", textAlign: "center", color: "#6b7280" }}>سيُعرض ترتيب المجموعات بعد انطلاق المباريات.</div>
          )
        )}
      </div>
    </main>
  );
}
