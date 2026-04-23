import Link from "next/link";
import { notFound } from "next/navigation";
import AdSlot from "../../components/AdSlot";

const teams = {
  "manchester-city": {
    name: "مانشستر سيتي",
    league: "premier-league",
    leagueName: "الدوري الإنجليزي الممتاز",
    colorFrom: "#4f46e5",
    colorTo: "#7c3aed",
    accent: "#6366f1",
    logo: "/teams/premier-league/manchester-city.png",
    founded: "1880",
    stadium: "الاتحاد",
    city: "مانشستر",
    coach: "المدرب الحالي حسب آخر تحديثات النادي الرسمية",
    titles: [
      "الدوري الإنجليزي الممتاز",
      "كأس الاتحاد الإنجليزي",
      "كأس الرابطة",
      "دوري أبطال أوروبا"
    ],
    history: [
      "يعد مانشستر سيتي من الأندية البارزة في كرة القدم الإنجليزية، وقد عرف تطورًا كبيرًا خلال العقود الأخيرة على مستوى النتائج والهوية الفنية.",
      "ارتبط اسم النادي بمدينة مانشستر، ونجح في تكوين قاعدة جماهيرية واسعة بفضل أسلوبه الهجومي وحضوره المستمر في المنافسات المحلية والأوروبية.",
      "خلال السنوات الأخيرة، تحول النادي إلى واحد من أبرز القوى الكروية في أوروبا، مع حضور قوي في سباقات الدوري والكؤوس."
    ],
    staff: [
      "مدير فني",
      "جهاز مساعد فني",
      "إدارة رياضية",
      "طاقم طبي وإعداد بدني"
    ],
    squad: [
      "حراس مرمى",
      "مدافعون",
      "لاعبو وسط",
      "مهاجمون"
    ],
    officialLinks: {
      website: "https://www.mancity.com",
      youtube: "https://www.youtube.com/@mancity"
    }
  },
  "manchester-united": {
    name: "مانشستر يونايتد",
    league: "premier-league",
    leagueName: "الدوري الإنجليزي الممتاز",
    colorFrom: "#7f1d1d",
    colorTo: "#dc2626",
    accent: "#ef4444",
    logo: "/teams/premier-league/manchester-united.png",
    founded: "1878",
    stadium: "أولد ترافورد",
    city: "مانشستر",
    coach: "المدرب الحالي حسب آخر تحديثات النادي الرسمية",
    titles: ["الدوري الإنجليزي", "كأس الاتحاد", "كأس الرابطة", "دوري أبطال أوروبا"],
    history: [
      "يعد مانشستر يونايتد من أكثر الأندية شهرة في العالم، ويملك إرثًا كبيرًا في الكرة الإنجليزية والأوروبية.",
      "بنى النادي مكانته بفضل ألقابه المحلية وتاريخه الطويل مع النجوم والمدربين البارزين.",
      "يبقى اليونايتد من الأندية الأكثر متابعة جماهيريًا، سواء داخل إنجلترا أو على مستوى العالم."
    ],
    staff: ["مدير فني", "جهاز فني", "إدارة كروية", "طاقم طبي"],
    squad: ["حراس مرمى", "دفاع", "وسط", "هجوم"],
    officialLinks: {
      website: "https://www.manutd.com",
      youtube: "https://www.youtube.com/@manutd"
    }
  },
  "liverpool": {
    name: "ليفربول",
    league: "premier-league",
    leagueName: "الدوري الإنجليزي الممتاز",
    colorFrom: "#991b1b",
    colorTo: "#ef4444",
    accent: "#dc2626",
    logo: "/teams/premier-league/liverpool.png",
    founded: "1892",
    stadium: "أنفيلد",
    city: "ليفربول",
    coach: "المدرب الحالي حسب آخر تحديثات النادي الرسمية",
    titles: ["الدوري الإنجليزي", "كأس الاتحاد", "كأس الرابطة", "دوري أبطال أوروبا"],
    history: [
      "ليفربول من أكثر الأندية عراقة في الكرة الإنجليزية، ويملك إرثًا كبيرًا على المستوى المحلي والأوروبي.",
      "عرف النادي بفتراته الذهبية، وارتبط اسمه بأجواء أنفيلد وجمهوره الكبير.",
      "لا يزال ليفربول من أكثر الفرق تأثيرًا في مشهد الدوري الإنجليزي."
    ],
    staff: ["مدير فني", "جهاز فني", "إدارة رياضية", "طاقم طبي"],
    squad: ["حراس مرمى", "مدافعون", "وسط", "مهاجمون"],
    officialLinks: {
      website: "https://www.liverpoolfc.com",
      youtube: "https://www.youtube.com/@LiverpoolFC"
    }
  },
  "arsenal": {
    name: "آرسنال",
    league: "premier-league",
    leagueName: "الدوري الإنجليزي الممتاز",
    colorFrom: "#991b1b",
    colorTo: "#f97316",
    accent: "#ef4444",
    logo: "/teams/premier-league/arsenal.png",
    founded: "1886",
    stadium: "الإمارات",
    city: "لندن",
    coach: "المدرب الحالي حسب آخر تحديثات النادي الرسمية",
    titles: ["الدوري الإنجليزي", "كأس الاتحاد", "الدرع الخيرية"],
    history: [
      "آرسنال واحد من الأندية التاريخية في لندن وإنجلترا، ويمتلك قاعدة جماهيرية كبيرة.",
      "تميز النادي عبر تاريخه بأسلوب لعب جميل ومواهب بارزة، إلى جانب حضوره المستمر في المنافسات الكبرى.",
      "يبقى الفريق من أكثر الأسماء حضورًا في أخبار وتحليلات البريميرليغ."
    ],
    staff: ["مدير فني", "جهاز مساعد", "إدارة رياضية", "طاقم طبي"],
    squad: ["حراسة", "دفاع", "وسط", "هجوم"],
    officialLinks: {
      website: "https://www.arsenal.com",
      youtube: "https://www.youtube.com/@arsenal"
    }
  },
  "chelsea": {
    name: "تشيلسي",
    league: "premier-league",
    leagueName: "الدوري الإنجليزي الممتاز",
    colorFrom: "#1d4ed8",
    colorTo: "#2563eb",
    accent: "#3b82f6",
    logo: "/teams/premier-league/chelsea.png",
    founded: "1905",
    stadium: "ستامفورد بريدج",
    city: "لندن",
    coach: "المدرب الحالي حسب آخر تحديثات النادي الرسمية",
    titles: ["الدوري الإنجليزي", "كأس الاتحاد", "دوري أبطال أوروبا"],
    history: [
      "تشيلسي من أندية القمة في إنجلترا، وقد حقق نجاحات محلية وقارية كبيرة.",
      "ارتبط النادي بمرحلة حديثة قوية جعلته من أبرز الأسماء في أوروبا.",
      "يحظى البلوز بمتابعة كبيرة بفضل حضوره الدائم في سباقات الألقاب."
    ],
    staff: ["مدير فني", "جهاز فني", "إدارة كروية", "طاقم طبي"],
    squad: ["حراس", "دفاع", "وسط", "هجوم"],
    officialLinks: {
      website: "https://www.chelseafc.com",
      youtube: "https://www.youtube.com/@chelseafc"
    }
  },
  "tottenham": {
    name: "توتنهام",
    league: "premier-league",
    leagueName: "الدوري الإنجليزي الممتاز",
    colorFrom: "#0f172a",
    colorTo: "#334155",
    accent: "#475569",
    logo: "/teams/premier-league/tottenham.png",
    founded: "1882",
    stadium: "توتنهام هوتسبير",
    city: "لندن",
    coach: "المدرب الحالي حسب آخر تحديثات النادي الرسمية",
    titles: ["كأس الاتحاد", "كأس الرابطة", "منافسات أوروبية تاريخية"],
    history: [
      "توتنهام من الأندية المعروفة في العاصمة لندن، ويملك حضورًا ثابتًا في الكرة الإنجليزية.",
      "يتميز النادي بجماهيره الكبيرة وبسعيه الدائم إلى تثبيت موقعه بين كبار البريميرليغ.",
      "وغالبًا ما يكون الفريق حاضرًا في سباقات المراكز المتقدمة والمنافسات القارية."
    ],
    staff: ["مدير فني", "جهاز فني", "إدارة رياضية"],
    squad: ["حراسة", "دفاع", "وسط", "هجوم"],
    officialLinks: {
      website: "https://www.tottenhamhotspur.com",
      youtube: "https://www.youtube.com/@TottenhamHotspur"
    }
  },
  "real-madrid": {
    name: "ريال مدريد",
    league: "la-liga",
    leagueName: "الدوري الإسباني",
    colorFrom: "#1e293b",
    colorTo: "#64748b",
    accent: "#94a3b8",
    logo: "/teams/la-liga/real-madrid.png",
    founded: "1902",
    stadium: "سانتياغو برنابيو",
    city: "مدريد",
    coach: "المدرب الحالي حسب آخر تحديثات النادي الرسمية",
    titles: ["الدوري الإسباني", "كأس الملك", "دوري أبطال أوروبا", "كأس العالم للأندية"],
    history: [
      "ريال مدريد من أنجح الأندية في تاريخ كرة القدم العالمية، ويملك إرثًا استثنائيًا على مستوى الألقاب والشهرة.",
      "ارتبط اسم النادي بكبار النجوم والمدربين، واحتل مكانة مركزية في تاريخ الليغا ودوري الأبطال.",
      "يبقى الريال واحدًا من أكثر الفرق متابعة وتأثيرًا في المشهد الكروي العالمي."
    ],
    staff: ["مدير فني", "جهاز فني", "إدارة رياضية", "طاقم طبي"],
    squad: ["حراسة", "دفاع", "وسط", "هجوم"],
    officialLinks: {
      website: "https://www.realmadrid.com",
      youtube: "https://www.youtube.com/@RealMadrid"
    }
  },
  "barcelona": {
    name: "برشلونة",
    league: "la-liga",
    leagueName: "الدوري الإسباني",
    colorFrom: "#1d4ed8",
    colorTo: "#7c2d12",
    accent: "#2563eb",
    logo: "/teams/la-liga/barcelona.png",
    founded: "1899",
    stadium: "كامب نو",
    city: "برشلونة",
    coach: "المدرب الحالي حسب آخر تحديثات النادي الرسمية",
    titles: ["الدوري الإسباني", "كأس الملك", "دوري أبطال أوروبا", "السوبر الإسباني"],
    history: [
      "برشلونة من أعظم أندية العالم، ويتميز بهويته الكروية الخاصة وبمدرسته الشهيرة في تطوير المواهب.",
      "حقق النادي نجاحات كبيرة محليًا وقاريًا، وظل حاضرًا في قمة المنافسة لسنوات طويلة.",
      "يرتبط اسم برشلونة بأسلوب لعب جذاب وبنجوم بارزين تركوا بصمتهم في تاريخ اللعبة."
    ],
    staff: ["مدير فني", "جهاز فني", "إدارة", "طاقم طبي"],
    squad: ["حراسة", "دفاع", "وسط", "هجوم"],
    officialLinks: {
      website: "https://www.fcbarcelona.com",
      youtube: "https://www.youtube.com/@FCBarcelona"
    }
  },
  "atletico-madrid": {
    name: "أتلتيكو مدريد",
    league: "la-liga",
    leagueName: "الدوري الإسباني",
    colorFrom: "#991b1b",
    colorTo: "#1d4ed8",
    accent: "#ef4444",
    logo: "/teams/la-liga/atletico-madrid.png",
    founded: "1903",
    stadium: "ميتروبوليتانو",
    city: "مدريد",
    coach: "المدرب الحالي حسب آخر تحديثات النادي الرسمية",
    titles: ["الدوري الإسباني", "كأس الملك", "الدوري الأوروبي"],
    history: [
      "أتلتيكو مدريد من الأندية الكبيرة في إسبانيا، ويملك شخصية تنافسية قوية داخل الليغا وأوروبا.",
      "عرف النادي بصلابته التنظيمية وروحه القتالية، ما جعله منافسًا دائمًا على الألقاب.",
      "وقد رسخ مكانته كطرف أساسي في المشهد الكروي الإسباني إلى جانب ريال مدريد وبرشلونة."
    ],
    staff: ["مدير فني", "جهاز فني", "إدارة", "طاقم طبي"],
    squad: ["حراسة", "دفاع", "وسط", "هجوم"],
    officialLinks: {
      website: "https://en.atleticodemadrid.com",
      youtube: "https://www.youtube.com/@atleticodemadrid"
    }
  },
  "sevilla": {
    name: "إشبيلية",
    league: "la-liga",
    leagueName: "الدوري الإسباني",
    colorFrom: "#b91c1c",
    colorTo: "#ef4444",
    accent: "#f87171",
    logo: "/teams/la-liga/sevilla.png",
    founded: "1890",
    stadium: "رامون سانشيز بيزخوان",
    city: "إشبيلية",
    coach: "المدرب الحالي حسب آخر تحديثات النادي الرسمية",
    titles: ["الدوري الأوروبي", "كأس الملك"],
    history: [
      "إشبيلية من الأندية الإسبانية المعروفة بقدرتها على المنافسة القارية، خاصة في الدوري الأوروبي.",
      "يملك النادي تاريخًا محترمًا في الليغا والكؤوس المحلية.",
      "كما يتمتع بحضور جماهيري واضح وبهوية كروية معروفة في إسبانيا."
    ],
    staff: ["مدير فني", "جهاز فني", "إدارة"],
    squad: ["حراسة", "دفاع", "وسط", "هجوم"],
    officialLinks: {
      website: "https://www.sevillafc.es",
      youtube: "https://www.youtube.com/@sevillafc"
    }
  },
  "valencia": {
    name: "فالنسيا",
    league: "la-liga",
    leagueName: "الدوري الإسباني",
    colorFrom: "#111827",
    colorTo: "#f59e0b",
    accent: "#fbbf24",
    logo: "/teams/la-liga/valencia.png",
    founded: "1919",
    stadium: "ميستايا",
    city: "فالنسيا",
    coach: "المدرب الحالي حسب آخر تحديثات النادي الرسمية",
    titles: ["الدوري الإسباني", "كأس الملك", "منافسات أوروبية"],
    history: [
      "فالنسيا من الأندية التاريخية في إسبانيا، وسبق له أن لعب أدوارًا كبيرة في المنافسة المحلية والقارية.",
      "يتمتع النادي بقاعدة جماهيرية قوية وبملعب معروف يعد من رموز الكرة الإسبانية.",
      "ولا يزال اسم فالنسيا حاضرًا في نقاشات الليغا بفضل تاريخه ومكانته."
    ],
    staff: ["مدير فني", "جهاز فني", "إدارة"],
    squad: ["حراسة", "دفاع", "وسط", "هجوم"],
    officialLinks: {
      website: "https://www.valenciacf.com",
      youtube: "https://www.youtube.com/@valenciacf"
    }
  },
  "real-sociedad": {
    name: "ريال سوسيداد",
    league: "la-liga",
    leagueName: "الدوري الإسباني",
    colorFrom: "#1d4ed8",
    colorTo: "#0f172a",
    accent: "#60a5fa",
    logo: "/teams/la-liga/real-sociedad.png",
    founded: "1909",
    stadium: "أنويتا",
    city: "سان سيباستيان",
    coach: "المدرب الحالي حسب آخر تحديثات النادي الرسمية",
    titles: ["الدوري الإسباني", "كأس الملك"],
    history: [
      "ريال سوسيداد من الأندية المحترمة في إسبانيا، ويمتلك تاريخًا مهمًا داخل الليغا.",
      "عرف النادي بتطوير المواهب واللعب المنظم، ونجح في فرض نفسه في مراحل مختلفة من المنافسة.",
      "كما يحافظ على صورة مستقرة بين فرق الصف الأول في الكرة الإسبانية."
    ],
    staff: ["مدير فني", "جهاز فني", "إدارة"],
    squad: ["حراسة", "دفاع", "وسط", "هجوم"],
    officialLinks: {
      website: "https://www.realsociedad.eus",
      youtube: "https://www.youtube.com/@RealSociedadTV"
    }
  }
};

export function generateStaticParams() {
  return Object.keys(teams).map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const team = teams[params.slug];

  if (!team) {
    return {
      title: "الفريق غير موجود",
      description: "هذه الصفحة غير متاحة حالياً."
    };
  }

  return {
    title: team.name,
    description: `تعرف على تاريخ ${team.name}، أبرز الألقاب، معلومات الملعب، والملفات الأساسية الخاصة بالنادي.`,
    alternates: {
      canonical: `https://nabdriyadah.com/team/${params.slug}/`
    }
  };
}

export default function TeamPage({ params }) {
  const team = teams[params.slug];

  if (!team) {
    notFound();
  }

  const teamArticles = articles
    .filter(
      (article) =>
        article.league === team.league &&
        (article.title.includes(team.name) ||
          article.description.includes(team.name) ||
          (article.keywords || []).some((keyword) => keyword.includes(team.name)))
    )
    .slice(0, 6);

  const theme = {
    pageBg: "#f8fafc",
    heroFrom: team.colorFrom,
    heroTo: team.colorTo,
    primary: team.accent,
    primarySoft: "rgba(255,255,255,0.16)",
    border: "#e5e7eb",
    cardBg: "#ffffff",
    text: "#111827",
    subtext: "#4b5563"
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.pageBg,
        padding: "28px 20px 52px",
        direction: "rtl"
      }}
    >
      <div style={{ maxWidth: "1450px", margin: "0 auto" }}>
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            background: `linear-gradient(135deg, ${theme.heroFrom}, ${theme.heroTo})`,
            borderRadius: "34px",
            padding: "34px",
            color: "white",
            marginBottom: "28px",
            boxShadow: "0 18px 42px rgba(0,0,0,0.12)"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-70px",
              left: "-70px",
              width: "220px",
              height: "220px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.08)"
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-90px",
              right: "-40px",
              width: "240px",
              height: "240px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.08)"
            }}
          />

          <div
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "220px minmax(0, 1fr)",
              gap: "30px",
              alignItems: "center"
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: "30px",
                padding: "22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <img
                src={team.logo}
                alt={team.name}
                style={{
                  width: "140px",
                  height: "140px",
                  objectFit: "contain",
                  display: "block"
                }}
              />
            </div>

            <div>
              <Link
                href={team.league === "premier-league" ? "/league/premier-league/" : "/league/la-liga/"}
                style={{
                  display: "inline-block",
                  textDecoration: "none",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "14px",
                  opacity: 0.95,
                  marginBottom: "14px"
                }}
              >
                العودة إلى صفحة البطولة
              </Link>

              <div
                style={{
                  display: "inline-block",
                  background: "rgba(255,255,255,0.14)",
                  padding: "10px 16px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: 700,
                  marginBottom: "16px",
                  border: "1px solid rgba(255,255,255,0.15)"
                }}
              >
                صفحة فريق
              </div>

              <h1
                style={{
                  margin: "0 0 14px 0",
                  fontSize: "58px",
                  lineHeight: 1.18,
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
                صفحة تعريفية شاملة عن {team.name} تتضمن لمحة تاريخية، الملعب،
                المدينة، أبرز الألقاب، والمواد المرتبطة بالنادي داخل الموقع.
              </p>
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "20px",
            marginBottom: "28px"
          }}
        >
          <div
            style={{
              background: theme.cardBg,
              borderRadius: "22px",
              padding: "22px",
              border: "1px solid #e5e7eb"
            }}
          >
            <div style={{ color: team.accent, fontSize: "14px", fontWeight: 700, marginBottom: "8px" }}>
              سنة التأسيس
            </div>
            <div style={{ fontSize: "30px", fontWeight: 800, color: "#111827" }}>{team.founded}</div>
          </div>

          <div
            style={{
              background: theme.cardBg,
              borderRadius: "22px",
              padding: "22px",
              border: "1px solid #e5e7eb"
            }}
          >
            <div style={{ color: team.accent, fontSize: "14px", fontWeight: 700, marginBottom: "8px" }}>
              الملعب
            </div>
            <div style={{ fontSize: "30px", fontWeight: 800, color: "#111827" }}>{team.stadium}</div>
          </div>

          <div
            style={{
              background: theme.cardBg,
              borderRadius: "22px",
              padding: "22px",
              border: "1px solid #e5e7eb"
            }}
          >
            <div style={{ color: team.accent, fontSize: "14px", fontWeight: 700, marginBottom: "8px" }}>
              المدينة
            </div>
            <div style={{ fontSize: "30px", fontWeight: 800, color: "#111827" }}>{team.city}</div>
          </div>

          <div
            style={{
              background: theme.cardBg,
              borderRadius: "22px",
              padding: "22px",
              border: "1px solid #e5e7eb"
            }}
          >
            <div style={{ color: team.accent, fontSize: "14px", fontWeight: 700, marginBottom: "8px" }}>
              البطولة
            </div>
            <div style={{ fontSize: "30px", fontWeight: 800, color: "#111827" }}>{team.leagueName}</div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "24px",
            marginBottom: "28px"
          }}
        >
          <div
            style={{
              background: theme.cardBg,
              borderRadius: "28px",
              padding: "28px",
              border: "1px solid #e5e7eb"
            }}
          >
            <h2
              style={{
                margin: "0 0 18px 0",
                fontSize: "34px",
                fontWeight: 800,
                color: "#111827"
              }}
            >
              تاريخ النادي
            </h2>

            <div
              style={{
                color: "#4b5563",
                fontSize: "18px",
                lineHeight: 2,
                display: "grid",
                gap: "14px"
              }}
            >
              {team.history.map((paragraph, index) => (
                <p key={index} style={{ margin: 0 }}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gap: "24px" }}>
            <div
              style={{
                background: theme.cardBg,
                borderRadius: "28px",
                padding: "28px",
                border: "1px solid #e5e7eb"
              }}
            >
              <h2
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "28px",
                  fontWeight: 800
                }}
              >
                الطاقم
              </h2>

              <div style={{ display: "grid", gap: "10px" }}>
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "16px",
                    padding: "12px 14px",
                    color: "#111827",
                    fontWeight: 700
                  }}
                >
                  {team.coach}
                </div>

                {team.staff.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      background: "#f8fafc",
                      borderRadius: "16px",
                      padding: "12px 14px",
                      color: "#4b5563",
                      fontWeight: 700
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                background: theme.cardBg,
                borderRadius: "28px",
                padding: "28px",
                border: "1px solid #e5e7eb"
              }}
            >
              <h2
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "28px",
                  fontWeight: 800
                }}
              >
                أبرز الألقاب
              </h2>

              <div style={{ display: "grid", gap: "10px" }}>
                {team.titles.map((title, index) => (
                  <div
                    key={index}
                    style={{
                      background: "#f8fafc",
                      borderRadius: "16px",
                      padding: "12px 14px",
                      color: "#111827",
                      fontWeight: 700
                    }}
                  >
                    {title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            background: theme.cardBg,
            borderRadius: "28px",
            padding: "28px",
            border: "1px solid #e5e7eb",
            marginBottom: "28px"
          }}
        >
          <h2
            style={{
              margin: "0 0 16px 0",
              fontSize: "30px",
              fontWeight: 800
            }}
          >
            أقسام الفريق
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: "14px"
            }}
          >
            {team.squad.map((item, index) => (
              <div
                key={index}
                style={{
                  background: "#f8fafc",
                  borderRadius: "18px",
                  padding: "18px",
                  textAlign: "center",
                  color: "#111827",
                  fontWeight: 800
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            background: theme.cardBg,
            borderRadius: "28px",
            padding: "28px",
            border: "1px solid #e5e7eb",
            marginBottom: "28px"
          }}
        >
          <h2
            style={{
              margin: "0 0 18px 0",
              fontSize: "30px",
              fontWeight: 800
            }}
          >
            صور ومصادر رسمية
          </h2>

          <p
            style={{
              margin: "0 0 18px 0",
              color: "#4b5563",
              fontSize: "17px",
              lineHeight: 1.9
            }}
          >
            لإثراء هذه الصفحة بصور وفيديوهات أكثر، يمكن لاحقًا إضافة مواد رسمية من
            الموقع الرسمي أو قناة النادي الرسمية مع الحفاظ على أفضل تجربة قراءة.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap"
            }}
          >
            <a
              href={team.officialLinks.website}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                padding: "12px 16px",
                borderRadius: "999px",
                background: "#f8fafc",
                color: "#111827",
                fontWeight: 700
              }}
            >
              الموقع الرسمي
            </a>

            <a
              href={team.officialLinks.youtube}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                padding: "12px 16px",
                borderRadius: "999px",
                background: "#f8fafc",
                color: "#111827",
                fontWeight: 700
              }}
            >
              القناة الرسمية
            </a>
          </div>
        </section>

        <section
          style={{
            background: theme.cardBg,
            borderRadius: "28px",
            padding: "28px",
            border: "1px solid #e5e7eb"
          }}
        >
          <h2
            style={{
              margin: "0 0 18px 0",
              fontSize: "30px",
              fontWeight: 800
            }}
          >
            مواد مرتبطة بالنادي
          </h2>

          {teamArticles.length === 0 ? (
            <div
              style={{
                color: "#6b7280",
                fontSize: "17px",
                lineHeight: 1.9
              }}
            >
              لا توجد بعد مواد كثيرة مرتبطة مباشرة بهذا النادي داخل الموقع، لكن سيتم
              توسيع الربط تلقائيًا مع نمو المحتوى.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "18px"
              }}
            >
              {teamArticles.map((item) => (
                <Link
                  key={item.slug}
                  href={`/articles/${item.slug}/`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <article
                    style={{
                      background: "#f8fafc",
                      borderRadius: "22px",
                      overflow: "hidden",
                      border: "1px solid #e5e7eb",
                      height: "100%"
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{
                        width: "100%",
                        height: "190px",
                        objectFit: "cover",
                        display: "block"
                      }}
                    />
                    <div style={{ padding: "18px" }}>
                      <h3
                        style={{
                          margin: "0 0 10px 0",
                          fontSize: "22px",
                          lineHeight: 1.6,
                          fontWeight: 800,
                          color: "#111827"
                        }}
                      >
                        {item.title}
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          color: "#4b5563",
                          fontSize: "15px",
                          lineHeight: 1.8
                        }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
