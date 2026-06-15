"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

const PROXY = "/api/live";

function isLive(s) { return ["1H", "2H", "ET", "BT", "P", "HT", "LIVE"].includes(s); }
function isFinished(s) { return ["FT", "AET", "PEN"].includes(s); }
function timeLabel(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("ar-EG-u-nu-latn", { hour: "2-digit", minute: "2-digit" });
}
function dayShort(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ar-EG", { day: "numeric", month: "short" });
}

function Pill({ m }) {
  const s = m.fixture?.status?.short || "NS";
  const live = isLive(s);
  const done = isFinished(s);
  const showScore = (live || done) && m.goals?.home != null;
  return (
    <Link href="/world-cup-2026/" style={{ textDecoration: "none", flexShrink: 0 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        background: live ? "rgba(34,197,94,0.22)" : "rgba(255,255,255,0.12)",
        border: `1px solid ${live ? "#4ade80" : "rgba(255,255,255,0.18)"}`,
        borderRadius: "12px", padding: "7px 12px", whiteSpace: "nowrap",
      }}>
        {live && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80" }} />}
        <img src={m.teams?.home?.logo} alt="" style={{ width: "20px", height: "20px", objectFit: "contain" }} />
        <span style={{ fontSize: "13px", fontWeight: 800, color: "#fff" }}>
          {showScore ? `${m.goals.home}-${m.goals.away}` : `${dayShort(m.fixture?.date)} · ${timeLabel(m.fixture?.date)}`}
        </span>
        <img src={m.teams?.away?.logo} alt="" style={{ width: "20px", height: "20px", objectFit: "contain" }} />
        {live && <span style={{ fontSize: "10px", fontWeight: 900, color: "#4ade80" }}>{m.fixture?.status?.elapsed ? `${m.fixture.status.elapsed}'` : "مباشر"}</span>}
      </div>
    </Link>
  );
}

export default function WorldCupBanner() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    let alive = true;
    let timer;
    async function load() {
      try {
        const res = await fetch(`${PROXY}?path=${encodeURIComponent("fixtures?league=1&season=2026")}`);
        const data = await res.json();
        if (!alive) return;
        const rows = data.response || [];
        setMatches(rows);
        // Poll plus vite seulement s'il y a un match en direct, sinon lent (économie API)
        const hasLive = rows.some(m => isLive(m.fixture?.status?.short));
        timer = setTimeout(load, hasLive ? 60000 : 180000);
      } catch {
        if (alive) timer = setTimeout(load, 180000);
      }
    }
    load();
    return () => { alive = false; clearTimeout(timer); };
  }, []);

  // live first, then nearest upcoming, then last finished
  const display = useMemo(() => {
    const live = matches.filter(m => isLive(m.fixture?.status?.short));
    const upcoming = matches
      .filter(m => m.fixture?.status?.short === "NS")
      .sort((a, b) => (a.fixture?.timestamp || 0) - (b.fixture?.timestamp || 0));
    const finished = matches
      .filter(m => isFinished(m.fixture?.status?.short))
      .sort((a, b) => (b.fixture?.timestamp || 0) - (a.fixture?.timestamp || 0));
    return [...live, ...upcoming, ...finished].slice(0, 8);
  }, [matches]);

  return (
    <div style={{ maxWidth: "1450px", margin: "16px auto 0", padding: "0 16px" }}>
      <div style={{
        background: "linear-gradient(120deg,#0f172a 0%,#15803d 60%,#16a34a 100%)",
        borderRadius: "22px", padding: "18px 20px", color: "#fff",
        boxShadow: "0 12px 32px rgba(22,163,74,0.28)", position: "relative", overflow: "hidden",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: display.length ? "14px" : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "30px" }}>🏆</span>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 900, lineHeight: 1.1 }}>كأس العالم 2026</div>
              <div style={{ fontSize: "12px", opacity: 0.85 }}>المباريات · النتائج المباشرة · ترتيب المجموعات</div>
            </div>
          </div>
          <Link href="/world-cup-2026/" style={{
            textDecoration: "none", background: "#fff", color: "#15803d",
            fontWeight: 900, fontSize: "14px", padding: "10px 20px", borderRadius: "999px", whiteSpace: "nowrap",
          }}>
            التغطية الكاملة ←
          </Link>
        </div>

        {display.length > 0 && (
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
            {display.map(m => <Pill key={m.fixture?.id} m={m} />)}
          </div>
        )}
      </div>
    </div>
  );
}
