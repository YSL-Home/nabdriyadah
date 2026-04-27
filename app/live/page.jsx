"use client";
import { useState, useEffect, useCallback, useMemo } from "react";

const API_KEY = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY;
const BASE = "https://v3.football.api-sports.io";

// Top leagues shown first in filter
const TOP_LEAGUE_IDS = [2, 39, 140, 78, 135, 61, 307, 848, 3, 1];
const TOP_LEAGUE_NAMES = {
  2: "دوري أبطال أوروبا",
  39: "الدوري الإنجليزي",
  140: "الدوري الإسباني",
  78: "الدوري الألماني",
  135: "الدوري الإيطالي",
  61: "الدوري الفرنسي",
  307: "الدوري السعودي",
  848: "الدوري الأوروبي",
  3: "الدوري الأوروبي الكونفرنس",
  1: "كأس العالم"
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Affiche les chiffres standards (1, 2, 3...)
function ar(n) { return String(n ?? ""); }

function statusColor(s) {
  if (["1H","2H","ET","BT","P","LIVE"].includes(s)) return "#16a34a";
  if (["FT","AET","PEN"].includes(s)) return "#6b7280";
  if (s === "HT") return "#ca8a04";
  return "#6b7280";
}

function statusLabel(s, elapsed) {
  const m = { HT:"استراحة", FT:"انتهى", AET:"انتهى (و.إ)", PEN:"انتهى (ترجيح)", NS:"لم يبدأ", PST:"مؤجل", CANC:"ملغي", P:"ضربات ترجيح" };
  if (m[s]) return m[s];
  if ((s === "1H" || s === "2H" || s === "ET") && elapsed) return `${ar(elapsed)}'`;
  return s;
}

function isLive(s) { return ["1H","2H","ET","BT","P","HT","LIVE"].includes(s); }

function MatchCard({ match }) {
  const s = match.fixture?.status?.short || "NS";
  const live = isLive(s);
  const home = match.teams?.home;
  const away = match.teams?.away;
  const goals = match.goals;
  const kickoff = match.fixture?.date
    ? new Date(match.fixture.date).toLocaleTimeString("ar-SA-u-nu-latn", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div style={{
      background: "white", borderRadius: "20px", padding: "16px 20px",
      border: `2px solid ${live ? "#16a34a44" : "#e5e7eb"}`,
      boxShadow: live ? "0 0 18px rgba(22,163,74,0.12)" : "0 4px 12px rgba(0,0,0,0.04)",
      position: "relative", overflow: "hidden"
    }}>
      {live && <div style={{ position:"absolute", top:0, left:0, right:0, height:"3px", background:"linear-gradient(90deg,#16a34a,#22c55e,#16a34a)" }} />}

      {/* League + status */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
          {match.league?.logo && <img src={match.league.logo} alt="" style={{ width:"18px", height:"18px", objectFit:"contain" }} />}
          <span style={{ fontSize:"11px", fontWeight:700, color:"#6b7280" }}>{match.league?.name} · {match.league?.round}</span>
        </div>
        <span style={{ fontSize:"11px", fontWeight:800, color:statusColor(s), background:statusColor(s)+"18", padding:"3px 9px", borderRadius:"999px", display:"flex", alignItems:"center", gap:"4px" }}>
          {live && <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:"#16a34a", display:"inline-block" }} />}
          {statusLabel(s, match.fixture?.status?.elapsed)}
        </span>
      </div>

      {/* Teams + score */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:"10px", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <img src={home?.logo} alt={home?.name || ""} style={{ width:"32px", height:"32px", objectFit:"contain" }} />
          <span style={{ fontSize:"15px", fontWeight:800, color:"#111827", lineHeight:1.2 }}>{home?.name}</span>
        </div>

        <div style={{ textAlign:"center", minWidth:"70px" }}>
          {goals?.home !== null && goals?.away !== null ? (
            <span style={{ fontSize:"26px", fontWeight:900, color:"#111827", letterSpacing:"-1px" }}>{ar(goals.home)} — {ar(goals.away)}</span>
          ) : (
            <span style={{ fontSize:"14px", fontWeight:700, color:"#9ca3af" }}>{kickoff || "vs"}</span>
          )}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:"8px", justifyContent:"flex-end" }}>
          <span style={{ fontSize:"15px", fontWeight:800, color:"#111827", lineHeight:1.2, textAlign:"right" }}>{away?.name}</span>
          <img src={away?.logo} alt={away?.name || ""} style={{ width:"32px", height:"32px", objectFit:"contain" }} />
        </div>
      </div>

      {match.fixture?.venue?.name && (
        <div style={{ marginTop:"8px", fontSize:"11px", color:"#9ca3af", textAlign:"center" }}>
          📍 {match.fixture.venue.name}, {match.fixture.venue.city}
        </div>
      )}
    </div>
  );
}

export default function LivePage() {
  const [allMatches, setAllMatches] = useState([]);
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [selectedLeague, setSelectedLeague] = useState("all");

  const fetchData = useCallback(async (date) => {
    if (!API_KEY) {
      setError("مفتاح API غير مُعدَّ بعد. أضف NEXT_PUBLIC_API_FOOTBALL_KEY.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const headers = { "x-apisports-key": API_KEY, "x-rapidapi-host": "v3.football.api-sports.io" };
      const isToday = date === todayStr();

      const requests = [fetch(`${BASE}/fixtures?date=${date}`, { headers })];
      if (isToday) requests.push(fetch(`${BASE}/fixtures?live=all`, { headers }));

      const results = await Promise.all(requests);
      const [dayData, liveData] = await Promise.all(results.map(r => r.json()));

      setAllMatches(dayData.response || []);
      setLiveMatches(isToday ? (liveData?.response || []) : []);
      setLastUpdate(new Date().toLocaleTimeString("ar-SA"));
      setError(null);
    } catch (e) {
      setError("تعذّر تحميل المباريات: " + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedDate);
    let interval;
    if (selectedDate === todayStr()) {
      interval = setInterval(() => fetchData(selectedDate), 60000);
    }
    return () => clearInterval(interval);
  }, [fetchData, selectedDate]);

  // Build sorted league list from fetched matches
  const leagues = useMemo(() => {
    const map = {};
    allMatches.forEach(m => {
      const id = m.league?.id;
      if (!id || map[id]) return;
      map[id] = { id, name: TOP_LEAGUE_NAMES[id] || m.league?.name, logo: m.league?.logo };
    });
    const top = TOP_LEAGUE_IDS.filter(id => map[id]).map(id => map[id]);
    const rest = Object.values(map).filter(l => !TOP_LEAGUE_IDS.includes(l.id))
      .sort((a, b) => a.name.localeCompare(b.name, "ar"));
    return [...top, ...rest];
  }, [allMatches]);

  // Filter by selected league
  const filteredMatches = useMemo(() => {
    const base = allMatches;
    if (selectedLeague === "all") return base;
    return base.filter(m => String(m.league?.id) === selectedLeague);
  }, [allMatches, selectedLeague]);

  const filteredLive = useMemo(() => {
    if (selectedLeague === "all") return liveMatches;
    return liveMatches.filter(m => String(m.league?.id) === selectedLeague);
  }, [liveMatches, selectedLeague]);

  const isToday = selectedDate === todayStr();

  return (
    <main style={{ minHeight:"100vh", background:"#f3f4f6", padding:"24px 20px 52px", direction:"rtl" }}>
      <div style={{ maxWidth:"1200px", margin:"0 auto" }}>

        {/* Header */}
        <section style={{ background:"linear-gradient(135deg,#0f172a,#16a34a)", borderRadius:"28px", padding:"28px", color:"white", marginBottom:"22px", boxShadow:"0 14px 36px rgba(22,163,74,0.2)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"10px" }}>
            <div style={{ width:"11px", height:"11px", borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 10px #4ade80" }} />
            <h1 style={{ margin:0, fontSize:"36px", fontWeight:900 }}>المباريات المباشرة</h1>
          </div>
          <p style={{ margin:"0 0 14px", fontSize:"16px", opacity:0.88 }}>تابع المباريات لحظة بلحظة — تحديث كل دقيقة</p>
          <div style={{ display:"flex", gap:"10px", alignItems:"center", flexWrap:"wrap" }}>
            {lastUpdate && (
              <span style={{ background:"rgba(255,255,255,0.15)", padding:"5px 12px", borderRadius:"999px", fontSize:"12px", fontWeight:700 }}>
                آخر تحديث: {lastUpdate}
              </span>
            )}
            <button onClick={() => fetchData(selectedDate)}
              style={{ background:"rgba(255,255,255,0.2)", border:"1px solid rgba(255,255,255,0.3)", color:"white", padding:"5px 14px", borderRadius:"999px", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>
              🔄 تحديث
            </button>
          </div>
        </section>

        {/* ── FILTERS ── */}
        <section className="filters-bar" style={{ background:"white", borderRadius:"20px", padding:"18px 22px", marginBottom:"22px", boxShadow:"0 4px 14px rgba(0,0,0,0.05)" }}>

          {/* Date filter */}
          <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
            <label style={{ fontSize:"12px", fontWeight:700, color:"#6b7280" }}>📅 التاريخ</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => { setSelectedDate(e.target.value); setSelectedLeague("all"); }}
              style={{ padding:"9px 14px", borderRadius:"12px", border:"1.5px solid #e5e7eb", fontSize:"14px", fontWeight:700, color:"#111827", cursor:"pointer", outline:"none", background:"#f9fafb" }}
            />
          </div>

          {/* Quick date buttons */}
          <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
            <label style={{ fontSize:"12px", fontWeight:700, color:"#6b7280" }}>⚡ سريع</label>
            <div style={{ display:"flex", gap:"7px" }}>
              {[
                { label:"أمس", offset:-1 },
                { label:"اليوم", offset:0 },
                { label:"غداً", offset:1 }
              ].map(({ label, offset }) => {
                const d = new Date(); d.setDate(d.getDate() + offset);
                const ds = d.toISOString().slice(0, 10);
                const active = selectedDate === ds;
                return (
                  <button key={label} onClick={() => { setSelectedDate(ds); setSelectedLeague("all"); }}
                    style={{ padding:"8px 14px", borderRadius:"10px", border:`1.5px solid ${active ? "#1d4ed8" : "#e5e7eb"}`, background:active ? "#1d4ed8" : "#f9fafb", color:active ? "white" : "#374151", fontSize:"13px", fontWeight:700, cursor:"pointer" }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* League filter */}
          {leagues.length > 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:"6px", flexGrow:1, minWidth:"200px" }}>
              <label style={{ fontSize:"12px", fontWeight:700, color:"#6b7280" }}>🏆 الدوري</label>
              <select
                value={selectedLeague}
                onChange={e => setSelectedLeague(e.target.value)}
                style={{ padding:"9px 14px", borderRadius:"12px", border:"1.5px solid #e5e7eb", fontSize:"14px", fontWeight:700, color:"#111827", cursor:"pointer", outline:"none", background:"#f9fafb", width:"100%" }}
              >
                <option value="all">جميع الدوريات ({ar(allMatches.length)} مباراة)</option>
                {leagues.map(l => (
                  <option key={l.id} value={String(l.id)}>
                    {TOP_LEAGUE_IDS.includes(l.id) ? "★ " : ""}{l.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </section>

        {loading && (
          <div style={{ textAlign:"center", padding:"60px", color:"#6b7280", fontSize:"18px" }}>
            جارٍ تحميل المباريات...
          </div>
        )}

        {error && (
          <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:"20px", padding:"24px", color:"#dc2626", fontSize:"16px", marginBottom:"24px" }}>
            {error}
          </div>
        )}

        {/* Live matches (today only) */}
        {!loading && isToday && filteredLive.length > 0 && (
          <section style={{ marginBottom:"28px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}>
              <span style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#16a34a", boxShadow:"0 0 8px #16a34a", display:"inline-block" }} />
              <h2 style={{ margin:0, fontSize:"24px", fontWeight:800 }}>جارية الآن ({ar(filteredLive.length)})</h2>
            </div>
            <div className="match-grid">
              {filteredLive.map(m => <MatchCard key={m.fixture?.id} match={m} />)}
            </div>
          </section>
        )}

        {/* All matches for selected date */}
        {!loading && filteredMatches.length > 0 && (
          <section>
            <h2 style={{ margin:"0 0 14px", fontSize:"24px", fontWeight:800 }}>
              {isToday ? "مباريات اليوم" : "مباريات"} ({ar(filteredMatches.length)})
            </h2>
            <div className="match-grid">
              {filteredMatches
                .sort((a, b) => (a.fixture?.timestamp || 0) - (b.fixture?.timestamp || 0))
                .map(m => <MatchCard key={m.fixture?.id} match={m} />)}
            </div>
          </section>
        )}

        {!loading && !error && filteredMatches.length === 0 && (
          <div style={{ background:"white", borderRadius:"24px", padding:"48px", textAlign:"center", color:"#6b7280", fontSize:"18px" }}>
            {selectedLeague !== "all" ? "لا توجد مباريات لهذا الدوري في هذا التاريخ." : "لا توجد مباريات لهذا التاريخ."}
          </div>
        )}
      </div>
    </main>
  );
}
