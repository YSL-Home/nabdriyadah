"use client";
import { useState, useMemo } from "react";

// "ar-SA-u-nu-latn" = Arabic labels (day/month names) + Western digits (1 2 3…)
function formatDate(dateStr, opts) {
  try {
    return new Date(dateStr).toLocaleDateString("ar-SA-u-nu-latn", opts);
  } catch {
    return dateStr;
  }
}

function formatTime(dateStr) {
  try {
    return new Date(dateStr).toLocaleTimeString("ar-SA-u-nu-latn", {
      hour: "2-digit", minute: "2-digit", hour12: false
    });
  } catch {
    return "";
  }
}

export default function FixturesSection({ fixtureData, teamName, accent }) {
  const accentSoft = accent + "18";
  const accentMid  = accent + "33";

  const allSeasons = useMemo(() => {
    const years = new Set();
    [...(fixtureData.past || []), ...(fixtureData.upcoming || [])].forEach(f => {
      if (f.date) {
        const y = new Date(f.date).getFullYear();
        if (y >= 2018 && y <= 2030) years.add(y);
      }
    });
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

  const pastFixtures = useMemo(() => {
    let all = [...(fixtureData.past || [])];
    if (fixtureData.seasons?.[selectedSeason]) {
      all = [...all, ...(fixtureData.seasons[selectedSeason] || [])];
    }
    const seen = new Set();
    all = all.filter(f => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
    return all
      .filter(f => f.date && new Date(f.date).getFullYear() === selectedSeason)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [fixtureData, selectedSeason]);

  const upcomingFixtures = fixtureData.upcoming || [];

  function getResult(m) {
    const isHome = m.home?.slug === fixtureData.slug || m.home?.id === fixtureData.teamId;
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
    background: activeTab === tab ? accent : "var(--bg-soft)",
    color: activeTab === tab ? "white" : "var(--text-2)",
    transition: "all 0.15s"
  });

  /* ── Match card used for BOTH upcoming & past ── */
  function MatchCard({ m, isPast }) {
    const matchDate   = new Date(m.date);
    const isHome      = m.home?.slug === fixtureData.slug || m.home?.id === fixtureData.teamId;

    // Result colours (past only)
    let resultColor = "var(--text-3)";
    let resultBg    = "var(--bg-soft)";
    let borderLeft  = `4px solid var(--border)`;
    let badgeLabel  = "—";

    if (isPast) {
      const { won, draw, label, tg } = getResult(m);
      if (tg !== null) {
        resultColor  = won ? "#16a34a" : draw ? "#ca8a04" : "#dc2626";
        resultBg     = won ? "#dcfce7"  : draw ? "#fef9c3"  : "#fee2e2";
        borderLeft   = `4px solid ${resultColor}`;
        badgeLabel   = label;
      }
    }

    return (
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRight: borderLeft,
        borderRadius: "18px",
        padding: "14px 16px",
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        gap: "10px",
        position: "relative"
      }}>
        {/* Top meta row */}
        <div style={{
          gridColumn: "1 / -1",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "6px"
        }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {m.league?.name && (
              <span style={{
                fontSize: "11px", color: "var(--text-3)", background: "var(--bg-soft)",
                padding: "2px 8px", borderRadius: "999px", fontWeight: 600
              }}>
                {m.league.name}
              </span>
            )}
            {m.league?.round && (
              <span style={{
                fontSize: "11px", color: "var(--text-3)", background: "var(--bg-soft)",
                padding: "2px 8px", borderRadius: "999px", fontWeight: 600
              }}>
                {m.league.round}
              </span>
            )}
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 700 }}>
            {formatDate(m.date, { weekday: "short", day: "numeric", month: "short" })}
          </span>
        </div>

        {/* Home team */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          textAlign: "center"
        }}>
          {m.home?.logo ? (
            <img src={m.home.logo} alt="" style={{ width: "40px", height: "40px", objectFit: "contain" }} />
          ) : (
            <div style={{
              width: "40px", height: "40px", borderRadius: "50%",
              background: accentSoft, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "16px"
            }}>⚽</div>
          )}
          <span style={{
            fontSize: "13px", fontWeight: 800, color: "var(--text-1)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            maxWidth: "100px"
          }}>
            {m.home?.name}
          </span>
        </div>

        {/* Centre: score or time */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px"
        }}>
          {isPast ? (
            <>
              <div style={{
                fontSize: "22px", fontWeight: 900, letterSpacing: "-0.5px",
                color: resultColor, background: resultBg,
                padding: "5px 14px", borderRadius: "12px",
                textAlign: "center", whiteSpace: "nowrap"
              }}>
                {m.goals?.home ?? "—"} – {m.goals?.away ?? "—"}
              </div>
              <div style={{
                fontSize: "11px", fontWeight: 900, color: resultColor,
                background: resultBg, padding: "2px 8px",
                borderRadius: "999px"
              }}>
                {badgeLabel}
              </div>
            </>
          ) : (
            <>
              <div style={{
                fontSize: "20px", fontWeight: 900, color: accent,
                background: accentSoft, padding: "5px 14px",
                borderRadius: "12px", letterSpacing: "-0.5px"
              }}>
                {formatTime(m.date)}
              </div>
              <div style={{
                fontSize: "11px", fontWeight: 700,
                color: isHome ? accent : "var(--text-3)",
                background: isHome ? accentSoft : "var(--bg-soft)",
                padding: "2px 8px", borderRadius: "999px"
              }}>
                {isHome ? "🏠 دار" : "✈ خارج"}
              </div>
            </>
          )}
        </div>

        {/* Away team */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          textAlign: "center"
        }}>
          {m.away?.logo ? (
            <img src={m.away.logo} alt="" style={{ width: "40px", height: "40px", objectFit: "contain" }} />
          ) : (
            <div style={{
              width: "40px", height: "40px", borderRadius: "50%",
              background: accentSoft, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "16px"
            }}>⚽</div>
          )}
          <span style={{
            fontSize: "13px", fontWeight: 800, color: "var(--text-1)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            maxWidth: "100px"
          }}>
            {m.away?.name}
          </span>
        </div>
      </div>
    );
  }

  return (
    <section style={{
      background: "var(--bg-card)",
      borderRadius: "28px",
      padding: "28px",
      border: "1px solid var(--border)",
      marginBottom: "26px",
      boxShadow: "var(--shadow)"
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px", marginBottom: "22px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "5px", height: "32px", borderRadius: "999px", background: accent }} />
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "var(--text-1)" }}>
            📅 جدول المباريات
          </h2>
        </div>
        {fixtureData.fetchedAt && (
          <span style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 600 }}>
            آخر تحديث: {formatDate(fixtureData.fetchedAt, { day: "numeric", month: "long" })}
          </span>
        )}
      </div>

      {/* Tabs + Season selector */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        marginBottom: "20px", flexWrap: "wrap"
      }}>
        <button style={tabStyle("upcoming")} onClick={() => setActiveTab("upcoming")}>
          🔜 المقبلة {upcomingFixtures.length > 0 && `(${upcomingFixtures.length})`}
        </button>
        <button style={tabStyle("past")} onClick={() => setActiveTab("past")}>
          📊 النتائج
        </button>

        {activeTab === "past" && (
          <div style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-3)", fontWeight: 600 }}>الموسم:</span>
            <select
              value={selectedSeason}
              onChange={e => setSelectedSeason(Number(e.target.value))}
              style={{
                padding: "6px 12px",
                borderRadius: "10px",
                border: `1px solid ${accentMid}`,
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--text-1)",
                background: "var(--bg-soft)",
                cursor: "pointer",
                outline: "none"
              }}
            >
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
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-3)" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🗓️</div>
              <div style={{ fontSize: "15px", fontWeight: 700 }}>لا توجد مباريات مجدولة حالياً</div>
              <div style={{ fontSize: "13px", marginTop: "6px" }}>سيتم التحديث تلقائياً مع الإعلان عن المباريات</div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {upcomingFixtures.map(m => (
                <MatchCard key={m.id} m={m} isPast={false} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PAST / RESULTS ── */}
      {activeTab === "past" && (
        <div>
          {pastFixtures.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-3)" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
              <div style={{ fontSize: "15px", fontWeight: 700 }}>
                لا توجد نتائج لموسم {selectedSeason}/{selectedSeason + 1}
              </div>
              <div style={{ fontSize: "13px", marginTop: "6px" }}>سيتم تحميل البيانات التاريخية تلقائياً</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: "13px", color: "var(--text-3)", fontWeight: 600, marginBottom: "12px" }}>
                {pastFixtures.length} مباراة — موسم {selectedSeason}/{selectedSeason + 1}
              </div>
              <div style={{ display: "grid", gap: "12px" }}>
                {pastFixtures.map(m => (
                  <MatchCard key={m.id} m={m} isPast={true} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
