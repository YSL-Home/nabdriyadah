import Link from "next/link";
import fs from "fs";
import path from "path";
import articles from "../../../content/articles/seo-articles.json";
import playerPhotos from "../../../content/player-photos.json";
import ArticleImage from "../../components/ArticleImage";
import AdSlot from "../../components/AdSlot";
import PlayerAvatar from "../../components/PlayerAvatar";
import teamsDataRaw from "../../../content/teams-data.json";

const teamsData = teamsDataRaw;

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function generateStaticParams() {
  return Object.keys(teamsData).map((slug) => ({
    slug
  }));
}

export function generateMetadata({ params }) {
  const team = teamsData[params.slug];
  if (!team) return { title: "الفريق غير موجود", description: "هذه الصفحة غير متاحة." };
  return {
    title: `${team.name} — تاريخ، ألقاب، ملعب وأبطال | نبض الرياضة`,
    description: `كل ما تريد معرفته عن ${team.name}: التاريخ، الألقاب، الملعب، الجهاز الفني، أبرز اللاعبين والأساطير. متابعة حصرية على نبض الرياضة.`,
    keywords: [team.name, team.leagueName, team.city, team.stadium, "كرة القدم", "نبض الرياضة"].join(", "),
    alternates: { canonical: `https://nabdriyadah.com/team/${params.slug}/` },
    openGraph: {
      title: `${team.name} | نبض الرياضة`,
      description: `تاريخ ${team.name}، الألقاب، الملعب والأبطال — تغطية شاملة.`,
      url: `https://nabdriyadah.com/team/${params.slug}/`,
      siteName: "نبض الرياضة",
      locale: "ar_AR",
      type: "website"
    }
  };
}

// Derive a soft background from the team accent color
function softBg(hex = "#1d4ed8") {
  return hex + "18";
}

export default function TeamPage({ params }) {
  const team = teamsData[params.slug];

  if (!team) {
    return (
      <main style={{ minHeight: "100vh", padding: "40px 20px", direction: "rtl", background: "#f8fafc" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ background: "white", borderRadius: "24px", padding: "28px", border: "1px solid #e5e7eb" }}>
            الفريق غير موجود.
          </div>
        </div>
      </main>
    );
  }

  const teamArticles = articles
    .filter((a) => a.league === team.league || (a.keywords || []).some((k) => team.name.includes(k) || k.includes(team.name.split(" ")[0])))
    .filter((a) => a.slug)
    .slice(0, 6);

  // Load fixture data (populated by fetch-fixtures.mjs)
  let fixtureData = { past: [], upcoming: [] };
  try {
    const fixturePath = path.join(process.cwd(), "content/fixtures", `${params.slug}.json`);
    fixtureData = JSON.parse(fs.readFileSync(fixturePath, "utf-8"));
  } catch {}

  const history = safeArray(team.history);
  const titles = safeArray(team.titles);
  const staff = safeArray(team.staff);
  const players = safeArray(team.players);
  const legends = safeArray(team.legends);

  const accentSoft = team.accent + "22";
  const accentMid = team.accent + "44";
  const pageBg = team.colorFrom + "0d";

  return (
    <main style={{ minHeight: "100vh", background: pageBg || "#f3f4f6", padding: "0 0 60px", direction: "rtl" }}>

      {/* ── FULL-WIDTH HERO ── */}
      <section style={{
        position: "relative", overflow: "hidden",
        background: `linear-gradient(135deg, ${team.colorFrom} 0%, ${team.colorTo} 60%, ${team.accent} 100%)`,
        padding: "0", color: "white", marginBottom: "0"
      }}>
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "350px", height: "350px", borderRadius: "999px", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-120px", left: "5%", width: "280px", height: "280px", borderRadius: "999px", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", left: "45%", width: "180px", height: "180px", borderRadius: "999px", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1450px", margin: "0 auto", padding: "40px 24px 44px", position: "relative" }}>
          <Link href={team.leagueUrl} style={{ display: "inline-block", textDecoration: "none", color: "rgba(255,255,255,0.85)", fontWeight: 700, fontSize: "14px", marginBottom: "20px" }}>
            ← {team.leagueName}
          </Link>

          <div style={{ display: "grid", gridTemplateColumns: "200px minmax(0,1fr)", gap: "36px", alignItems: "center" }}>
            {/* Logo box */}
            <div style={{
              background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.22)",
              borderRadius: "32px", padding: "24px",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
              <img src={team.logo} alt={team.name} style={{ width: "130px", height: "130px", objectFit: "contain", display: "block" }} />
            </div>

            {/* Name + meta */}
            <div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "14px" }}>
                <span style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.22)", padding: "6px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 700 }}>
                  تأسس {team.founded}
                </span>
                <span style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.22)", padding: "6px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 700 }}>
                  {team.city}
                </span>
                <span style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.22)", padding: "6px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 700 }}>
                  {team.leagueName}
                </span>
              </div>
              <h1 style={{ margin: "0 0 12px 0", fontSize: "62px", lineHeight: 1.15, fontWeight: 900, letterSpacing: "-1px" }}>{team.name}</h1>
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

        {/* Color band at bottom */}
        <div style={{ height: "6px", background: `linear-gradient(90deg, ${team.accent}, rgba(255,255,255,0.4), ${team.colorFrom})` }} />
      </section>

      <div style={{ maxWidth: "1450px", margin: "0 auto", padding: "28px 24px 0" }}>

        <AdSlot label="مساحة إعلانية" minHeight={90} style={{ marginBottom: 24 }} />

        {/* ── QUICK STATS BAR ── */}
        <section className="g4" style={{ marginBottom: "26px" }}>
          {[
            { label: "سنة التأسيس", value: team.founded, icon: "📅" },
            { label: "الملعب", value: team.stadium, icon: "🏟️" },
            { label: "المدينة", value: team.city, icon: "📍" },
            { label: "المدرب", value: team.coach, icon: "👨‍💼" }
          ].map((stat, i) => (
            <div key={i} style={{
              background: "white", borderRadius: "22px", padding: "20px 22px",
              border: `1px solid ${accentMid}`,
              borderTop: `4px solid ${team.accent}`,
              boxShadow: "0 6px 18px rgba(0,0,0,0.04)"
            }}>
              <div style={{ fontSize: "22px", marginBottom: "8px" }}>{stat.icon}</div>
              <div style={{ color: team.accent, fontSize: "12px", fontWeight: 700, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.label}</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#111827", lineHeight: 1.4 }}>{stat.value}</div>
            </div>
          ))}
        </section>

        {/* ── HISTORY + PALMARÈS ── */}
        <section className="gfeat" style={{ marginBottom: "26px" }}>

          {/* History */}
          <div style={{ background: "white", borderRadius: "28px", padding: "30px", border: `1px solid ${accentMid}`, boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{ width: "5px", height: "36px", borderRadius: "999px", background: team.accent }} />
              <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#111827" }}>تاريخ النادي</h2>
            </div>
            <div style={{ display: "grid", gap: "16px" }}>
              {history.map((p, i) => (
                <p key={i} style={{ margin: 0, fontSize: "17px", lineHeight: 1.95, color: "#374151", borderRight: `3px solid ${accentSoft}`, paddingRight: "14px" }}>{p}</p>
              ))}
            </div>
          </div>

          {/* Palmarès */}
          <div style={{ background: "white", borderRadius: "28px", padding: "30px", border: `1px solid ${accentMid}`, boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{ width: "5px", height: "36px", borderRadius: "999px", background: team.accent }} />
              <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#111827" }}>قاعة الألقاب</h2>
            </div>
            <div style={{ display: "grid", gap: "10px" }}>
              {titles.map((title, i) => (
                <div key={i} style={{
                  background: accentSoft, borderRadius: "14px", padding: "12px 16px",
                  display: "flex", alignItems: "flex-start", gap: "10px",
                  border: `1px solid ${accentMid}`
                }}>
                  <span style={{ fontSize: "18px", flexShrink: 0, marginTop: "1px" }}>🏆</span>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#111827", lineHeight: 1.5 }}>{title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SQUAD + LEGENDS ── */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px", marginBottom: "26px" }}>

          {/* Current players */}
          <div style={{ background: "white", borderRadius: "28px", padding: "30px", border: `1px solid ${accentMid}`, boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{ width: "5px", height: "36px", borderRadius: "999px", background: team.accent }} />
              <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 800 }}>أبرز اللاعبين الحاليين</h2>
            </div>
            <div className="g2" style={{ gap: "10px" }}>
              {players.map((player, i) => (
                <Link key={i} href={`/player/${params.slug}--player--${i}/`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: accentSoft, border: `1px solid ${accentMid}`,
                    borderRadius: "16px", padding: "12px 14px",
                    display: "flex", alignItems: "center", gap: "10px",
                    cursor: "pointer", transition: "box-shadow 0.15s"
                  }}>
                    <PlayerAvatar
                      src={playerPhotos[`${params.slug}/player/${i}`] || null}
                      name={player} size={46} accent={team.accent}
                    />
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>{player}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Legends */}
          <div style={{ background: "white", borderRadius: "28px", padding: "30px", border: `1px solid ${accentMid}`, boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{ width: "5px", height: "36px", borderRadius: "999px", background: team.accent }} />
              <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 800 }}>أساطير النادي</h2>
            </div>
            <div className="g2" style={{ gap: "10px" }}>
              {legends.map((legend, i) => (
                <Link key={i} href={`/player/${params.slug}--legend--${i}/`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: accentSoft, border: `1px solid ${accentMid}`,
                    borderRadius: "16px", padding: "12px 14px",
                    display: "flex", alignItems: "center", gap: "10px", cursor: "pointer"
                  }}>
                    <PlayerAvatar
                      src={playerPhotos[`${params.slug}/legend/${i}`] || null}
                      name={legend} size={46} accent={team.accent}
                    />
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>{legend}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── COACHING STAFF ── */}
        {staff.length > 0 && (
          <section style={{ background: "white", borderRadius: "28px", padding: "28px", border: `1px solid ${accentMid}`, marginBottom: "26px", boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
              <div style={{ width: "5px", height: "32px", borderRadius: "999px", background: team.accent }} />
              <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 800 }}>الجهاز الفني</h2>
            </div>
            <div className="g4" style={{ gap: "12px" }}>
              {staff.map((s, i) => (
                <Link key={i} href={`/player/${params.slug}--staff--${i}/`} style={{ textDecoration: "none" }}>
                  <div style={{ background: accentSoft, border: `1px solid ${accentMid}`, borderRadius: "16px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                    <PlayerAvatar
                      src={playerPhotos[`${params.slug}/staff/${i}`] || null}
                      name={s} size={42} accent={team.accent}
                    />
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", lineHeight: 1.35 }}>{s}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <AdSlot label="مساحة إعلانية وسط" minHeight={120} style={{ marginBottom: 26 }} />

        {/* ── VIDEOS ── */}
        {(() => {
          const videoIds = (team.videos && team.videos.length > 0)
            ? team.videos
            : team.videoEmbed
              ? [team.videoEmbed.replace("https://www.youtube.com/embed/", "").split("?")[0]]
              : [];
          if (videoIds.length === 0) return null;
          return (
            <section style={{ background: "white", borderRadius: "28px", padding: "28px", border: `1px solid ${accentMid}`, marginBottom: "26px", boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
                <div style={{ width: "5px", height: "32px", borderRadius: "999px", background: team.accent }} />
                <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 800 }}>▶ فيديوهات الفريق</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: videoIds.length === 1 ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                {videoIds.map((id, idx) => (
                  <div key={idx} style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "16px", background: "#000" }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${id}`}
                      title={`${team.name} — فيديو ${idx + 1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0, borderRadius: "16px" }}
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        {/* ── OFFICIAL LINKS ── */}
        <section style={{ background: "white", borderRadius: "28px", padding: "28px", border: `1px solid ${accentMid}`, marginBottom: "26px", boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
            <div style={{ width: "5px", height: "32px", borderRadius: "999px", background: team.accent }} />
            <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 800 }}>روابط رسمية</h2>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a href={team.officialLinks.website} target="_blank" rel="noreferrer nofollow"
              style={{ textDecoration: "none", padding: "12px 22px", borderRadius: "999px", background: team.accent, color: "white", fontWeight: 700, fontSize: "15px" }}>
              🌐 الموقع الرسمي
            </a>
            <a href={team.officialLinks.youtube} target="_blank" rel="noreferrer nofollow"
              style={{ textDecoration: "none", padding: "12px 22px", borderRadius: "999px", background: "#dc2626", color: "white", fontWeight: 700, fontSize: "15px" }}>
              ▶ القناة الرسمية
            </a>
          </div>
        </section>

        {/* ── FIXTURES ── */}
        {(fixtureData.upcoming.length > 0 || fixtureData.past.length > 0) && (
          <section style={{ background: "white", borderRadius: "28px", padding: "28px", border: `1px solid ${accentMid}`, marginBottom: "26px", boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "22px" }}>
              <div style={{ width: "5px", height: "32px", borderRadius: "999px", background: team.accent }} />
              <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 800 }}>المباريات</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              {/* Upcoming */}
              {fixtureData.upcoming.length > 0 && (
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: team.accent, marginBottom: "12px", textTransform: "uppercase" }}>المقبلة</div>
                  <div style={{ display: "grid", gap: "10px" }}>
                    {fixtureData.upcoming.slice(0, 5).map((m) => (
                      <div key={m.id} style={{ background: accentSoft, border: `1px solid ${accentMid}`, borderRadius: "16px", padding: "14px 16px" }}>
                        <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "6px" }}>
                          {m.league?.name} — {new Date(m.date).toLocaleDateString("ar-SA", { weekday: "short", month: "short", day: "numeric" })}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "15px", fontWeight: 800, color: "#111827" }}>{m.home?.name}</span>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", padding: "3px 10px", background: "white", borderRadius: "999px" }}>vs</span>
                          <span style={{ fontSize: "15px", fontWeight: 800, color: "#111827" }}>{m.away?.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Past */}
              {fixtureData.past.length > 0 && (
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#6b7280", marginBottom: "12px", textTransform: "uppercase" }}>الأخيرة</div>
                  <div style={{ display: "grid", gap: "10px" }}>
                    {fixtureData.past.slice(0, 5).map((m) => {
                      const isHome = m.home?.id === fixtureData.teamId;
                      const teamGoals = isHome ? m.goals?.home : m.goals?.away;
                      const oppGoals = isHome ? m.goals?.away : m.goals?.home;
                      const oppName = isHome ? m.away?.name : m.home?.name;
                      const won = teamGoals > oppGoals;
                      const draw = teamGoals === oppGoals;
                      return (
                        <div key={m.id} style={{ background: "white", border: `2px solid ${won ? "#bbf7d0" : draw ? "#fef08a" : "#fecaca"}`, borderRadius: "16px", padding: "14px 16px" }}>
                          <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "6px" }}>
                            {m.league?.name} — {new Date(m.date).toLocaleDateString("ar-SA", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{team.name}</span>
                            <span style={{
                              fontSize: "18px", fontWeight: 900, letterSpacing: "-0.5px",
                              color: won ? "#16a34a" : draw ? "#ca8a04" : "#dc2626",
                              padding: "2px 12px", background: won ? "#dcfce7" : draw ? "#fef9c3" : "#fee2e2",
                              borderRadius: "999px"
                            }}>
                              {teamGoals} — {oppGoals}
                            </span>
                            <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{oppName}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── RELATED ARTICLES ── */}
        <section style={{ background: "white", borderRadius: "28px", padding: "28px", border: `1px solid ${accentMid}`, boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ width: "5px", height: "32px", borderRadius: "999px", background: team.accent }} />
            <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 800 }}>أحدث أخبار {team.name}</h2>
          </div>
          {teamArticles.length === 0 ? (
            <div style={{ color: "#6b7280", fontSize: "17px", lineHeight: 1.9 }}>
              سيتم ربط الأخبار المتعلقة بـ {team.name} تلقائياً مع نمو المحتوى.
            </div>
          ) : (
            <div className="g3" style={{ gap: "18px" }}>
              {teamArticles.map((item) => (
                <Link key={item.slug} href={`/articles/${item.slug}/`} style={{ textDecoration: "none", color: "inherit" }}>
                  <article style={{ background: accentSoft, borderRadius: "20px", overflow: "hidden", border: `1px solid ${accentMid}`, height: "100%" }}>
                    <ArticleImage src={item.image} imageUrl={item.imageUrl} alt={item.title} sport={item.sport} league={item.league} slug={item.slug} style={{ width: "100%", height: "170px", display: "block" }} />
                    <div style={{ padding: "16px" }}>
                      <h3 style={{ margin: "0 0 8px 0", fontSize: "17px", lineHeight: 1.6, fontWeight: 800, color: "#111827" }}>{item.title}</h3>
                      <p style={{ margin: 0, color: "#4b5563", fontSize: "14px", lineHeight: 1.75 }}>{item.description}</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── JSON-LD ── */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SportsTeam",
          "name": team.name,
          "sport": "كرة القدم",
          "foundingDate": team.founded,
          "location": { "@type": "Place", "name": team.stadium, "address": team.city },
          "memberOf": { "@type": "SportsOrganization", "name": team.leagueName },
          "url": `https://nabdriyadah.com/team/${params.slug}/`
        })}} />
      </div>
    </main>
  );
}
