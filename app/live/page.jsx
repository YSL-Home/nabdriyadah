"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const API_KEY = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY;
const BASE = "https://v3.football.api-sports.io";

function statusColor(status) {
  if (["1H", "2H", "ET", "BT", "P", "LIVE"].includes(status)) return "#16a34a";
  if (["FT", "AET", "PEN"].includes(status)) return "#6b7280";
  if (["HT"].includes(status)) return "#ca8a04";
  return "#6b7280";
}

function statusLabel(status, elapsed) {
  if (status === "1H") return `${elapsed}'`;
  if (status === "HT") return "استراحة";
  if (status === "2H") return `${elapsed}'`;
  if (status === "ET") return `و.إ ${elapsed}'`;
  if (status === "P") return "ضربات ترجيح";
  if (status === "FT") return "انتهى";
  if (status === "AET") return "انتهى (و.إ)";
  if (status === "PEN") return "انتهى (ترجيح)";
  if (status === "NS") return "لم يبدأ";
  if (status === "PST") return "مؤجل";
  if (status === "CANC") return "ملغي";
  return status;
}

function isLive(status) {
  return ["1H", "2H", "ET", "BT", "P", "HT", "LIVE"].includes(status);
}

function MatchCard({ match }) {
  const live = isLive(match.fixture?.status?.short);
  const status = match.fixture?.status?.short || "NS";
  const elapsed = match.fixture?.status?.elapsed;
  const home = match.teams?.home;
  const away = match.teams?.away;
  const goals = match.goals;

  return (
    <div style={{
      background: "white",
      borderRadius: "20px",
      padding: "18px 20px",
      border: `2px solid ${live ? "#16a34a44" : "#e5e7eb"}`,
      boxShadow: live ? "0 0 18px rgba(22,163,74,0.12)" : "0 4px 12px rgba(0,0,0,0.04)",
      position: "relative",
      overflow: "hidden"
    }}>
      {live && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "3px",
          background: "linear-gradient(90deg, #16a34a, #22c55e, #16a34a)",
        }} />
      )}

      {/* League + status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {match.league?.logo && (
            <img src={match.league.logo} alt="" style={{ width: "20px", height: "20px", objectFit: "contain" }} />
          )}
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280" }}>
            {match.league?.name} — {match.league?.round}
          </span>
        </div>
        <span style={{
          fontSize: "12px", fontWeight: 800, color: statusColor(status),
          background: statusColor(status) + "18",
          padding: "4px 10px", borderRadius: "999px",
          display: "flex", alignItems: "center", gap: "5px"
        }}>
          {live && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />}
          {statusLabel(status, elapsed)}
        </span>
      </div>

      {/* Teams + score */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "12px", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src={home?.logo} alt={home?.name} style={{ width: "36px", height: "36px", objectFit: "contain" }} />
          <span style={{ fontSize: "16px", fontWeight: 800, color: "#111827" }}>{home?.name}</span>
        </div>

        <div style={{ textAlign: "center", minWidth: "80px" }}>
          {goals?.home !== null && goals?.away !== null ? (
            <span style={{ fontSize: "28px", fontWeight: 900, color: "#111827", letterSpacing: "-1px" }}>
              {goals.home} — {goals.away}
            </span>
          ) : (
            <span style={{ fontSize: "18px", fontWeight: 700, color: "#9ca3af" }}>vs</span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "flex-end" }}>
          <span style={{ fontSize: "16px", fontWeight: 800, color: "#111827" }}>{away?.name}</span>
          <img src={away?.logo} alt={away?.name} style={{ width: "36px", height: "36px", objectFit: "contain" }} />
        </div>
      </div>

      {/* Venue */}
      {match.fixture?.venue?.name && (
        <div style={{ marginTop: "10px", fontSize: "12px", color: "#9ca3af", textAlign: "center" }}>
          📍 {match.fixture.venue.name}, {match.fixture.venue.city}
        </div>
      )}
    </div>
  );
}

export default function LivePage() {
  const [liveMatches, setLiveMatches] = useState([]);
  const [todayMatches, setTodayMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = useCallback(async () => {
    if (!API_KEY) {
      setError("مفتاح API غير مُعدَّ بعد. أضف NEXT_PUBLIC_API_FOOTBALL_KEY.");
      setLoading(false);
      return;
    }
    try {
      const headers = {
        "x-apisports-key": API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io"
      };

      const [liveRes, todayRes] = await Promise.all([
        fetch(`${BASE}/fixtures?live=all`, { headers }),
        fetch(`${BASE}/fixtures?date=${new Date().toISOString().slice(0, 10)}`, { headers })
      ]);

      const [liveData, todayData] = await Promise.all([liveRes.json(), todayRes.json()]);
      setLiveMatches(liveData.response || []);
      setTodayMatches(todayData.response || []);
      setLastUpdate(new Date().toLocaleTimeString("ar-SA"));
      setError(null);
    } catch (e) {
      setError("تعذّر تحميل المباريات: " + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <main style={{ minHeight: "100vh", background: "#f3f4f6", padding: "24px 20px 52px", direction: "rtl" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <section style={{
          background: "linear-gradient(135deg, #0f172a, #16a34a)",
          borderRadius: "28px", padding: "32px 28px",
          color: "white", marginBottom: "28px",
          boxShadow: "0 14px 36px rgba(22,163,74,0.2)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 10px #4ade80" }} />
            <h1 style={{ margin: 0, fontSize: "42px", fontWeight: 900 }}>المباريات المباشرة</h1>
          </div>
          <p style={{ margin: "0 0 16px 0", fontSize: "18px", opacity: 0.9, lineHeight: 1.8 }}>
            تابع أحداث المباريات الجارية الآن لحظة بلحظة — تحديث كل دقيقة
          </p>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            {lastUpdate && (
              <span style={{ background: "rgba(255,255,255,0.15)", padding: "6px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 700 }}>
                آخر تحديث: {lastUpdate}
              </span>
            )}
            <button
              onClick={fetchData}
              style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "white", padding: "6px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
            >
              🔄 تحديث
            </button>
          </div>
        </section>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px", color: "#6b7280", fontSize: "18px" }}>
            جارٍ تحميل المباريات...
          </div>
        )}

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "20px", padding: "24px", color: "#dc2626", fontSize: "16px", marginBottom: "24px" }}>
            {error}
          </div>
        )}

        {/* Live matches */}
        {!loading && liveMatches.length > 0 && (
          <section style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#16a34a", boxShadow: "0 0 8px #16a34a", display: "inline-block" }} />
              <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 800 }}>جارية الآن ({liveMatches.length})</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: "16px" }}>
              {liveMatches.map(m => <MatchCard key={m.fixture?.id} match={m} />)}
            </div>
          </section>
        )}

        {/* Today matches */}
        {!loading && todayMatches.length > 0 && (
          <section>
            <h2 style={{ margin: "0 0 16px 0", fontSize: "26px", fontWeight: 800 }}>
              مباريات اليوم ({todayMatches.length})
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: "16px" }}>
              {todayMatches
                .sort((a, b) => (b.fixture?.timestamp || 0) - (a.fixture?.timestamp || 0))
                .map(m => <MatchCard key={m.fixture?.id} match={m} />)}
            </div>
          </section>
        )}

        {!loading && !error && liveMatches.length === 0 && todayMatches.length === 0 && (
          <div style={{ background: "white", borderRadius: "24px", padding: "48px", textAlign: "center", color: "#6b7280", fontSize: "18px" }}>
            لا توجد مباريات جارية حالياً. سيتم تحديث الصفحة تلقائياً.
          </div>
        )}
      </div>
    </main>
  );
}
