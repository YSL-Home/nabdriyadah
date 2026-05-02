import Link from "next/link";
import fs from "fs";
import path from "path";
import articles from "../../content/articles/seo-articles.json";
import playerPhotos from "../../content/player-photos.json";
import ArticleImage from "./ArticleImage";
import AdSlot from "./AdSlot";
import PlayerAvatar from "./PlayerAvatar";
import FixturesSection from "./FixturesSection";
import VideoSection from "./VideoSection";
import teamsDataRaw from "../../content/teams-data.json";
import { getT } from "../../lib/i18n";

function safeArray(v) { return Array.isArray(v) ? v : []; }

export default function LocalizedTeamPage({ slug, lang = "ar" }) {
  const tr = getT(lang);
  const isRTL = lang === "ar";
  const prefix = lang === "ar" ? "" : `/${lang}`;

  const team = teamsDataRaw[slug];
  if (!team) return (
    <main style={{ minHeight: "100vh", padding: "40px 20px", direction: isRTL ? "rtl" : "ltr", background: "var(--bg-page)" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ background: "var(--bg-card)", borderRadius: "24px", padding: "28px", border: "1px solid var(--border)" }}>
          {tr.notFound}
        </div>
      </div>
    </main>
  );

  // Articles: team-specific → same league → any football → any sport
  const teamName0 = team.name || "";
  const teamNameParts = teamName0.split(/\s+/).filter(p => p.length > 2);
  const teamArticles = (() => {
    const seen = new Set();
    const all = articles.filter(a => {
      if (!a.slug) return false;
      const key = (a.title || "").toLowerCase().slice(0, 80);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    // 1) Articles mentioning team name
    const specific = all.filter(a => {
      const text = `${a.title || ""} ${a.content || ""}`;
      return teamNameParts.some(part => text.includes(part));
    });
    if (specific.length >= 3) return specific.slice(0, 6);
    // 2) Same league articles
    const leagueMatch = all.filter(a => a.league === team.league && !specific.includes(a));
    const combined = [...specific, ...leagueMatch];
    if (combined.length >= 3) return combined.slice(0, 6);
    // 3) Football/mixed fallback
    const football = all.filter(a => (a.sport === "football" || a.league === "mixed") && !combined.includes(a));
    const withFoot = [...combined, ...football];
    if (withFoot.length >= 3) return withFoot.slice(0, 6);
    // 4) Any article
    return [...withFoot, ...all.filter(a => !withFoot.includes(a))].slice(0, 6);
  })();

  let fixtureData = { past: [], upcoming: [], slug };
  try {
    const fixturePath = path.join(process.cwd(), "content/fixtures", `${slug}.json`);
    fixtureData = JSON.parse(fs.readFileSync(fixturePath, "utf-8"));
  } catch {}

  const history = safeArray(team.history);
  const titles  = safeArray(team.titles);
  const staff   = safeArray(team.staff);
  const players = safeArray(team.players);
  const legends = safeArray(team.legends);

  const accentSoft = team.accent + "22";
  const accentMid  = team.accent + "44";

  // Locale for date formatting
  const locale = lang === "ar" ? "ar-SA" : lang === "fr" ? "fr-FR" : "en-GB";

  const statLabels = [
    { label: lang === "ar" ? "سنة التأسيس" : lang === "fr" ? "Fondé en" : "Founded", value: team.founded, icon: "📅" },
    { label: tr.teamStadium, value: team.stadium, icon: "🏟️" },
    { label: lang === "ar" ? "المدينة" : lang === "fr" ? "Ville" : "City", value: team.city, icon: "📍" },
    { label: tr.teamCoach, value: team.coach, icon: "👨‍💼" },
  ];

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-page)", padding: "0 0 60px", direction: isRTL ? "rtl" : "ltr" }}>

      {/* HERO */}
      <section style={{
        position: "relative", overflow: "hidden",
        background: `linear-gradient(135deg, ${team.colorFrom} 0%, ${team.colorTo} 60%, ${team.accent} 100%)`,
        padding: "0", color: "white", marginBottom: "0"
      }}>
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "350px", height: "350px", borderRadius: "999px", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-120px", left: "5%", width: "280px", height: "280px", borderRadius: "999px", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1450px", margin: "0 auto", padding: "40px 24px 44px", position: "relative" }}>
          <Link href={`${prefix}${team.leagueUrl || "/"}`} style={{ display: "inline-block", textDecoration: "none", color: "rgba(255,255,255,0.85)", fontWeight: 700, fontSize: "14px", marginBottom: "20px" }}>
            ← {team.leagueName}
          </Link>

          <div style={{ display: "grid", gridTemplateColumns: "200px minmax(0,1fr)", gap: "36px", alignItems: "center" }}>
            <div style={{
              background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.22)",
              borderRadius: "32px", padding: "24px",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
              <img src={team.logo} alt={team.name} style={{ width: "130px", height: "130px", objectFit: "contain", display: "block" }} />
            </div>

            <div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "14px" }}>
                {team.founded && (
                  <span style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.22)", padding: "6px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 700 }}>
                    {lang === "ar" ? "تأسس" : lang === "fr" ? "Fondé en" : "Founded"} {team.founded}
                  </span>
                )}
                {team.city && (
                  <span style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.22)", padding: "6px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 700 }}>
                    {team.city}
                  </span>
                )}
                {team.leagueName && (
                  <span style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.22)", padding: "6px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 700 }}>
                    {team.leagueName}
                  </span>
                )}
              </div>
              <h1 style={{ margin: "0 0 12px 0", fontSize: "clamp(36px, 6vw, 62px)", lineHeight: 1.15, fontWeight: 900, letterSpacing: "-1px" }}>{team.name}</h1>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {titles.slice(0, 3).map((t, i) => (
                  <span key={i} style={{ background: "rgba(255,255,255,0.13)", padding: "5px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, opacity: 0.9 }}>
                    🏆 {t.split(":")[0]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ height: "6px", background: `linear-gradient(90deg, ${team.accent}, rgba(255,255,255,0.4), ${team.colorFrom})` }} />
      </section>

      <div style={{ maxWidth: "1450px", margin: "0 auto", padding: "28px 24px 0" }}>

        <AdSlot label={lang === "ar" ? "مساحة إعلانية" : "Advertisement"} minHeight={90} style={{ marginBottom: 24 }} />

        {/* QUICK STATS */}
        <section className="g4" style={{ marginBottom: "26px" }}>
          {statLabels.map((stat, i) => (
            <div key={i} style={{
              background: "var(--bg-card)", borderRadius: "22px", padding: "20px 22px",
              border: `1px solid ${accentMid}`, borderTop: `4px solid ${team.accent}`,
              boxShadow: "var(--shadow)"
            }}>
              <div style={{ fontSize: "22px", marginBottom: "8px" }}>{stat.icon}</div>
              <div style={{ color: team.accent, fontSize: "12px", fontWeight: 700, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.label}</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-1)", lineHeight: 1.4 }}>{stat.value}</div>
            </div>
          ))}
        </section>

        {/* HISTORY + HONOURS */}
        <section className="gfeat" style={{ marginBottom: "26px" }}>
          <div style={{ background: "var(--bg-card)", borderRadius: "28px", padding: "30px", border: `1px solid ${accentMid}`, boxShadow: "var(--shadow)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{ width: "5px", height: "36px", borderRadius: "999px", background: team.accent }} />
              <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "var(--text-1)" }}>{tr.teamHistory}</h2>
            </div>
            <div style={{ display: "grid", gap: "16px" }}>
              {history.map((p, i) => (
                <p key={i} style={{ margin: 0, fontSize: "17px", lineHeight: 1.95, color: "var(--text-2)", borderRight: isRTL ? `3px solid ${accentSoft}` : "none", borderLeft: !isRTL ? `3px solid ${accentSoft}` : "none", paddingRight: isRTL ? "14px" : 0, paddingLeft: !isRTL ? "14px" : 0 }}>{p}</p>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--bg-card)", borderRadius: "28px", padding: "30px", border: `1px solid ${accentMid}`, boxShadow: "var(--shadow)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{ width: "5px", height: "36px", borderRadius: "999px", background: team.accent }} />
              <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "var(--text-1)" }}>{tr.teamTitles}</h2>
            </div>
            <div style={{ display: "grid", gap: "10px" }}>
              {titles.map((title, i) => (
                <div key={i} style={{
                  background: accentSoft, borderRadius: "14px", padding: "12px 16px",
                  display: "flex", alignItems: "flex-start", gap: "10px", border: `1px solid ${accentMid}`
                }}>
                  <span style={{ fontSize: "18px", flexShrink: 0, marginTop: "1px" }}>🏆</span>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-1)", lineHeight: 1.5 }}>{title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SQUAD + LEGENDS */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px", marginBottom: "26px" }}>
          <div style={{ background: "var(--bg-card)", borderRadius: "28px", padding: "30px", border: `1px solid ${accentMid}`, boxShadow: "var(--shadow)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{ width: "5px", height: "36px", borderRadius: "999px", background: team.accent }} />
              <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "var(--text-1)" }}>{tr.teamPlayers}</h2>
            </div>
            <div className="g2" style={{ gap: "10px" }}>
              {players.map((player, i) => (
                <Link key={i} href={`${prefix}/player/${slug}--player--${i}/`} style={{ textDecoration: "none" }}>
                  <div style={{ background: accentSoft, border: `1px solid ${accentMid}`, borderRadius: "16px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                    <PlayerAvatar src={playerPhotos[`${slug}/player/${i}`] || null} name={player} size={46} accent={team.accent} />
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-1)", lineHeight: 1.3 }}>{player}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--bg-card)", borderRadius: "28px", padding: "30px", border: `1px solid ${accentMid}`, boxShadow: "var(--shadow)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{ width: "5px", height: "36px", borderRadius: "999px", background: team.accent }} />
              <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "var(--text-1)" }}>{tr.teamLegends}</h2>
            </div>
            <div className="g2" style={{ gap: "10px" }}>
              {legends.map((legend, i) => (
                <Link key={i} href={`${prefix}/player/${slug}--legend--${i}/`} style={{ textDecoration: "none" }}>
                  <div style={{ background: accentSoft, border: `1px solid ${accentMid}`, borderRadius: "16px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                    <PlayerAvatar src={playerPhotos[`${slug}/legend/${i}`] || null} name={legend} size={46} accent={team.accent} />
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-1)", lineHeight: 1.3 }}>{legend}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* COACHING STAFF */}
        {staff.length > 0 && (
          <section style={{ background: "var(--bg-card)", borderRadius: "28px", padding: "28px", border: `1px solid ${accentMid}`, marginBottom: "26px", boxShadow: "var(--shadow)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
              <div style={{ width: "5px", height: "32px", borderRadius: "999px", background: team.accent }} />
              <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "var(--text-1)" }}>
                {lang === "ar" ? "الجهاز الفني" : lang === "fr" ? "Staff technique" : "Coaching staff"}
              </h2>
            </div>
            <div className="g4" style={{ gap: "12px" }}>
              {staff.map((s, i) => (
                <Link key={i} href={`${prefix}/player/${slug}--staff--${i}/`} style={{ textDecoration: "none" }}>
                  <div style={{ background: accentSoft, border: `1px solid ${accentMid}`, borderRadius: "16px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                    <PlayerAvatar src={playerPhotos[`${slug}/staff/${i}`] || null} name={s} size={42} accent={team.accent} />
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-1)", lineHeight: 1.35 }}>{s}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <AdSlot label={lang === "ar" ? "مساحة إعلانية وسط" : "Advertisement"} minHeight={120} style={{ marginBottom: 26 }} />

        {/* VIDEOS */}
        <VideoSection videos={team.videos} videoEmbed={team.videoEmbed} teamName={team.name} accent={team.accent} accentMid={accentMid} />

        {/* OFFICIAL LINKS */}
        <section style={{ background: "var(--bg-card)", borderRadius: "28px", padding: "28px", border: `1px solid ${accentMid}`, marginBottom: "26px", boxShadow: "var(--shadow)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
            <div style={{ width: "5px", height: "32px", borderRadius: "999px", background: team.accent }} />
            <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "var(--text-1)" }}>
              {lang === "ar" ? "روابط رسمية" : lang === "fr" ? "Liens officiels" : "Official links"}
            </h2>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a href={team.officialLinks?.website} target="_blank" rel="noreferrer nofollow"
              style={{ textDecoration: "none", padding: "12px 22px", borderRadius: "999px", background: team.accent, color: "white", fontWeight: 700, fontSize: "15px" }}>
              🌐 {lang === "ar" ? "الموقع الرسمي" : lang === "fr" ? "Site officiel" : "Official website"}
            </a>
            <a href={team.officialLinks?.youtube} target="_blank" rel="noreferrer nofollow"
              style={{ textDecoration: "none", padding: "12px 22px", borderRadius: "999px", background: "#dc2626", color: "white", fontWeight: 700, fontSize: "15px" }}>
              ▶ {lang === "ar" ? "القناة الرسمية" : "YouTube"}
            </a>
          </div>
        </section>

        {/* FIXTURES */}
        <FixturesSection fixtureData={fixtureData} teamName={team.name} accent={team.accent} lang={lang} />

        {/* RELATED ARTICLES */}
        <section style={{ background: "var(--bg-card)", borderRadius: "28px", padding: "28px", border: `1px solid ${accentMid}`, boxShadow: "var(--shadow)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ width: "5px", height: "32px", borderRadius: "999px", background: team.accent }} />
            <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "var(--text-1)" }}>
              {lang === "ar" ? `أحدث أخبار ${team.name}` : lang === "fr" ? `Actualités — ${team.name}` : `News — ${team.name}`}
            </h2>
          </div>
          {teamArticles.length === 0 ? (
            <div style={{ color: "var(--text-2)", fontSize: "17px", lineHeight: 1.9 }}>
              {lang === "ar" ? `سيتم ربط الأخبار المتعلقة بـ ${team.name} تلقائياً` : lang === "fr" ? `Les articles sur ${team.name} apparaîtront ici automatiquement.` : `Articles about ${team.name} will appear here automatically.`}
            </div>
          ) : (
            <div className="g3" style={{ gap: "18px" }}>
              {teamArticles.map((item) => {
                const displayTitle = lang === "en"
                  ? (item.en_title || item.sourceTitle || item.title)
                  : lang === "fr"
                  ? (item.fr_title || item.sourceTitle || item.title)
                  : item.title;
                const displayDesc = lang === "en"
                  ? (item.en_description || item.description)
                  : lang === "fr"
                  ? (item.fr_description || item.description)
                  : item.description;
                return (
                  <Link key={item.slug} href={`${prefix}/articles/${item.slug}/`} style={{ textDecoration: "none", color: "inherit" }}>
                    <article style={{ background: accentSoft, borderRadius: "20px", overflow: "hidden", border: `1px solid ${accentMid}`, height: "100%" }}>
                      <ArticleImage src={item.image} imageUrl={item.imageUrl} alt={displayTitle} sport={item.sport} league={item.league} slug={item.slug} style={{ width: "100%", height: "170px", display: "block" }} />
                      <div style={{ padding: "16px" }}>
                        <h3 style={{ margin: "0 0 8px 0", fontSize: "17px", lineHeight: 1.6, fontWeight: 800, color: "var(--text-1)" }}>{displayTitle}</h3>
                        <p style={{ margin: 0, color: "var(--text-2)", fontSize: "14px", lineHeight: 1.75 }}>{displayDesc}</p>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SportsTeam",
          "name": team.name,
          "sport": "Football",
          "foundingDate": team.founded,
          "location": { "@type": "Place", "name": team.stadium, "address": team.city },
          "memberOf": { "@type": "SportsOrganization", "name": team.leagueName },
          "url": `https://nabdriyadah.com${prefix}/team/${slug}/`,
          "inLanguage": lang
        })}} />
      </div>
    </main>
  );
}
