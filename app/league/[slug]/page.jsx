import Link from "next/link";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import articles from "../../../content/articles/seo-articles.json";
import teamsDataRaw from "../../../content/teams-data.json";
import AdSlot from "../../components/AdSlot";
import ArticleImage from "../../components/ArticleImage";
import ArticleFiltersClient from "../../components/ArticleFiltersClient";

function loadJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function fmtDateAr(isoDate) {
  if (!isoDate) return "";
  try {
    return new Date(isoDate).toLocaleDateString("ar-SA-u-nu-latn", { day: "numeric", month: "long", year: "numeric" });
  } catch { return isoDate; }
}

const leagueMap = {
  "premier-league": {
    title: "الدوري الإنجليزي الممتاز",
    shortLabel: "EPL",
    description:
      "تابع آخر أخبار الدوري الإنجليزي الممتاز، أبرز المستجدات، والتحليلات الخاصة بالأندية واللاعبين.",
    leagueLogo: "https://media.api-sports.io/football/leagues/39.png",
    theme: {
      pageBg: "#f6f0ff",
      heroFrom: "#3b0764",
      heroTo: "#7c3aed",
      primary: "#6d28d9",
      primarySoft: "#ede9fe",
      border: "#ddd6fe",
      cardBg: "#ffffff",
      text: "#111827",
      subtext: "#4b5563",
      badgeBg: "rgba(255,255,255,0.16)",
      badgeText: "#ffffff"
    },
    highlights: [
      "أخبار مانشستر سيتي ومانشستر يونايتد",
      "متابعة ليفربول وآرسنال وتشيلسي",
      "تحليلات المباريات والنتائج والسباق على القمة"
    ],
    teams: [
      { name: "مانشستر سيتي", slug: "manchester-city", logo: "https://media.api-sports.io/football/teams/50.png" },
      { name: "مانشستر يونايتد", slug: "manchester-united", logo: "https://media.api-sports.io/football/teams/33.png" },
      { name: "ليفربول", slug: "liverpool", logo: "https://media.api-sports.io/football/teams/40.png" },
      { name: "آرسنال", slug: "arsenal", logo: "https://media.api-sports.io/football/teams/42.png" },
      { name: "تشيلسي", slug: "chelsea", logo: "https://media.api-sports.io/football/teams/49.png" },
      { name: "توتنهام", slug: "tottenham", logo: "https://media.api-sports.io/football/teams/47.png" }
    ]
  },
  "la-liga": {
    title: "الدوري الإسباني",
    shortLabel: "LL",
    description: "أحدث أخبار الدوري الإسباني مع متابعة خاصة لريال مدريد وبرشلونة وأبرز ملفات الليغا.",
    leagueLogo: "https://media.api-sports.io/football/leagues/140.png",
    theme: {
      pageBg: "#fff7ed", heroFrom: "#9a3412", heroTo: "#f97316", primary: "#ea580c",
      primarySoft: "#ffedd5", border: "#fed7aa", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["متابعة ريال مدريد وبرشلونة", "رصد مستجدات الليغا", "ملفات المدربين والنجوم والنتائج"],
    teams: [
      { name: "ريال مدريد", slug: "real-madrid", logo: "https://media.api-sports.io/football/teams/541.png" },
      { name: "برشلونة", slug: "barcelona", logo: "https://media.api-sports.io/football/teams/529.png" },
      { name: "أتلتيكو مدريد", slug: "atletico-madrid", logo: "https://media.api-sports.io/football/teams/530.png" },
      { name: "إشبيلية", slug: "sevilla", logo: "https://media.api-sports.io/football/teams/536.png" },
      { name: "فالنسيا", slug: "valencia", logo: "https://media.api-sports.io/football/teams/532.png" },
      { name: "ريال سوسيداد", slug: "real-sociedad", logo: "https://media.api-sports.io/football/teams/548.png" }
    ]
  },

  "bundesliga": {
    title: "الدوري الألماني — البوندسليغا",
    shortLabel: "BL",
    description: "تابع أحدث أخبار البوندسليغا، بايرن ميونخ، بوروسيا دورتموند وأبرز مجريات الدوري الألماني.",
    leagueLogo: "https://media.api-sports.io/football/leagues/78.png",
    theme: {
      pageBg: "#fff1f2", heroFrom: "#7f1d1d", heroTo: "#dc2626", primary: "#dc2626",
      primarySoft: "#fee2e2", border: "#fecaca", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["بايرن ميونخ ودورتموند", "المنافسة على اللقب", "الإنتاج الشبابي الألماني", "الانتقالات"],
    teams: [
      { name: "بايرن ميونخ", slug: "bayern-munich", logo: "https://media.api-sports.io/football/teams/157.png" },
      { name: "بوروسيا دورتموند", slug: "borussia-dortmund", logo: "https://media.api-sports.io/football/teams/165.png" },
      { name: "باير ليفركوزن", slug: "bayer-leverkusen", logo: "https://media.api-sports.io/football/teams/168.png" },
      { name: "آر بي لايبزيغ", slug: "rb-leipzig", logo: "https://media.api-sports.io/football/teams/173.png" },
      { name: "إينتراخت فرانكفورت", slug: "eintracht-frankfurt", logo: "https://media.api-sports.io/football/teams/169.png" },
      { name: "بوروسيا مونشنغلادباخ", slug: "borussia-monchengladbach", logo: "https://media.api-sports.io/football/teams/163.png" }
    ]
  },

  "serie-a": {
    title: "الدوري الإيطالي — سيريا آ",
    shortLabel: "SA",
    description: "أبرز أخبار الدوري الإيطالي، يوفنتوس، ميلان، إنتر ميلان وأفضل البطولات الأوروبية.",
    leagueLogo: "https://media.api-sports.io/football/leagues/135.png",
    theme: {
      pageBg: "#fffbeb", heroFrom: "#78350f", heroTo: "#d97706", primary: "#b45309",
      primarySoft: "#fef3c7", border: "#fde68a", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["يوفنتوس وميلان وإنتر", "المنافسة الإيطالية", "نجوم الكالتشيو", "دوري أبطال أوروبا"],
    teams: [
      { name: "يوفنتوس", slug: "juventus", logo: "https://media.api-sports.io/football/teams/496.png" },
      { name: "إيه سي ميلان", slug: "ac-milan", logo: "https://media.api-sports.io/football/teams/489.png" },
      { name: "إنتر ميلان", slug: "inter-milan", logo: "https://media.api-sports.io/football/teams/505.png" },
      { name: "نابولي", slug: "napoli", logo: "https://media.api-sports.io/football/teams/492.png" },
      { name: "روما", slug: "as-roma", logo: "https://media.api-sports.io/football/teams/497.png" },
      { name: "لاتسيو", slug: "lazio", logo: "https://media.api-sports.io/football/teams/487.png" }
    ]
  },

  "ligue-1": {
    title: "الدوري الفرنسي — ليغ 1",
    shortLabel: "L1",
    description: "آخر أخبار الدوري الفرنسي، باريس سان جيرمان، مرسيليا، موناكو وأبرز أحداث الليغ 1.",
    leagueLogo: "https://media.api-sports.io/football/leagues/61.png",
    theme: {
      pageBg: "#eff6ff", heroFrom: "#1e3a8a", heroTo: "#2563eb", primary: "#1d4ed8",
      primarySoft: "#dbeafe", border: "#bfdbfe", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["باريس سان جيرمان", "الغزير الفرنسي من المواهب", "مرسيليا وموناكو", "الانتقالات"],
    teams: [
      { name: "باريس سان جيرمان", slug: "psg", logo: "https://media.api-sports.io/football/teams/85.png" },
      { name: "أولمبيك مرسيليا", slug: "olympique-marseille", logo: "https://media.api-sports.io/football/teams/81.png" },
      { name: "موناكو", slug: "monaco", logo: "https://media.api-sports.io/football/teams/91.png" },
      { name: "أولمبيك ليون", slug: "olympique-lyon", logo: "https://media.api-sports.io/football/teams/80.png" },
      { name: "ليل", slug: "losc-lille", logo: "https://media.api-sports.io/football/teams/79.png" },
      { name: "ران", slug: "stade-rennes", logo: "https://media.api-sports.io/football/teams/95.png" }
    ]
  },

  "champions-league": {
    title: "دوري أبطال أوروبا",
    shortLabel: "UCL",
    description: "تابع أحدث أخبار دوري أبطال أوروبا، المباريات الكبرى، وأبرز الأندية المتنافسة على اللقب.",
    leagueLogo: "https://media.api-sports.io/football/leagues/2.png",
    theme: {
      pageBg: "#fefce8", heroFrom: "#713f12", heroTo: "#ca8a04", primary: "#854d0e",
      primarySoft: "#fef9c3", border: "#fef08a", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["أبرز المجموعات", "الأدوار الإقصائية", "أفضل هداف", "تاريخ البطولة"],
    teams: [
      { name: "ريال مدريد", slug: "real-madrid", logo: "https://media.api-sports.io/football/teams/541.png" },
      { name: "مانشستر سيتي", slug: "manchester-city", logo: "https://media.api-sports.io/football/teams/50.png" },
      { name: "بايرن ميونخ", slug: "bayern-munich", logo: "https://media.api-sports.io/football/teams/157.png" },
      { name: "باريس سان جيرمان", slug: "psg", logo: "https://media.api-sports.io/football/teams/85.png" },
      { name: "برشلونة", slug: "barcelona", logo: "https://media.api-sports.io/football/teams/529.png" },
      { name: "إنتر ميلان", slug: "inter-milan", logo: "https://media.api-sports.io/football/teams/505.png" }
    ]
  },

  "saudi-pro-league": {
    title: "دوري روشن للمحترفين",
    shortLabel: "SPL",
    description: "أخبار الدوري السعودي للمحترفين، الهلال، النصر، الاتحاد وأبرز نجوم الدوري.",
    leagueLogo: "https://media.api-sports.io/football/leagues/307.png",
    theme: {
      pageBg: "#f0fdf4", heroFrom: "#14532d", heroTo: "#16a34a", primary: "#15803d",
      primarySoft: "#dcfce7", border: "#bbf7d0", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["الهلال والنصر والاتحاد", "نجوم عالميون في السعودية", "المنافسة على اللقب", "الانتقالات الكبرى"],
    teams: [
      { name: "الهلال", slug: "al-hilal", logo: "https://media.api-sports.io/football/teams/2932.png" },
      { name: "النصر", slug: "al-nassr", logo: "https://media.api-sports.io/football/teams/2939.png" },
      { name: "الاتحاد", slug: "al-ittihad", logo: "https://media.api-sports.io/football/teams/2933.png" },
      { name: "الأهلي", slug: "al-ahli", logo: "https://media.api-sports.io/football/teams/2937.png" },
      { name: "الشباب", slug: "al-shabab", logo: "https://media.api-sports.io/football/teams/2936.png" },
      { name: "الاتفاق", slug: "al-ettifaq", logo: "https://media.api-sports.io/football/teams/2938.png" }
    ]
  },

  "eredivisie": {
    title: "الدوري الهولندي — إريديفيزي",
    shortLabel: "ERE",
    description: "متابعة أبرز أخبار الدوري الهولندي، أياكس، بي إس في إيندهوفن وفاينورد.",
    leagueLogo: "https://media.api-sports.io/football/leagues/88.png",
    theme: {
      pageBg: "#fff1f2", heroFrom: "#7f1d1d", heroTo: "#ef4444", primary: "#b91c1c",
      primarySoft: "#fee2e2", border: "#fecaca", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["أياكس وبي إس في", "تخريج المواهب", "المسار نحو أوروبا", "الأندية الكلاسيكية"],
    teams: [
      { name: "أياكس", slug: "ajax", logo: "https://media.api-sports.io/football/teams/194.png" },
      { name: "بي إس في إيندهوفن", slug: "psv-eindhoven", logo: "https://media.api-sports.io/football/teams/197.png" },
      { name: "فاينورد", slug: "feyenoord", logo: "https://media.api-sports.io/football/teams/192.png" }
    ]
  },

  "world-cup": {
    title: "كأس العالم FIFA",
    shortLabel: "WC",
    description: "تغطية شاملة لكأس العالم لكرة القدم، تاريخ البطولة، أبرز المنتخبات والنتائج.",
    leagueLogo: "https://media.api-sports.io/football/leagues/1.png",
    theme: {
      pageBg: "#faf5ff", heroFrom: "#1e1b4b", heroTo: "#4338ca", primary: "#4f46e5",
      primarySoft: "#ede9fe", border: "#ddd6fe", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["أعظم بطولة في العالم", "32 منتخباً", "كل 4 سنوات", "تاريخ منذ 1930"],
    teams: []
  },

  "euro": {
    title: "بطولة أمم أوروبا — يورو",
    shortLabel: "EURO",
    description: "أخبار وتغطية بطولة أمم أوروبا، أبرز المنتخبات والنتائج.",
    leagueLogo: "https://media.api-sports.io/football/leagues/4.png",
    theme: {
      pageBg: "#eff6ff", heroFrom: "#1e3a8a", heroTo: "#3b82f6", primary: "#2563eb",
      primarySoft: "#dbeafe", border: "#bfdbfe", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["أبرز منتخبات أوروبا", "كل 4 سنوات", "بطولة عريقة منذ 1960", "المنتخبات الكبرى"],
    teams: []
  },

  "afcon": {
    title: "كأس أمم أفريقيا — CAN",
    shortLabel: "CAN",
    description: "تغطية كأس أمم أفريقيا، أبرز المنتخبات الأفريقية، النتائج والتاريخ.",
    leagueLogo: "https://media.api-sports.io/football/leagues/6.png",
    theme: {
      pageBg: "#fff7ed", heroFrom: "#7c2d12", heroTo: "#ea580c", primary: "#c2410c",
      primarySoft: "#ffedd5", border: "#fed7aa", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["المغرب والسنغال ومصر", "كأس القارة الأفريقية", "تاريخ منذ 1957", "كل سنتين"],
    teams: []
  },

  "caf-champions-league": {
    title: "دوري أبطال أفريقيا — CAF",
    shortLabel: "CAFCL",
    description: "أخبار دوري أبطال أفريقيا، الأندية المشاركة والنتائج.",
    leagueLogo: "https://media.api-sports.io/football/leagues/12.png",
    theme: {
      pageBg: "#f0fdf4", heroFrom: "#14532d", heroTo: "#16a34a", primary: "#15803d",
      primarySoft: "#dcfce7", border: "#bbf7d0", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["أبرز الأندية الأفريقية", "البطولة القارية", "الوداد والأهلي المصري", "التاريخ والألقاب"],
    teams: []
  },

  "club-world-cup": {
    title: "كأس العالم للأندية — FIFA",
    shortLabel: "CWC",
    description: "تغطية كأس العالم للأندية، أبرز الأندية المشاركة من كل القارات والنتائج.",
    leagueLogo: "https://media.api-sports.io/football/leagues/15.png",
    theme: {
      pageBg: "#fefce8", heroFrom: "#713f12", heroTo: "#d97706", primary: "#b45309",
      primarySoft: "#fef9c3", border: "#fef08a", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["أفضل أندية العالم", "بطولة FIFA الكبرى", "كل 4 سنوات منذ 2025", "الأندية من كل القارات"],
    teams: [
      { name: "ريال مدريد", slug: "real-madrid", logo: "https://media.api-sports.io/football/teams/541.png" },
      { name: "مانشستر سيتي", slug: "manchester-city", logo: "https://media.api-sports.io/football/teams/50.png" },
      { name: "بايرن ميونخ", slug: "bayern-munich", logo: "https://media.api-sports.io/football/teams/157.png" },
      { name: "الهلال", slug: "al-hilal", logo: "https://media.api-sports.io/football/teams/2932.png" }
    ]
  },

  "botola": {
    title: "البطولة الاحترافية — بطولة المغرب",
    shortLabel: "BOT",
    description: "أحدث أخبار البطولة الاحترافية المغربية، الوداد، الرجاء، الجيش الملكي وأبرز أندية البوطولة.",
    leagueLogo: "https://media.api-sports.io/football/leagues/200.png",
    theme: {
      pageBg: "#fff7ed", heroFrom: "#92400e", heroTo: "#f59e0b", primary: "#d97706",
      primarySoft: "#fef3c7", border: "#fde68a", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["الوداد والرجاء الكلاسيكو المغربي", "الجيش الملكي وحسنية أكادير", "نجوم الكرة المغربية", "الطريق نحو الاحترافية"],
    teams: [
      { name: "الوداد الرياضي", slug: "wydad", logo: "https://media.api-sports.io/football/teams/5593.png" },
      { name: "الرجاء الرياضي", slug: "raja-casablanca", logo: "https://media.api-sports.io/football/teams/2575.png" },
      { name: "الجيش الملكي", slug: "far-rabat", logo: "https://media.api-sports.io/football/teams/7027.png" },
      { name: "نهضة بركان", slug: "renaissance-berkane", logo: "https://media.api-sports.io/football/teams/7028.png" },
      { name: "المغرب التطواني", slug: "moghreb-tetouan", logo: "https://media.api-sports.io/football/teams/7029.png" },
      { name: "حسنية أكادير", slug: "hassania-agadir", logo: "https://media.api-sports.io/football/teams/7030.png" }
    ]
  },

  "liga-portugal": {
    title: "الدوري البرتغالي — ليغا بورتوغال",
    shortLabel: "LP",
    description: "أحدث أخبار الدوري البرتغالي، بنفيكا، بورتو، سبورتينغ لشبونة وأبرز مجريات الموسم.",
    leagueLogo: "https://media.api-sports.io/football/leagues/94.png",
    theme: {
      pageBg: "#fef2f2", heroFrom: "#7f1d1d", heroTo: "#ef4444", primary: "#b91c1c",
      primarySoft: "#fee2e2", border: "#fecaca", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["بنفيكا وبورتو وسبورتينغ", "المواهب البرتغالية", "التنافس على اللقب", "دوري أبطال أوروبا"],
    teams: [
      { name: "بنفيكا", slug: "benfica", logo: "https://media.api-sports.io/football/teams/211.png" },
      { name: "بورتو", slug: "porto", logo: "https://media.api-sports.io/football/teams/212.png" },
      { name: "سبورتينغ لشبونة", slug: "sporting-cp", logo: "https://media.api-sports.io/football/teams/228.png" },
      { name: "براغا", slug: "braga", logo: "https://media.api-sports.io/football/teams/217.png" },
      { name: "فيتوريا غيمارايش", slug: "vitoria-guimaraes", logo: "https://media.api-sports.io/football/teams/232.png" },
      { name: "كاسا بيا", slug: "casa-pia", logo: "https://media.api-sports.io/football/teams/2284.png" }
    ]
  },

  "mls": {
    title: "الدوري الأمريكي — MLS",
    shortLabel: "MLS",
    description: "أحدث أخبار دوري كرة القدم الأمريكي، لوس أنجلوس غالاكسي، إنتر ميامي وأبرز النجوم.",
    leagueLogo: "https://media.api-sports.io/football/leagues/253.png",
    theme: {
      pageBg: "#eff6ff", heroFrom: "#1e3a8a", heroTo: "#3b82f6", primary: "#2563eb",
      primarySoft: "#dbeafe", border: "#bfdbfe", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["إنتر ميامي ومبسي", "لوس أنجلوس غالاكسي", "نجوم عالميون في أمريكا", "التوسع الكبير للدوري"],
    teams: [
      { name: "لوس أنجلوس غالاكسي", slug: "la-galaxy", logo: "https://media.api-sports.io/football/teams/1598.png" },
      { name: "إنتر ميامي", slug: "inter-miami", logo: "https://media.api-sports.io/football/teams/1611.png" },
      { name: "سياتل ساوندرز", slug: "seattle-sounders", logo: "https://media.api-sports.io/football/teams/1600.png" },
      { name: "أتلانتا يونايتد", slug: "atlanta-united", logo: "https://media.api-sports.io/football/teams/1605.png" },
      { name: "بورتلاند تيمبرز", slug: "portland-timbers", logo: "https://media.api-sports.io/football/teams/1601.png" },
      { name: "نيويورك سيتي", slug: "nycfc", logo: "https://media.api-sports.io/football/teams/1603.png" }
    ]
  },

  // ── Ligues Maghreb / Afrique du Nord ─────────────────────────────────────

  "ligue-pro-dz": {
    title: "الرابطة المحترفة الجزائرية",
    shortLabel: "LIGPRO",
    description: "تابع آخر أخبار الرابطة المحترفة الجزائرية، مولودية الجزائر، اتحاد العاصمة، شبيبة القبائل وأبرز أندية الكرة الجزائرية.",
    leagueLogo: "https://media.api-sports.io/football/leagues/197.png",
    theme: {
      pageBg: "#f0fdf4", heroFrom: "#064e3b", heroTo: "#059669", primary: "#047857",
      primarySoft: "#d1fae5", border: "#a7f3d0", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["مولودية الجزائر وشبيبة القبائل", "اتحاد العاصمة وأولمبي الشلف", "أخبار المنتخب الجزائري", "نجوم الكرة الجزائرية"],
    teams: [
      { name: "مولودية الجزائر", slug: "mc-alger", logo: "https://media.api-sports.io/football/teams/3716.png" },
      { name: "اتحاد العاصمة", slug: "usm-alger", logo: "https://media.api-sports.io/football/teams/3717.png" },
      { name: "شبيبة القبائل", slug: "js-kabylie", logo: "https://media.api-sports.io/football/teams/3718.png" },
      { name: "نصر حسين داي", slug: "nahd", logo: "https://media.api-sports.io/football/teams/3719.png" },
      { name: "أولمبي الشلف", slug: "ao-chlef", logo: "https://media.api-sports.io/football/teams/3720.png" },
      { name: "وفاق سطيف", slug: "es-setif", logo: "https://media.api-sports.io/football/teams/3721.png" }
    ]
  },

  "prem-egy": {
    title: "الدوري المصري الممتاز",
    shortLabel: "EPL-EGY",
    description: "أحدث أخبار الدوري المصري الممتاز، الأهلي، الزمالك، بيراميدز وأبرز مجريات كرة القدم المصرية.",
    leagueLogo: "https://media.api-sports.io/football/leagues/233.png",
    theme: {
      pageBg: "#fefce8", heroFrom: "#713f12", heroTo: "#ca8a04", primary: "#92400e",
      primarySoft: "#fef9c3", border: "#fde68a", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["الأهلي والزمالك ديربي القاهرة", "بيراميدز وإنبي", "أخبار المنتخب المصري", "دوري أبطال أفريقيا"],
    teams: [
      { name: "الأهلي المصري", slug: "al-ahly-eg", logo: "https://media.api-sports.io/football/teams/3793.png" },
      { name: "الزمالك", slug: "zamalek", logo: "https://media.api-sports.io/football/teams/3794.png" },
      { name: "بيراميدز", slug: "pyramids-fc", logo: "https://media.api-sports.io/football/teams/3795.png" },
      { name: "إنبي", slug: "enppi", logo: "https://media.api-sports.io/football/teams/3796.png" },
      { name: "المصري", slug: "al-masry", logo: "https://media.api-sports.io/football/teams/3797.png" },
      { name: "فاركو", slug: "farco-sc", logo: "https://media.api-sports.io/football/teams/3798.png" }
    ]
  },

  "botola-ma": {
    title: "البطولة الاحترافية — المغرب",
    shortLabel: "BOT-MA",
    description: "أحدث أخبار البطولة الاحترافية المغربية، الوداد الرياضي، الرجاء الرياضي، الجيش الملكي وأبرز مجريات الموسم.",
    leagueLogo: "https://media.api-sports.io/football/leagues/200.png",
    theme: {
      pageBg: "#fff7ed", heroFrom: "#92400e", heroTo: "#f59e0b", primary: "#d97706",
      primarySoft: "#fef3c7", border: "#fde68a", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["الوداد والرجاء الكلاسيكو المغربي", "الجيش الملكي وحسنية أكادير", "أخبار المنتخب المغربي", "المشاركة الأفريقية"],
    teams: [
      { name: "الوداد الرياضي", slug: "wydad", logo: "https://media.api-sports.io/football/teams/5593.png" },
      { name: "الرجاء الرياضي", slug: "raja-casablanca", logo: "https://media.api-sports.io/football/teams/2575.png" },
      { name: "الجيش الملكي", slug: "far-rabat", logo: "https://media.api-sports.io/football/teams/7027.png" },
      { name: "نهضة بركان", slug: "renaissance-berkane", logo: "https://media.api-sports.io/football/teams/7028.png" },
      { name: "المغرب التطواني", slug: "moghreb-tetouan", logo: "https://media.api-sports.io/football/teams/7029.png" },
      { name: "حسنية أكادير", slug: "hassania-agadir", logo: "https://media.api-sports.io/football/teams/7030.png" }
    ]
  },

  "ligue-pro-tn": {
    title: "الرابطة المحترفة التونسية",
    shortLabel: "LP1-TN",
    description: "آخر أخبار الرابطة المحترفة التونسية الأولى، الترجي الرياضي، النجم الساحلي، الافريقي وأبرز الأندية التونسية.",
    leagueLogo: "https://media.api-sports.io/football/leagues/202.png",
    theme: {
      pageBg: "#fef2f2", heroFrom: "#7f1d1d", heroTo: "#dc2626", primary: "#b91c1c",
      primarySoft: "#fee2e2", border: "#fecaca", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["الترجي والنجم الساحلي", "الافريقي وصفاقس", "أخبار المنتخب التونسي", "دوري أبطال أفريقيا"],
    teams: [
      { name: "الترجي الرياضي التونسي", slug: "esperance-tunis", logo: "https://media.api-sports.io/football/teams/3810.png" },
      { name: "النجم الساحلي", slug: "etoile-sahel", logo: "https://media.api-sports.io/football/teams/3811.png" },
      { name: "الافريقي", slug: "ca-bizertin", logo: "https://media.api-sports.io/football/teams/3812.png" },
      { name: "صفاقس كلب سبور", slug: "sfaxien", logo: "https://media.api-sports.io/football/teams/3813.png" },
      { name: "النادي الصفاقسي", slug: "cs-sfaxien", logo: "https://media.api-sports.io/football/teams/3814.png" },
      { name: "الملعب التونسي", slug: "stade-tunisien", logo: "https://media.api-sports.io/football/teams/3815.png" }
    ]
  },

  // ── NBA Basketball ──────────────────────────────────────────────────────
  "nba": {
    title: "دوري كرة السلة الأمريكي — NBA",
    shortLabel: "NBA",
    type: "basketball",
    sport: "basketball",
    description: "تابع أحدث أخبار دوري كرة السلة الأمريكي NBA، أبرز الأندية واللاعبين والنتائج.",
    leagueLogo: "https://a.espncdn.com/i/teamlogos/leagues/500/nba.png",
    theme: {
      pageBg: "#fff7ed",
      heroFrom: "#431407",
      heroTo: "#c2410c",
      primary: "#c2410c",
      primarySoft: "#ffedd5",
      border: "#fed7aa",
      cardBg: "#ffffff",
      text: "#111827",
      subtext: "#4b5563",
      badgeBg: "rgba(255,255,255,0.16)",
      badgeText: "#ffffff"
    },
    highlights: ["بوسطن سيلتيكس", "لوس أنجلوس ليكرز", "مباريات الـ NBA", "نجوم الدوري"],
    teams: [
      { name: "بوسطن سيلتيكس", slug: "boston-celtics", logo: "https://a.espncdn.com/i/teamlogos/nba/500/bos.png" },
      { name: "لوس أنجلوس ليكرز", slug: "los-angeles-lakers", logo: "https://a.espncdn.com/i/teamlogos/nba/500/lal.png" },
      { name: "غولدن ستيت واريورز", slug: "golden-state-warriors", logo: "https://a.espncdn.com/i/teamlogos/nba/500/gs.png" },
      { name: "ميامي هيت", slug: "miami-heat", logo: "https://a.espncdn.com/i/teamlogos/nba/500/mia.png" },
      { name: "شيكاغو بولز", slug: "chicago-bulls", logo: "https://a.espncdn.com/i/teamlogos/nba/500/chi.png" },
      { name: "دالاس مافيريكس", slug: "dallas-mavericks", logo: "https://a.espncdn.com/i/teamlogos/nba/500/dal.png" }
    ]
  },

  // ── Tennis ATP ──────────────────────────────────────────────────────────
  "atp": {
    title: "بطولة ATP للرجال — التنس",
    shortLabel: "ATP",
    type: "tennis-rankings",
    sport: "tennis",
    description: "تابع أحدث أخبار التنس وتصنيف لاعبي ATP، ألكاراز، سينر وأبرز بطولات غراند سلام.",
    leagueLogo: "https://a.espncdn.com/i/teamlogos/leagues/500/atp.png",
    theme: {
      pageBg: "#f0fdf4",
      heroFrom: "#052e16",
      heroTo: "#15803d",
      primary: "#15803d",
      primarySoft: "#dcfce7",
      border: "#bbf7d0",
      cardBg: "#ffffff",
      text: "#111827",
      subtext: "#4b5563",
      badgeBg: "rgba(255,255,255,0.16)",
      badgeText: "#ffffff"
    },
    highlights: ["ويمبلدون ورولان غاروس", "كارلوس ألكاراز", "يانيك سينر", "تصنيف ATP العالمي"],
    teams: []
  },

  // ── Tennis WTA ──────────────────────────────────────────────────────────
  "wta": {
    title: "بطولة WTA للسيدات — التنس",
    shortLabel: "WTA",
    type: "tennis-rankings",
    sport: "tennis",
    description: "تابع أحدث أخبار تنس السيدات وتصنيف لاعبات WTA، إيغا شفيونتيك وأبرز بطولات الغراند سلام.",
    leagueLogo: "https://a.espncdn.com/i/teamlogos/leagues/500/wta.png",
    theme: {
      pageBg: "#fdf4ff",
      heroFrom: "#4a044e",
      heroTo: "#a21caf",
      primary: "#a21caf",
      primarySoft: "#fae8ff",
      border: "#f0abfc",
      cardBg: "#ffffff",
      text: "#111827",
      subtext: "#4b5563",
      badgeBg: "rgba(255,255,255,0.16)",
      badgeText: "#ffffff"
    },
    highlights: ["إيغا شفيونتيك", "أريناسابالينكا", "كوكو غوف", "تصنيف WTA العالمي"],
    teams: []
  },

  // ── Padel ────────────────────────────────────────────────────────────────
  "padel-premier": {
    title: "Premier Padel — البطولة العالمية",
    shortLabel: "PADEL",
    type: "padel-rankings",
    sport: "padel",
    description: "تابع أخبار البريمير بادل، تصنيف اللاعبين وأبرز البطولات العالمية للبادل.",
    leagueLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Premier_Padel_logo.svg/200px-Premier_Padel_logo.svg.png",
    theme: {
      pageBg: "#f5f3ff",
      heroFrom: "#2e1065",
      heroTo: "#7c3aed",
      primary: "#7c3aed",
      primarySoft: "#ede9fe",
      border: "#ddd6fe",
      cardBg: "#ffffff",
      text: "#111827",
      subtext: "#4b5563",
      badgeBg: "rgba(255,255,255,0.16)",
      badgeText: "#ffffff"
    },
    highlights: ["أرتورو كويلو", "خوان ليبرون", "جيما تريا", "البطولة العالمية"],
    teams: []
  },

  // ── Futsal ───────────────────────────────────────────────────────────────
  "futsal-monde": {
    title: "كأس العالم لكرة القدم الصالات — FIFA",
    shortLabel: "FUTSAL",
    type: "football",
    sport: "futsal",
    description: "تابع أخبار كأس العالم لكرة القدم الصالات، المنتخبات المشاركة والنتائج.",
    leagueLogo: "https://media.api-sports.io/football/leagues/1.png",
    theme: {
      pageBg: "#f0fdfa",
      heroFrom: "#042f2e",
      heroTo: "#0f766e",
      primary: "#0f766e",
      primarySoft: "#ccfbf1",
      border: "#99f6e4",
      cardBg: "#ffffff",
      text: "#111827",
      subtext: "#4b5563",
      badgeBg: "rgba(255,255,255,0.16)",
      badgeText: "#ffffff"
    },
    highlights: ["كأس العالم للصالات", "FIFA Futsal", "المنتخبات العالمية", "الكرة الخماسية"],
    teams: []
  },

  // ── F1 — Formule 1 ──────────────────────────────────────────────────────
  "f1": {
    title: "الفورمولا 1 — بطولة العالم",
    shortLabel: "F1",
    type: "f1-rankings",
    sport: "f1",
    description: "تابع أحدث أخبار سباقات الفورمولا 1، ترتيب السائقين، نتائج الجائزة الكبرى وأبرز الفرق.",
    leagueLogo: "https://media.api-sports.io/formula-1/leagues/1.png",
    theme: {
      pageBg: "#fff1f2",
      heroFrom: "#7f1d1d",
      heroTo: "#dc2626",
      primary: "#dc2626",
      primarySoft: "#fee2e2",
      border: "#fecaca",
      cardBg: "#ffffff",
      text: "#111827",
      subtext: "#4b5563",
      badgeBg: "rgba(255,255,255,0.16)",
      badgeText: "#ffffff"
    },
    highlights: ["ماكس فيرستابن", "لويس هاميلتون", "الجائزة الكبرى", "Red Bull وFerrari"],
    teams: []
  },

  // ── Golf ────────────────────────────────────────────────────────────────
  "pga-tour": {
    title: "بطولة PGA Tour — الغولف",
    shortLabel: "PGA",
    type: "golf-rankings",
    sport: "golf",
    description: "تابع أخبار الغولف، تصنيف لاعبي PGA Tour، نتائج الماسترز وأبرز البطولات العالمية.",
    leagueLogo: "https://a.espncdn.com/i/teamlogos/leagues/500/pga.png",
    theme: {
      pageBg: "#f0fdf4",
      heroFrom: "#052e16",
      heroTo: "#16a34a",
      primary: "#16a34a",
      primarySoft: "#dcfce7",
      border: "#bbf7d0",
      cardBg: "#ffffff",
      text: "#111827",
      subtext: "#4b5563",
      badgeBg: "rgba(255,255,255,0.16)",
      badgeText: "#ffffff"
    },
    highlights: ["روري ماكلروي", "شيفلر ونيكلسون", "بطولة الماسترز", "تصنيف OWGR العالمي"],
    teams: []
  }
};

function fmtDate(iso) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString("ar-SA-u-nu-latn", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return ""; }
}

export function generateStaticParams() {
  return Object.keys(leagueMap).map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const league = leagueMap[params.slug];

  if (!league) {
    return {
      title: "القسم غير موجود",
      description: "هذه الصفحة غير متاحة حالياً."
    };
  }

  return {
    title: league.title,
    description: league.description,
    alternates: {
      canonical: `https://nabdriyadah.com/league/${params.slug}/`
    },
    openGraph: {
      title: league.title,
      description: league.description,
      url: `https://nabdriyadah.com/league/${params.slug}/`,
      siteName: "نبض الرياضة",
      locale: "ar_AR",
      type: "website"
    }
  };
}

// Build standings for a league from teams-data + standings JSON
function getLeagueStandings(leagueSlug) {
  // Try live standings file first
  try {
    const base = path.join(process.cwd(), "content/standings");
    const standingsPath = path.join(base, `${leagueSlug}.json`);
    // Path traversal guard
    if (!standingsPath.startsWith(base + path.sep) && standingsPath !== base) return { type: "football", data: [] };
    const data = JSON.parse(fs.readFileSync(standingsPath, "utf-8"));
    if (data.type === "padel-rankings") {
      // Padel: men + women separate arrays
      const men   = data.men   || data.rankings?.filter(p => p.gender === "M") || [];
      const women = data.women || data.rankings?.filter(p => p.gender === "F") || [];
      return { type: "padel-rankings", data: men, men, women };
    }
    if (data.type === "tennis-rankings" || data.type === "f1-rankings" || data.type === "golf-rankings") {
      return { type: data.type, data: data.rankings || [] };
    }
    if (data.type === "basketball" && data.standings && data.standings.length > 0) {
      return { type: "basketball", data: data.standings };
    }
    if (data.standings && data.standings.length > 0) {
      return { type: data.type || "football", data: data.standings };
    }
  } catch {}

  // Fallback: build from teams-data ordered alphabetically (no live data yet)
  const leagueTeams = Object.entries(teamsDataRaw)
    .filter(([, t]) => t.league === leagueSlug)
    .map(([slug, t], idx) => ({
      rank: idx + 1,
      slug,
      name: t.name,
      logo: t.logo,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0
    }));
  return { type: "football", data: leagueTeams };
}

export default function LeaguePage({ params }) {
  const league = leagueMap[params.slug];

  if (!league) {
    notFound();
  }

  const theme = league.theme;
  // All articles for this league, sorted newest first — no artificial limit
  const leagueArticles = (() => {
    const sorted = (arr) => arr.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
    // 1. Correspondance exacte de ligue
    const specific = articles.filter(a => a.slug && a.league === params.slug);
    if (specific.length >= 3) return sorted(specific);
    // 2. Correspondance par sport (fallback pour nba→basketball, atp→tennis, etc.)
    const leagueSport = league.sport;
    if (leagueSport && leagueSport !== "football") {
      const bySport = articles.filter(a => a.slug && a.sport === leagueSport);
      if (bySport.length > 0) return sorted([...specific, ...bySport].filter((a, i, arr) => arr.findIndex(b => b.slug === a.slug) === i));
    }
    // 3. Fallback foot/mixed
    const fallback = articles.filter(a => a.slug && (a.league === "mixed" || a.sport === "football") && a.league !== params.slug);
    return sorted([...specific, ...fallback]);
  })();
  const featuredArticle = leagueArticles[0] || null;

  // F1 Calendar data
  const f1CalendarData = params.slug === "f1"
    ? loadJsonSafe(path.join(process.cwd(), "content/fixtures/f1-calendar.json"))
    : null;
  const f1Events = f1CalendarData?.events || [];

  // Tennis Grand Slam calendar data
  const tennisCalendarData = (params.slug === "atp" || params.slug === "wta")
    ? loadJsonSafe(path.join(process.cwd(), "content/fixtures/tennis-calendar.json"))
    : null;
  const grandSlams = tennisCalendarData?.grandslams || [];

  // Standings data
  const { type: standingsType, data: standings, men: padelMen = [], women: padelWomen = [] } = getLeagueStandings(params.slug);
  const hasLiveStandings = standings.length > 0 && (standings[0].points > 0 || standings[0].won > 0);
  const top10 = standings.slice(0, 10);
  const rest = standings.slice(10);
  const isBasketball = standingsType === "basketball";
  const isPadel = standingsType === "padel-rankings";
  const gridCols = isBasketball ? "36px 1fr 40px 40px 40px 50px 44px" : "36px 1fr 40px 40px 40px 40px 44px";

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

          <div className="league-hero-grid">
            <div
              style={{
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: "30px",
                padding: "22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "fit-content"
              }}
            >
              <img
                src={league.leagueLogo}
                alt={league.title}
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "contain",
                  display: "block"
                }}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <Link
                href="/"
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
                ← العودة إلى الرئيسية
              </Link>

              <div
                style={{
                  display: "inline-block",
                  background: theme.badgeBg,
                  color: theme.badgeText,
                  padding: "8px 14px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 700,
                  marginBottom: "14px",
                  marginRight: "10px",
                  border: "1px solid rgba(255,255,255,0.15)"
                }}
              >
                صفحة فئة متخصصة
              </div>

              <h1
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "clamp(26px, 5vw, 52px)",
                  lineHeight: 1.2,
                  fontWeight: 800
                }}
              >
                {league.title}
              </h1>

              <p
                style={{
                  margin: 0,
                  fontSize: "clamp(15px, 2.5vw, 20px)",
                  lineHeight: 1.9,
                  maxWidth: "900px",
                  opacity: 0.96
                }}
              >
                {league.description}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "16px"
                }}
              >
                {league.highlights.map((item, index) => (
                  <span
                    key={index}
                    style={{
                      background: "rgba(255,255,255,0.14)",
                      border: "1px solid rgba(255,255,255,0.16)",
                      padding: "7px 12px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: 700
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <AdSlot label="مساحة إعلانية أعلى صفحة البطولة" minHeight={90} style={{ marginBottom: 24 }} />

        {/* ── RANKINGS Tennis / F1 / Golf ── */}
        {(standingsType === "tennis-rankings" || standingsType === "f1-rankings" || standingsType === "golf-rankings") && standings.length > 0 && (
          <section style={{ background: theme.cardBg, borderRadius: "28px", padding: "24px", border: `1px solid ${theme.border}`, boxShadow: "0 12px 30px rgba(0,0,0,0.05)", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ width: "5px", height: "28px", borderRadius: "999px", background: theme.primary }} />
              <span style={{ color: theme.primary, fontSize: "18px", fontWeight: 800 }}>
                  {standingsType === "f1-rankings" ? "ترتيب السائقين" : standingsType === "golf-rankings" ? "تصنيف اللاعبين — الغولف" : "تصنيف اللاعبين"}
                </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 60px 80px", gap: "4px", padding: "8px 12px", background: theme.primarySoft, borderRadius: "12px", marginBottom: "6px", fontSize: "12px", fontWeight: 700, color: theme.primary }}>
              <span style={{ textAlign: "center" }}>#</span>
              <span>اللاعب</span>
              <span style={{ textAlign: "center" }}>البلد</span>
              <span style={{ textAlign: "center" }}>النقاط</span>
            </div>
            {standings.slice(0, 20).map((player, i) => (
              <div key={player.slug || i} style={{ display: "grid", gridTemplateColumns: "36px 1fr 60px 80px", gap: "4px", padding: "10px 12px", borderRadius: "12px", alignItems: "center", background: i < 3 ? theme.primarySoft : "transparent", border: `1px solid ${i < 3 ? theme.border : "transparent"}`, marginBottom: "4px" }}>
                <span style={{ textAlign: "center", fontWeight: 800, width: "24px", height: "24px", borderRadius: "50%", background: i === 0 ? theme.primary : "transparent", color: i === 0 ? "white" : i < 3 ? theme.primary : "#6b7280", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontSize: "13px" }}>{player.rank || i + 1}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {player.flag && <img src={player.flag} alt="" style={{ width: "22px", height: "16px", objectFit: "cover", borderRadius: "3px" }} />}
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{player.name}</span>
                </div>
                <span style={{ textAlign: "center", fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>{player.country || "—"}</span>
                <span style={{ textAlign: "center", fontSize: "14px", fontWeight: 800, color: theme.primary }}>{player.points?.toLocaleString() || "—"}</span>
              </div>
            ))}
          </section>
        )}

        {/* ── CALENDRIER F1 ── */}
        {params.slug === "f1" && f1Events.length > 0 && (
          <section style={{ background: theme.cardBg, borderRadius: "28px", padding: "24px", border: `1px solid ${theme.border}`, boxShadow: "0 12px 30px rgba(0,0,0,0.05)", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ width: "5px", height: "28px", borderRadius: "999px", background: theme.primary }} />
              <span style={{ color: theme.primary, fontSize: "18px", fontWeight: 800 }}>تقويم الجائزة الكبرى 2026</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 120px 100px 90px", gap: "4px", padding: "8px 12px", background: theme.primarySoft, borderRadius: "12px", marginBottom: "6px", fontSize: "12px", fontWeight: 700, color: theme.primary }}>
              <span style={{ textAlign: "center" }}>#</span>
              <span>الجائزة الكبرى</span>
              <span style={{ textAlign: "center" }}>الحلبة</span>
              <span style={{ textAlign: "center" }}>التاريخ</span>
              <span style={{ textAlign: "center" }}>الحالة</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {f1Events.map((event, i) => {
                const isCompleted = event.status === "completed";
                const isNext = !isCompleted && f1Events.findIndex(e => e.status !== "completed") === i;
                return (
                  <div key={event.id} style={{
                    display: "grid",
                    gridTemplateColumns: "32px 1fr 120px 100px 90px",
                    gap: "4px",
                    padding: "10px 12px",
                    borderRadius: "12px",
                    alignItems: "center",
                    background: isNext ? theme.primarySoft : "transparent",
                    border: `1px solid ${isNext ? theme.border : "transparent"}`
                  }}>
                    <span style={{ textAlign: "center", fontWeight: 800, fontSize: "13px", color: isCompleted ? "#9ca3af" : (isNext ? theme.primary : "#6b7280") }}>{i + 1}</span>
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: isCompleted ? "#6b7280" : "#111827", overflow: "hidden", textOverflow: "ellipsis", display: "block", whiteSpace: "nowrap" }}>{event.name}</span>
                      <span style={{ fontSize: "11px", color: "#9ca3af" }}>{event.location}</span>
                    </div>
                    <span style={{ textAlign: "center", fontSize: "11px", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.venue}</span>
                    <span style={{ textAlign: "center", fontSize: "12px", color: "#374151" }}>{fmtDateAr(event.date)}</span>
                    <span style={{ textAlign: "center", fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "999px", background: isCompleted ? "#f3f4f6" : (isNext ? theme.primary : theme.primarySoft), color: isCompleted ? "#6b7280" : (isNext ? "white" : theme.primary) }}>
                      {isCompleted ? "انتهى" : "قادم"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── GRANDS CHELEMS Tennis ── */}
        {(params.slug === "atp" || params.slug === "wta") && grandSlams.length > 0 && (
          <section style={{ background: theme.cardBg, borderRadius: "28px", padding: "24px", border: `1px solid ${theme.border}`, boxShadow: "0 12px 30px rgba(0,0,0,0.05)", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ width: "5px", height: "28px", borderRadius: "999px", background: theme.primary }} />
              <span style={{ color: theme.primary, fontSize: "18px", fontWeight: 800 }}>بطولات غراند سلام 2026</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 100px 80px", gap: "4px", padding: "8px 12px", background: theme.primarySoft, borderRadius: "12px", marginBottom: "6px", fontSize: "12px", fontWeight: 700, color: theme.primary }}>
              <span>البطولة</span>
              <span style={{ textAlign: "center" }}>السطح</span>
              <span style={{ textAlign: "center" }}>تاريخ البداية</span>
              <span style={{ textAlign: "center" }}>تاريخ النهاية</span>
              <span style={{ textAlign: "center" }}>الحالة</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {grandSlams.map((slam, i) => {
                const isCompleted = slam.status === "completed";
                const surfaceColors = { Hard: "#3b82f6", Clay: "#f97316", Grass: "#16a34a" };
                const surfaceColor = surfaceColors[slam.surface] || "#6b7280";
                return (
                  <div key={slam.name} style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 80px 100px 100px 80px",
                    gap: "4px",
                    padding: "12px",
                    borderRadius: "12px",
                    alignItems: "center",
                    background: isCompleted ? "transparent" : theme.primarySoft,
                    border: `1px solid ${isCompleted ? "transparent" : theme.border}`
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontSize: "15px", fontWeight: 800, color: isCompleted ? "#6b7280" : "#111827", display: "block" }}>{slam.nameAr}</span>
                      <span style={{ fontSize: "11px", color: "#9ca3af" }}>{slam.location}</span>
                    </div>
                    <span style={{ textAlign: "center", fontSize: "12px", fontWeight: 700, padding: "3px 8px", borderRadius: "999px", background: surfaceColor + "22", color: surfaceColor }}>{slam.surfaceAr}</span>
                    <span style={{ textAlign: "center", fontSize: "12px", color: "#374151" }}>{fmtDateAr(slam.date)}</span>
                    <span style={{ textAlign: "center", fontSize: "12px", color: "#374151" }}>{fmtDateAr(slam.endDate)}</span>
                    <span style={{ textAlign: "center", fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "999px", background: isCompleted ? "#f3f4f6" : theme.primary, color: isCompleted ? "#6b7280" : "white" }}>
                      {isCompleted ? "انتهى" : "قادم"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── RANKINGS Padel — Hommes + Femmes séparés ── */}
        {isPadel && (padelMen.length > 0 || padelWomen.length > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
            {/* Hommes */}
            {padelMen.length > 0 && (
              <section style={{ background: theme.cardBg, borderRadius: "28px", padding: "22px", border: `1px solid ${theme.border}`, boxShadow: "0 12px 30px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <div style={{ width: "5px", height: "26px", borderRadius: "999px", background: theme.primary }} />
                  <span style={{ color: theme.primary, fontSize: "17px", fontWeight: 800 }}>🎾 رجال — Top {padelMen.length}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 44px 60px", gap: "4px", padding: "7px 10px", background: theme.primarySoft, borderRadius: "10px", marginBottom: "5px", fontSize: "11px", fontWeight: 700, color: theme.primary }}>
                  <span style={{ textAlign: "center" }}>#</span>
                  <span>اللاعب</span>
                  <span style={{ textAlign: "center" }}>🌍</span>
                  <span style={{ textAlign: "center" }}>نقاط</span>
                </div>
                {padelMen.map((player, i) => (
                  <div key={player.slug || i} style={{ display: "grid", gridTemplateColumns: "28px 1fr 44px 60px", gap: "4px", padding: "9px 10px", borderRadius: "10px", alignItems: "center", background: i < 3 ? theme.primarySoft : "transparent", border: `1px solid ${i < 3 ? theme.border : "transparent"}`, marginBottom: "3px" }}>
                    <span style={{ textAlign: "center", fontWeight: 800, fontSize: "13px", width: "22px", height: "22px", borderRadius: "50%", background: i === 0 ? theme.primary : "transparent", color: i === 0 ? "white" : i < 3 ? theme.primary : "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>{player.rank || i + 1}</span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{player.name}</span>
                    <span style={{ textAlign: "center", fontSize: "11px", color: "#6b7280", fontWeight: 600, background: "#f3f4f6", borderRadius: "6px", padding: "2px 4px" }}>{player.country || "—"}</span>
                    <span style={{ textAlign: "center", fontSize: "13px", fontWeight: 800, color: theme.primary }}>{(player.points / 1000).toFixed(0)}k</span>
                  </div>
                ))}
              </section>
            )}
            {/* Femmes */}
            {padelWomen.length > 0 && (
              <section style={{ background: theme.cardBg, borderRadius: "28px", padding: "22px", border: `1px solid ${theme.border}`, boxShadow: "0 12px 30px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <div style={{ width: "5px", height: "26px", borderRadius: "999px", background: theme.primary }} />
                  <span style={{ color: theme.primary, fontSize: "17px", fontWeight: 800 }}>🎾 سيدات — Top {padelWomen.length}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 44px 60px", gap: "4px", padding: "7px 10px", background: theme.primarySoft, borderRadius: "10px", marginBottom: "5px", fontSize: "11px", fontWeight: 700, color: theme.primary }}>
                  <span style={{ textAlign: "center" }}>#</span>
                  <span>اللاعبة</span>
                  <span style={{ textAlign: "center" }}>🌍</span>
                  <span style={{ textAlign: "center" }}>نقاط</span>
                </div>
                {padelWomen.map((player, i) => (
                  <div key={player.slug || i} style={{ display: "grid", gridTemplateColumns: "28px 1fr 44px 60px", gap: "4px", padding: "9px 10px", borderRadius: "10px", alignItems: "center", background: i < 3 ? theme.primarySoft : "transparent", border: `1px solid ${i < 3 ? theme.border : "transparent"}`, marginBottom: "3px" }}>
                    <span style={{ textAlign: "center", fontWeight: 800, fontSize: "13px", width: "22px", height: "22px", borderRadius: "50%", background: i === 0 ? theme.primary : "transparent", color: i === 0 ? "white" : i < 3 ? theme.primary : "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>{player.rank || i + 1}</span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{player.name}</span>
                    <span style={{ textAlign: "center", fontSize: "11px", color: "#6b7280", fontWeight: 600, background: "#f3f4f6", borderRadius: "6px", padding: "2px 4px" }}>{player.country || "—"}</span>
                    <span style={{ textAlign: "center", fontSize: "13px", fontWeight: 800, color: theme.primary }}>{(player.points / 1000).toFixed(0)}k</span>
                  </div>
                ))}
              </section>
            )}
          </div>
        )}

        {/* ── STANDINGS TABLE (Football / Basketball) ── */}
        {(standingsType === "football" || standingsType === "basketball") && standings.length > 0 && (
          <section
            style={{
              background: theme.cardBg,
              borderRadius: "28px",
              padding: "24px",
              border: `1px solid ${theme.border}`,
              boxShadow: "0 12px 30px rgba(0,0,0,0.05)",
              marginBottom: "24px"
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "5px", height: "28px", borderRadius: "999px", background: theme.primary }} />
                <span style={{ color: theme.primary, fontSize: "18px", fontWeight: 800 }}>
                  الترتيب {hasLiveStandings ? "" : "— قيد التحديث"}
                </span>
                {!hasLiveStandings && (
                  <span style={{ background: theme.primarySoft, color: theme.primary, padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, border: `1px solid ${theme.border}` }}>
                    سيُحدَّث تلقائياً
                  </span>
                )}
              </div>
              <Link href={`/league/${params.slug}/classement/`} style={{ textDecoration: "none", color: theme.primary, fontSize: "13px", fontWeight: 700, background: theme.primarySoft, padding: "7px 16px", borderRadius: "999px", border: `1px solid ${theme.border}` }}>
                الترتيب الكامل ←
              </Link>
            </div>

            {/* Table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: gridCols,
              gap: "4px",
              padding: "8px 12px",
              background: theme.primarySoft,
              borderRadius: "12px",
              marginBottom: "6px",
              fontSize: "12px",
              fontWeight: 700,
              color: theme.primary
            }}>
              {isBasketball ? (
                <>
                  <span style={{ textAlign: "center" }}>#</span>
                  <span>الفريق</span>
                  <span style={{ textAlign: "center" }}>ل</span>
                  <span style={{ textAlign: "center" }}>ف</span>
                  <span style={{ textAlign: "center" }}>خ</span>
                  <span style={{ textAlign: "center" }}>%</span>
                  <span style={{ textAlign: "center", fontWeight: 800 }}>ف</span>
                </>
              ) : (
                <>
                  <span style={{ textAlign: "center" }}>#</span>
                  <span>الفريق</span>
                  <span style={{ textAlign: "center" }}>ل</span>
                  <span style={{ textAlign: "center" }}>ف</span>
                  <span style={{ textAlign: "center" }}>ت</span>
                  <span style={{ textAlign: "center" }}>خ</span>
                  <span style={{ textAlign: "center", fontWeight: 800 }}>نق</span>
                </>
              )}
            </div>

            {/* Top 10 rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {top10.map((team, i) => (
                <Link
                  key={team.slug || i}
                  href={`/team/${team.slug || "#"}/`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: gridCols,
                    gap: "4px",
                    padding: "10px 12px",
                    borderRadius: "12px",
                    alignItems: "center",
                    background: i < 4 ? theme.primarySoft : "transparent",
                    border: `1px solid ${i < 4 ? theme.border : "transparent"}`,
                    cursor: "pointer",
                    transition: "background 0.15s"
                  }}>
                    <span style={{
                      textAlign: "center",
                      fontWeight: 800,
                      fontSize: "14px",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: i === 0 ? theme.primary : "transparent",
                      color: i === 0 ? "white" : i < 3 ? theme.primary : "#6b7280",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      fontSize: "13px"
                    }}>
                      {team.rank || i + 1}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                      <img
                        src={team.logo}
                        alt={team.name}
                        style={{ width: "28px", height: "28px", objectFit: "contain", flexShrink: 0 }}
                      />
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {team.name}
                      </span>
                    </div>
                    {isBasketball ? (
                      <>
                        <span style={{ textAlign: "center", fontSize: "13px", color: "#6b7280" }}>{team.played ?? "—"}</span>
                        <span style={{ textAlign: "center", fontSize: "13px", color: "#16a34a", fontWeight: 700 }}>{team.won ?? "—"}</span>
                        <span style={{ textAlign: "center", fontSize: "13px", color: "#dc2626" }}>{team.lost ?? "—"}</span>
                        <span style={{ textAlign: "center", fontSize: "13px", color: "#ca8a04" }}>{team.pct !== undefined ? (team.pct * 100).toFixed(1) + "%" : "—"}</span>
                        <span style={{ textAlign: "center", fontSize: "15px", fontWeight: 900, color: theme.primary }}>{team.won ?? "—"}</span>
                      </>
                    ) : (
                      <>
                        <span style={{ textAlign: "center", fontSize: "13px", color: "#6b7280" }}>{team.played ?? "—"}</span>
                        <span style={{ textAlign: "center", fontSize: "13px", color: "#16a34a", fontWeight: 700 }}>{team.won ?? "—"}</span>
                        <span style={{ textAlign: "center", fontSize: "13px", color: "#ca8a04" }}>{team.drawn ?? "—"}</span>
                        <span style={{ textAlign: "center", fontSize: "13px", color: "#dc2626" }}>{team.lost ?? "—"}</span>
                        <span style={{ textAlign: "center", fontSize: "15px", fontWeight: 900, color: theme.primary }}>{team.points ?? "—"}</span>
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Collapsible rest */}
            {rest.length > 0 && (
              <details style={{ marginTop: "8px" }}>
                <summary style={{
                  cursor: "pointer",
                  textAlign: "center",
                  padding: "10px",
                  color: theme.primary,
                  fontSize: "13px",
                  fontWeight: 700,
                  background: theme.primarySoft,
                  borderRadius: "12px",
                  border: `1px solid ${theme.border}`,
                  listStyle: "none",
                  userSelect: "none"
                }}>
                  ▼ عرض باقي الترتيب ({rest.length} فريق)
                </summary>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "6px" }}>
                  {rest.map((team, i) => (
                    <Link
                      key={team.slug || i}
                      href={`/team/${team.slug || "#"}/`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: gridCols,
                        gap: "4px",
                        padding: "10px 12px",
                        borderRadius: "12px",
                        alignItems: "center",
                        cursor: "pointer"
                      }}>
                        <span style={{ textAlign: "center", fontSize: "13px", color: "#9ca3af", fontWeight: 700 }}>{team.rank || top10.length + i + 1}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                          <img src={team.logo} alt={team.name} style={{ width: "26px", height: "26px", objectFit: "contain", flexShrink: 0 }} />
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{team.name}</span>
                        </div>
                        {isBasketball ? (
                          <>
                            <span style={{ textAlign: "center", fontSize: "12px", color: "#9ca3af" }}>{team.played ?? "—"}</span>
                            <span style={{ textAlign: "center", fontSize: "12px", color: "#9ca3af" }}>{team.won ?? "—"}</span>
                            <span style={{ textAlign: "center", fontSize: "12px", color: "#9ca3af" }}>{team.lost ?? "—"}</span>
                            <span style={{ textAlign: "center", fontSize: "12px", color: "#9ca3af" }}>{team.pct !== undefined ? (team.pct * 100).toFixed(1) + "%" : "—"}</span>
                            <span style={{ textAlign: "center", fontSize: "14px", fontWeight: 800, color: "#374151" }}>{team.won ?? "—"}</span>
                          </>
                        ) : (
                          <>
                            <span style={{ textAlign: "center", fontSize: "12px", color: "#9ca3af" }}>{team.played ?? "—"}</span>
                            <span style={{ textAlign: "center", fontSize: "12px", color: "#9ca3af" }}>{team.won ?? "—"}</span>
                            <span style={{ textAlign: "center", fontSize: "12px", color: "#9ca3af" }}>{team.drawn ?? "—"}</span>
                            <span style={{ textAlign: "center", fontSize: "12px", color: "#9ca3af" }}>{team.lost ?? "—"}</span>
                            <span style={{ textAlign: "center", fontSize: "14px", fontWeight: 800, color: "#374151" }}>{team.points ?? "—"}</span>
                          </>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </details>
            )}

            {/* Footer link */}
            <div style={{ textAlign: "center", marginTop: "14px" }}>
              <Link href={`/league/${params.slug}/classement/`} style={{
                display: "inline-block", textDecoration: "none",
                background: theme.primary, color: "white",
                padding: "10px 28px", borderRadius: "999px",
                fontSize: "14px", fontWeight: 800
              }}>
                الترتيب الكامل للبطولة →
              </Link>
            </div>
          </section>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "24px",
            marginBottom: "28px"
          }}
        >
          {featuredArticle ? (
            <Link
              href={`/articles/${featuredArticle.slug}/`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <article
                style={{
                  background: theme.cardBg,
                  borderRadius: "28px",
                  overflow: "hidden",
                  border: `1px solid ${theme.border}`,
                  boxShadow: "0 12px 30px rgba(0,0,0,0.05)",
                  height: "100%"
                }}
              >
                <ArticleImage
                  src={featuredArticle.image}
                  imageUrl={featuredArticle.imageUrl}
                  alt={featuredArticle.title}
                  sport={featuredArticle.sport}
                  league={featuredArticle.league}
                  slug={featuredArticle.slug}
                  style={{ width: "100%", height: "360px", display: "block" }}
                />

                <div style={{ padding: "28px" }}>
                  <div
                    style={{
                      display: "inline-block",
                      marginBottom: "12px",
                      padding: "8px 13px",
                      borderRadius: "999px",
                      background: theme.primarySoft,
                      color: theme.primary,
                      fontSize: "13px",
                      fontWeight: 700
                    }}
                  >
                    الخبر الأبرز
                  </div>

                  <h2
                    style={{
                      margin: "0 0 14px 0",
                      fontSize: "34px",
                      lineHeight: 1.55,
                      fontWeight: 800,
                      color: theme.text
                    }}
                  >
                    {featuredArticle.title}
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: theme.subtext,
                      fontSize: "18px",
                      lineHeight: 1.95
                    }}
                  >
                    {featuredArticle.description}
                  </p>
                </div>
              </article>
            </Link>
          ) : null}

          <div
            style={{
              background: theme.cardBg,
              borderRadius: "28px",
              padding: "28px",
              border: `1px solid ${theme.border}`,
              boxShadow: "0 12px 30px rgba(0,0,0,0.05)"
            }}
          >
            <div
              style={{
                color: theme.primary,
                fontSize: "14px",
                fontWeight: 700,
                marginBottom: "10px"
              }}
            >
              هوية القسم
            </div>

            <h2
              style={{
                margin: "0 0 14px 0",
                fontSize: "34px",
                lineHeight: 1.4,
                fontWeight: 800,
                color: theme.text
              }}
            >
              {league.title}
            </h2>

            <p
              style={{
                margin: "0 0 18px 0",
                color: theme.subtext,
                fontSize: "18px",
                lineHeight: 1.95
              }}
            >
              هذه الصفحة مخصصة لتجميع أبرز مواد {league.title} داخل الموقع، مع هوية
              بصرية خاصة بالبطولة وربط مباشر بصفحات الأندية والمقالات ذات الصلة.
            </p>

            <div
              style={{
                display: "grid",
                gap: "12px"
              }}
            >
              {league.highlights.map((item, index) => (
                <div
                  key={index}
                  style={{
                    background: theme.primarySoft,
                    border: `1px solid ${theme.border}`,
                    color: theme.primary,
                    padding: "12px 14px",
                    borderRadius: "16px",
                    fontSize: "15px",
                    fontWeight: 700
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <AdSlot label="مساحة إعلانية وسط صفحة البطولة" minHeight={120} style={{ marginBottom: 24 }} />

        {leagueArticles.length === 0 ? (
          <section
            style={{
              background: theme.cardBg,
              borderRadius: "24px",
              padding: "28px",
              border: `1px solid ${theme.border}`,
              color: theme.subtext,
              fontSize: "18px",
              lineHeight: 1.9
            }}
          >
            لا توجد مواد كافية في هذا القسم حالياً. سيتم تحديث الصفحة تلقائياً مع وصول
            أخبار جديدة مرتبطة بهذه البطولة.
          </section>
        ) : (
          <section>
            <h2 style={{ margin: "0 0 18px 0", fontSize: "38px", fontWeight: 800, color: theme.text }}>
              أحدث مواد {league.title}
            </h2>
            <ArticleFiltersClient
              articles={leagueArticles}
              lang="ar"
              prefix=""
              primaryColor={theme.primary}
              showSportFilter={true}
            />
          </section>
        )}
      </div>
    </main>
  );
}
