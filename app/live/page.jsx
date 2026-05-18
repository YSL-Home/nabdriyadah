"use client";
import { useState, useEffect, useCallback } from "react";

const LEAGUES = [
  { id: "eng.1",          name: "الدوري الإنجليزي" },
  { id: "esp.1",          name: "الدوري الإسباني" },
  { id: "ger.1",          name: "الدوري الألماني" },
  { id: "ita.1",          name: "الدوري الإيطالي" },
  { id: "fra.1",          name: "الدوري الفرنسي" },
  { id: "uefa.champions", name: "دوري أبطال أوروبا" },
  { id: "ksa.1",          name: "الدوري السعودي" },
];

function statusInfo(typeName, shortDetail) {
  switch (typeName) {
    case "STATUS_IN_PROGRESS":
      return { label: shortDetail || "مباشر", color: "#16a34a", live: true };
    case "STATUS_HALFTIME":
      return { label: "استراحة", color: "#ca8a04", live: true };
    case "STATUS_FINAL":
    case "STATUS_FULL_TIME":
      return { label: "انتهى", color: "#6b7280", live: false };
    case "STATUS_POSTPONED":
      return { label: "مؤجل", color: "#dc2626", live: false };
    case "STATUS_CANCELED":
    case "STATUS_CANCELLED":
      return { label: "ملغي", color: "#dc2626", live: false };
    case "STATUS_SCHEDULED":
    default:
      return { label: shortDetail || "لم يبدأ", color: "#6b7280", live: false };
  }
}

function MatchCard({ event, leagueName }) {
  const competition = event.competitions?.[0];
  if (!competition) return null;

  const competitors = competition.competitors || [];
  const home = competitors.find(c => c.homeAway === "home");
  const away = competitors.find(c => c.homeAway === "away");
  if (!home || !away) return null;

  const statusType = competition.status?.type || {};
  const { label, color, live } = statusInfo(statusType.name, statusType.shortDetail);

  const showScore = statusType.name !== "STATUS_SCHEDULED";

  let timeLabel = null;
  if (statusType.name === "STATUS_SCHEDULED" && event.date) {
    timeLabel = new Date(event.date).toLocaleTimeString("ar-SA-u-nu-latn", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Riyadh",
    });
  }

  return (
    <div style={{
      background: "white",
      borderRadius: "20px",
      padding: "16px 20px",
      border: `2px solid ${live ? "#16a34a44" : "#e5e7eb"}`,
      boxShadow: live ? "0 0 18px rgba(22,163,74,0.12)" : "0 4px 12px rgba(0,0,0,0.04)",
      position: "relative",
      overflow: "hidden",
    }}>
      {live && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "3px",
          background: "linear-gradient(90deg,#16a34a,#22c55e,#16a34a)",
        }} />
      )}

      {/* League + status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "#6b7280" }}>{leagueName}</span>
        <span style={{
          fontSize: "11px", fontWeight: 800, color, background: color + "18",
          padding: "3px 9px", borderRadius: "999px", display: "flex", alignItems: "center", gap: "4px",
        }}>
          {live && (
            <span style={{
              width: "5px", height: "5px", borderRadius: "50%",
              background: "#16a34a", display: "inline-block",
            }} />
          )}
          {label}
        </span>
      </div>

      {/* Teams + score */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "10px", alignItems: "center" }}>
        {/* Home */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {home.team?.logo && (
            <img
              src={home.team.logo}
              alt={home.team.displayName || ""}
              style={{ width: "32px", height: "32px", objectFit: "contain" }}
            />
          )}
          <span style={{ fontSize: "14px", fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>
            {home.team?.displayName}
          </span>
        </div>

        {/* Score / time */}
        <div style={{ textAlign: "center", minWidth: "70px" }}>
          {showScore ? (
            <span style={{ fontSize: "26px", fontWeight: 900, color: "#111827", letterSpacing: "-1px" }}>
              {home.score ?? 0} — {away.score ?? 0}
            </span>
          ) : (
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#9ca3af" }}>
              {timeLabel || "vs"}
            </span>
          )}
        </div>

        {/* Away */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-end" }}>
          <span style={{ fontSize: "14px", fontWeight: 800, color: "#111827", lineHeight: 1.2, textAlign: "right" }}>
            {away.team?.displayName}
          </span>
          {away.team?.logo && (
            <img
              src={away.team.logo}
              alt={away.team.displayName || ""}
              style={{ width: "32px", height: "32px", objectFit: "contain" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function LeagueSection({ league, events }) {
  return (
    <section style={{ marginBottom: "28px" }}>
      <h2 style={{ margin: "0 0 12px", fontSize: "20px", fontWeight: 800, color: "#111827" }}>
        {league.name}
        <span style={{ marginRight: "8px", fontSize: "14px", fontWeight: 600, color: "#6b7280" }}>
          ({events.length})
        </span>
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "14px" }}>
        {events
          .slice()
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map(ev => (
            <MatchCard key={ev.id} event={ev} leagueName={league.name} />
          ))}
      </div>
    </section>
  );
}

export default function LivePage() {
  const [data, setData] = useState({});        // { leagueId: events[] }
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState("all");
  const [hasLive, setHasLive] = useState(false);

  const fetchAll = useCallback(async () => {
    const results = await Promise.allSettled(
      LEAGUES.map(async (league) => {
        const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league.id}/scoreboard`;
        const res = await fetch(url);
        if (!res.ok) return { id: league.id, events: [] };
        const json = await res.json();
        return { id: league.id, events: json.events || [] };
      })
    );

    const newData = {};
    let anyLive = false;

    results.forEach((r) => {
      if (r.status === "fulfilled" && r.value.events.length > 0) {
        newData[r.value.id] = r.value.events;
        r.value.events.forEach(ev => {
          const comp = ev.competitions?.[0];
          const typeName = comp?.status?.type?.name || "";
          if (typeName === "STATUS_IN_PROGRESS" || typeName === "STATUS_HALFTIME") {
            anyLive = true;
          }
        });
      }
    });

    setData(newData);
    setHasLive(anyLive);
    setLastUpdate(new Date().toLocaleTimeString("ar-SA-u-nu-latn", { hour: "2-digit", minute: "2-digit" }));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Auto-refresh every 60s when there are live matches
  useEffect(() => {
    if (!hasLive) return;
    const interval = setInterval(fetchAll, 60000);
    return () => clearInterval(interval);
  }, [hasLive, fetchAll]);

  // Leagues that have events today
  const activeLeagues = LEAGUES.filter(l => data[l.id]?.length > 0);
  const totalMatches = activeLeagues.reduce((acc, l) => acc + (data[l.id]?.length || 0), 0);

  const displayLeagues = selectedLeague === "all"
    ? activeLeagues
    : activeLeagues.filter(l => l.id === selectedLeague);

  return (
    <main style={{ minHeight: "100vh", background: "#f3f4f6", padding: "24px 20px 52px", direction: "rtl" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <section style={{
          background: "linear-gradient(135deg,#0f172a,#16a34a)",
          borderRadius: "28px", padding: "28px", color: "white",
          marginBottom: "22px", boxShadow: "0 14px 36px rgba(22,163,74,0.2)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
            <div style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 10px #4ade80" }} />
            <h1 style={{ margin: 0, fontSize: "36px", fontWeight: 900 }}>المباريات المباشرة</h1>
          </div>
          <p style={{ margin: "0 0 14px", fontSize: "16px", opacity: 0.88 }}>
            تابع المباريات لحظة بلحظة — تحديث تلقائي كل دقيقة عند وجود مباريات جارية
          </p>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {lastUpdate && (
              <span style={{ background: "rgba(255,255,255,0.15)", padding: "5px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 700 }}>
                آخر تحديث: {lastUpdate}
              </span>
            )}
            <button
              onClick={fetchAll}
              style={{
                background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)",
                color: "white", padding: "5px 14px", borderRadius: "999px",
                fontSize: "12px", fontWeight: 700, cursor: "pointer",
              }}>
              تحديث
            </button>
          </div>
        </section>

        {/* League filter */}
        {!loading && activeLeagues.length > 0 && (
          <section style={{
            background: "white", borderRadius: "20px", padding: "16px 20px",
            marginBottom: "22px", boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
            display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center",
          }}>
            <button
              onClick={() => setSelectedLeague("all")}
              style={{
                padding: "8px 16px", borderRadius: "10px",
                border: `1.5px solid ${selectedLeague === "all" ? "#1d4ed8" : "#e5e7eb"}`,
                background: selectedLeague === "all" ? "#1d4ed8" : "#f9fafb",
                color: selectedLeague === "all" ? "white" : "#374151",
                fontSize: "13px", fontWeight: 700, cursor: "pointer",
              }}>
              الكل ({totalMatches})
            </button>
            {activeLeagues.map(l => (
              <button
                key={l.id}
                onClick={() => setSelectedLeague(l.id)}
                style={{
                  padding: "8px 16px", borderRadius: "10px",
                  border: `1.5px solid ${selectedLeague === l.id ? "#1d4ed8" : "#e5e7eb"}`,
                  background: selectedLeague === l.id ? "#1d4ed8" : "#f9fafb",
                  color: selectedLeague === l.id ? "white" : "#374151",
                  fontSize: "13px", fontWeight: 700, cursor: "pointer",
                }}>
                {l.name} ({data[l.id]?.length || 0})
              </button>
            ))}
          </section>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px", color: "#6b7280", fontSize: "18px" }}>
            جارٍ تحميل المباريات...
          </div>
        )}

        {/* No matches at all */}
        {!loading && activeLeagues.length === 0 && (
          <div style={{
            background: "white", borderRadius: "24px", padding: "48px",
            textAlign: "center", color: "#6b7280", fontSize: "18px",
          }}>
            لا توجد مباريات اليوم
          </div>
        )}

        {/* No matches for selected league */}
        {!loading && activeLeagues.length > 0 && displayLeagues.length === 0 && (
          <div style={{
            background: "white", borderRadius: "24px", padding: "48px",
            textAlign: "center", color: "#6b7280", fontSize: "18px",
          }}>
            لا توجد مباريات لهذا الدوري اليوم
          </div>
        )}

        {/* Match sections */}
        {!loading && displayLeagues.map(league => (
          <LeagueSection
            key={league.id}
            league={league}
            events={data[league.id] || []}
          />
        ))}

      </div>
    </main>
  );
}
