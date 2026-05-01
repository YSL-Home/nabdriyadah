"use client";
import { useState, useMemo } from "react";

function formatDate(dateStr, opts) {
  try {
    return new Date(dateStr).toLocaleDateString("ar-SA", opts);
  } catch {
    return dateStr;
  }
}

function formatTime(dateStr) {
  try {
    return new Date(dateStr).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function FixturesSection({ fixtureData, teamName, accent }) {
  const accentSoft = accent + "18";
  const accentMid = accent + "33";

  // Collect all available seasons from fixtures
  const allSeasons = useMemo(() => {
    const years = new Set();
    [...(fixtureData.past || []), ...(fixtureData.upcoming || [])].forEach(f => {
      if (f.date) {
        const y = new Date(f.date).getFullYear();
        if (y >= 2018 && y <= 2030) years.add(y);
      }
    });
    // Also add seasons from historical data
    if (fixtureData.seasons) {
      Object.keys(fixtureData.seasons).forEach(y => years.add(Number(y)));
    }
    return [...years].sort((a, b) => b - a);
  }, [fixtureData]);

  const currentYear = new Date().getFullYear();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedSeason, setSelectedSeason] = useState(
    allSeasons.includes(currentYear) ? currentYear : (allSeasons[0] || currentYear)
  );

  // Get past fixtures for selected season (from main past list or historical)
  const pastFixtures = useMemo(() => {
    let all = [...(fixtureData.past || [])];
    // Include historical seasons if available
    if (fixtureData.seasons?.[selectedSeason]) {
      all = [...all, ...(fixtureData.seasons[selectedSeason] || [])];
    }
    // Deduplicate by fixture id
    const seen = new Set();
    all = all.filter(f => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
    // Filter by season year
    return all
      .filter(f => f.date && new Date(f.date).getFullYear() === selectedSeason)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [fixtureData, selectedSeason]);

  const upcomingFixtures = fixtureData.upcoming || [];

  // Result logic
  function getResult(m) {
    const isHome = m.home?.id === fixtureData.teamId;
    const tg = isHome ? m.goals?.home : m.goals?.away;
    const og = isHome ? m.goals?.away : m.goals?.home;
    const opp = isHome ? m.away : m.home;
    if (tg === null || tg === undefined || og === null || og === undefined) {
      return { tg: null, og: null, opp, won: false, draw: false, label: "—" };
    }
    const won = tg > og;
    const draw = tg === og;
    return { tg, og, opp, won, draw, label: won ? "ف" : draw ? "ت" : "خ" };
  }

  const tabStyle = (tab) => ({
    padding: "10px 20px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
    border: "none",
    background: activeTab === tab ? accent : "#f3f4f6",
    color: activeTab === tab ? "white" : "#374151",
    transition: "all 0.15s"
  });

  return (
    <section style={{
      background: "white",
      borderRadius: "28px",
      padding: "28px",
      border: `1px solid ${accentMid}`,
      marginBottom: "26px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.04)"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "5px", height: "32px", borderRadius: "999px", background: accent }} />
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800 }}>📅 جدول المباريات</h2>
        </div>
        {fixtureData.fetchedAt && (
          <span style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 600 }}>
            آخر تحديث: {formatDate(fixtureData.fetchedAt, { day: "numeric", month: "long" })}
          </span>
        )}
      </div>

      {/* Tabs + Season selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button style={tabStyle("upcoming")} onClick={() => setActiveTab("upcoming")}>
          🔜 المقبلة {upcomingFixtures.length > 0 && `(${upcomingFixtures.length})`}
        </button>
        <button style={tabStyle("past")} onClick={() => setActiveTab("past")}>
          📊 النتائج
        </button>

        {activeTab === "past" && (
          <div style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: 600 }}>الموسم:</span>
            <select
              value={selectedSeason}
              onChange={e => setSelectedSeason(Number(e.target.value))}
              style={{
                padding: "6px 12px",
                borderRadius: "10px",
                border: `1px solid ${accentMid}`,
                fontSize: "13px",
                fontWeight: 700,
                color: "#111827",
                background: accentSoft,
                cursor: "pointer",
                outline: "none"
              }}
            >
              {/* Current + past years */}
              {[currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4].map(y => (
                <option key={y} value={y}>{y}/{y + 1}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── UPCOMING ── */}
      {activeTab === "upcoming" && (
        <div>
          {upcomingFixtures.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🗓️</div>
              <div style={{ fontSize: "15px", fontWeight: 700 }}>لا توجد مباريات مجدولة حالياً</div>
              <div style={{ fontSize: "13px", marginTop: "6px" }}>سيتم التحديث تلقائياً مع الإعلان عن المباريات</div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {upcomingFixtures.map((m) => {
                const matchDate = new Date(m.date);
                const isHome = m.home?.id === fixtureData.teamId;
                const opponent = isHome ? m.away : m.home;
                return (
                  <div key={m.id} style={{
                    background: accentSoft,
                    border: `1px solid ${accentMid}`,
                    borderRight: `4px solid ${accent}`,
                    borderRadius: "16px",
                    padding: "14px 16px",
                    display: "grid",
                    gridTemplateColumns: "80px 1fr auto",
                    alignItems: "center",
                    gap: "16px"
                  }}>
                    {/* Date block */}
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: accent }}>
                        {formatDate(m.date, { weekday: "short" })}
                      </div>
                      <div style={{ fontSize: "26px", fontWeight: 900, color: "#111827", lineHeight: 1 }}>
                        {matchDate.getDate()}
                      </div>
                      <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: 600 }}>
                        {formatDate(m.date, { month: "short", year: "numeric" })}
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "#374151", marginTop: "3px" }}>
                        {formatTime(m.date)}
                      </div>
                    </div>

                    {/* Match info */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        {opponent?.logo && (
                          <img src={opponent.logo} alt="" style={{ width: "28px", height: "28px", objectFit: "contain" }} />
                        )}
                        <span style={{ fontSize: "16px", fontWeight: 800, color: "#111827" }}>
                          {isHome ? `${teamName} ضد ${opponent?.name}` : `${opponent?.name} ضد ${teamName}`}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {m.league?.name && (
                          <span style={{ fontSize: "11px", color: "#6b7280", background: "white", padding: "3px 8px", borderRadius: "999px", fontWeight: 600 }}>
                            {m.league.name}
                          </span>
                        )}
                        {m.league?.round && (
                          <span style={{ fontSize: "11px", color: "#6b7280", background: "white", padding: "3px 8px", borderRadius: "999px", fontWeight: 600 }}>
                            {m.league.round}
                          </span>
                        )}
                        {m.venue && (
                          <span style={{ fontSize: "11px", color: "#6b7280", background: "white", padding: "3px 8px", borderRadius: "999px", fontWeight: 600 }}>
                            🏟 {m.venue}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Home/Away badge */}
                    <div style={{
                      padding: "8px 14px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: 800,
                      background: isHome ? accent : "white",
                      color: isHome ? "white" : accent,
                      border: `2px solid ${accent}`,
                      textAlign: "center",
                      whiteSpace: "nowrap"
                    }}>
                      {isHome ? "홈" : "خارج"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── PAST / HISTORICAL ── */}
      {activeTab === "past" && (
        <div>
          {pastFixtures.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
              <div style={{ fontSize: "15px", fontWeight: 700 }}>لا توجد نتائج لموسم {selectedSeason}/{selectedSeason + 1}</div>
              <div style={{ fontSize: "13px", marginTop: "6px" }}>سيتم تحميل البيانات التاريخية تلقائياً</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: 600, marginBottom: "12px" }}>
                {pastFixtures.length} مباراة — موسم {selectedSeason}/{selectedSeason + 1}
              </div>
              <div style={{ display: "grid", gap: "8px" }}>
                {pastFixtures.map((m) => {
                  const { tg, og, opp, won, draw, label } = getResult(m);
                  const hasScore = tg !== null;
                  const resultColor = !hasScore ? "#6b7280" : won ? "#16a34a" : draw ? "#ca8a04" : "#dc2626";
                  const resultBg = !hasScore ? "#f3f4f6" : won ? "#dcfce7" : draw ? "#fef9c3" : "#fee2e2";
                  const borderColor = !hasScore ? "#e5e7eb" : won ? "#bbf7d0" : draw ? "#fde68a" : "#fecaca";
                  return (
                    <div key={m.id} style={{
                      display: "grid",
                      gridTemplateColumns: "32px 72px 1fr auto 1fr",
                      alignItems: "center",
                      gap: "10px",
                      padding: "11px 14px",
                      background: "#f9fafb",
                      border: `1px solid ${borderColor}`,
                      borderRight: `4px solid ${resultColor}`,
                      borderRadius: "14px"
                    }}>
                      {/* Result badge */}
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "999px",
                        background: resultBg, color: resultColor,
                        fontSize: "12px", fontWeight: 900,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0
                      }}>
                        {hasScore ? label : "—"}
                      </div>

                      {/* Date */}
                      <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>
                        {formatDate(m.date, { day: "numeric", month: "short" })}
                      </div>

                      {/* Home */}
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", justifyContent: "flex-end", overflow: "hidden" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {m.home?.name}
                        </span>
                        {m.home?.logo && (
                          <img src={m.home.logo} alt="" style={{ width: "20px", height: "20px", objectFit: "contain", flexShrink: 0 }} />
                        )}
                      </div>

                      {/* Score */}
                      <div style={{
                        fontSize: "16px", fontWeight: 900, letterSpacing: "-0.5px",
                        color: resultColor, background: resultBg,
                        padding: "3px 12px", borderRadius: "999px",
                        textAlign: "center", whiteSpace: "nowrap", flexShrink: 0
                      }}>
                        {hasScore ? `${m.goals?.home} – ${m.goals?.away}` : "vs"}
                      </div>

                      {/* Away */}
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", overflow: "hidden" }}>
                        {m.away?.logo && (
                          <img src={m.away.logo} alt="" style={{ width: "20px", height: "20px", objectFit: "contain", flexShrink: 0 }} />
                        )}
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {m.away?.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
