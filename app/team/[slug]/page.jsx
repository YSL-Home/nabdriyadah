import Link from "next/link";
import { notFound } from "next/navigation";
import { allTeams, teamsMap } from "../../data/teams";
import AdSlot from "../../components/AdSlot";

export function generateStaticParams() {
  return allTeams.map((team) => ({
    slug: team.slug
  }));
}

export function generateMetadata({ params }) {
  const team = teamsMap[params.slug];

  if (!team) {
    return {
      title: "الفريق غير موجود",
      description: "هذه الصفحة غير متوفرة حالياً."
    };
  }

  return {
    title: team.name,
    description: `تعرّف على تاريخ ${team.name} وأبرز ألقابه وملامح هويته داخل ${team.leagueName}.`,
    alternates: {
      canonical: `https://nabdriyadah.com/team/${team.slug}/`
    },
    openGraph: {
      title: team.name,
      description: `صفحة تعريفية خاصة بفريق ${team.name}.`,
      url: `https://nabdriyadah.com/team/${team.slug}/`,
      siteName: "نبض الرياضة",
      locale: "ar_AR",
      type: "website"
    }
  };
}

export default function TeamPage({ params }) {
  const team = teamsMap[params.slug];

  if (!team) {
    notFound();
  }

  const c = team.colors;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: c.bg,
        padding: "28px 20px 52px",
        direction: "rtl"
      }}
    >
      <div style={{ maxWidth: "1420px", margin: "0 auto" }}>
        <section
          style={{
            background: `linear-gradient(135deg, ${c.primary}, ${c.text})`,
            borderRadius: "34px",
            padding: "34px",
            color: "white",
            marginBottom: "28px",
            boxShadow: "0 18px 42px rgba(0,0,0,0.12)"
          }}
        >
          <Link
            href={`/league/${team.league}/`}
            style={{
              display: "inline-block",
              textDecoration: "none",
              color: "white",
              fontWeight: 700,
              fontSize: "14px",
              marginBottom: "16px"
            }}
          >
            العودة إلى صفحة البطولة
          </Link>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "180px minmax(0, 1fr)",
              gap: "26px",
              alignItems: "center"
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: "28px",
                padding: "20px",
                textAlign: "center"
              }}
            >
              <img
                src={team.logo}
                alt={team.name}
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "contain",
                  display: "block",
                  margin: "0 auto"
                }}
              />
            </div>

            <div>
              <div
                style={{
                  display: "inline-block",
                  background: "rgba(255,255,255,0.14)",
                  padding: "9px 14px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: 700,
                  marginBottom: "14px"
                }}
              >
                صفحة فريق
              </div>

              <h1
                style={{
                  margin: "0 0 14px 0",
                  fontSize: "58px",
                  lineHeight: 1.2,
                  fontWeight: 800
                }}
              >
                {team.name}
              </h1>

              <p
                style={{
                  margin: 0,
                  fontSize: "21px",
                  lineHeight: 2,
                  maxWidth: "900px",
                  opacity: 0.96
                }}
              >
                صفحة تعريفية خاصة بفريق {team.name} تشمل لمحة تاريخية، ملامح الهوية،
                أهم الإنجازات، وعناصر البنية الرياضية الخاصة بالنادي.
              </p>
            </div>
          </div>
        </section>

        <AdSlot label="Ad - Team hero bottom" minHeight={120} style={{ marginBottom: 24 }} />

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "0.95fr 1.05fr",
            gap: "24px",
            marginBottom: "28px"
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "28px",
              padding: "28px",
              border: `1px solid ${c.border}`,
              boxShadow: "0 12px 30px rgba(0,0,0,0.05)"
            }}
          >
            <div
              style={{
                color: c.primary,
                fontSize: "14px",
                fontWeight: 700,
                marginBottom: "10px"
              }}
            >
              بطاقة تعريف
            </div>

            <h2
              style={{
                margin: "0 0 16px 0",
                fontSize: "34px",
                lineHeight: 1.4,
                fontWeight: 800,
                color: c.text
              }}
            >
              {team.name}
            </h2>

            <div style={{ display: "grid", gap: "12px" }}>
              <div style={{ color: c.subtext, fontSize: "17px", lineHeight: 1.9 }}>
                <strong style={{ color: c.text }}>سنة التأسيس:</strong> {team.yearFounded}
              </div>
              <div style={{ color: c.subtext, fontSize: "17px", lineHeight: 1.9 }}>
                <strong style={{ color: c.text }}>المدينة:</strong> {team.city}
              </div>
              <div style={{ color: c.subtext, fontSize: "17px", lineHeight: 1.9 }}>
                <strong style={{ color: c.text }}>الملعب:</strong> {team.stadium}
              </div>
              <div style={{ color: c.subtext, fontSize: "17px", lineHeight: 1.9 }}>
                <strong style={{ color: c.text }}>البطولة:</strong> {team.leagueName}
              </div>
              <div style={{ color: c.subtext, fontSize: "17px", lineHeight: 1.9 }}>
                <strong style={{ color: c.text }}>المدرب:</strong> {team.coach}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "22px"
              }}
            >
              <a
                href={team.officialLinks.website}
                target
