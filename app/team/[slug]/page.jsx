import Link from "next/link";
import articles from "../../../content/articles/seo-articles.json";
import AdSlot from "../../components/AdSlot";

const teamsData = {
  "manchester-city": {
    name: "مانشستر سيتي",
    league: "premier-league",
    leagueName: "الدوري الإنجليزي الممتاز",
    leagueUrl: "/league/premier-league/",
    colorFrom: "#4f46e5",
    colorTo: "#7c3aed",
    accent: "#6366f1",
    logo: "/teams/premier-league/manchester-city.png",
    founded: "1880",
    stadium: "ملعب الاتحاد",
    city: "مانشستر",
    coach: "بيب غوارديولا",
    history: [
      "يُعد مانشستر سيتي من أبرز الأندية الإنجليزية في العصر الحديث، وقد عرف قفزة كبيرة على مستوى النتائج والهوية الفنية خلال العقد الأخير.",
      "ارتبط اسم النادي بأسلوب لعب هجومي منظم، كما نجح في ترسيخ حضوره الدائم في سباقات الدوري والكؤوس المحلية والمنافسات الأوروبية.",
      "بفضل الاستقرار الفني والإداري، تحول الفريق إلى أحد أهم الأسماء في كرة القدم الأوروبية."
    ],
    titles: [
      "الدوري الإنجليزي الممتاز",
      "كأس الاتحاد الإنجليزي",
      "كأس الرابطة الإنجليزية",
      "دوري أبطال أوروبا"
    ],
    staff: [
      "مدير فني",
      "جهاز فني مساعد",
      "إدارة رياضية",
      "طاقم طبي وإعداد بدني"
    ],
    players: [
      "إيرلينغ هالاند",
      "كيفن دي بروين",
      "فيل فودين",
      "برناردو سيلفا",
      "رودري",
      "روبن دياز"
    ],
    legends: [
      "سيرجيو أغويرو",
      "دافيد سيلفا",
      "فينسنت كومباني",
      "يايا توريه"
    ],
    officialLinks: {
      website: "https://www.mancity.com",
      youtube: "https://www.youtube.com/@mancity"
    },
    videoEmbed: "https://www.youtube.com/embed/eN8xwT4f4Nw"
  },

  "manchester-united": {
    name: "مانشستر يونايتد",
    league: "premier-league",
    leagueName: "الدوري الإنجليزي الممتاز",
    leagueUrl: "/league/premier-league/",
    colorFrom: "#7f1d1d",
    colorTo: "#dc2626",
    accent: "#ef4444",
    logo: "/teams/premier-league/manchester-united.png",
    founded: "1878",
    stadium: "أولد ترافورد",
    city: "مانشستر",
    coach: "المدرب الحالي حسب الموقع الرسمي",
    history: [
      "يُعتبر مانشستر يونايتد من أكثر الأندية شهرة في العالم، ويملك إرثًا كبيرًا في الكرة الإنجليزية والأوروبية.",
      "ارتبط النادي بفترات تاريخية ناجحة وبعدد كبير من النجوم والمدربين الذين صنعوا مجده المحلي والقاري.",
      "ولا يزال اسم اليونايتد حاضرًا بقوة في الأخبار والتحليلات بفضل مكانته وجماهيريته الواسعة."
    ],
    titles: [
      "الدوري الإنجليزي",
      "كأس الاتحاد الإنجليزي",
      "كأس الرابطة",
      "دوري أبطال أوروبا"
    ],
    staff: [
      "مدير فني",
      "جهاز فني",
      "إدارة كروية",
      "طاقم طبي"
    ],
    players: [
      "برونو فيرنانديز",
      "ماركوس راشفورد",
      "كاسيميرو",
      "أندريه أونانا",
      "ليساندرو مارتينيز",
      "راسموس هويلوند"
    ],
    legends: [
      "ريان غيغز",
      "بول سكولز",
      "واين روني",
      "إريك كانتونا"
    ],
    officialLinks: {
      website: "https://www.manutd.com",
      youtube: "https://www.youtube.com/@manutd"
    },
    videoEmbed: "https://www.youtube.com/embed/8M7KGe2UnmE"
  },

  "liverpool": {
    name: "ليفربول",
    league: "premier-league",
    leagueName: "الدوري الإنجليزي الممتاز",
    leagueUrl: "/league/premier-league/",
    colorFrom: "#991b1b",
    colorTo: "#ef4444",
    accent: "#dc2626",
    logo: "/teams/premier-league/liverpool.png",
    founded: "1892",
    stadium: "أنفيلد",
    city: "ليفربول",
    coach: "المدرب الحالي حسب الموقع الرسمي",
    history: [
      "ليفربول من أكثر الأندية عراقة في إنجلترا، ويملك تاريخًا حافلًا بالألقاب المحلية والقارية.",
      "عرف الفريق بفتراته الذهبية وبشخصيته القوية داخل ملعب أنفيلد، كما ارتبط بأسماء كبيرة صنعت مجده.",
      "يبقى النادي أحد أهم رموز الكرة الإنجليزية وأكثرها تأثيرًا جماهيريًا."
    ],
    titles: [
      "الدوري الإنجليزي",
      "كأس الاتحاد الإنجليزي",
      "كأس الرابطة",
      "دوري أبطال أوروبا"
    ],
    staff: [
      "مدير فني",
      "جهاز فني",
      "إدارة رياضية",
      "طاقم طبي"
    ],
    players: [
      "محمد صلاح",
      "فيرجيل فان دايك",
      "أليسون بيكر",
      "ترنت ألكسندر أرنولد",
      "أليكسيس ماك أليستر",
      "داروين نونيز"
    ],
    legends: [
      "ستيفن جيرارد",
      "كيني دالغليش",
      "إيان راش",
      "جيمي كاراغر"
    ],
    officialLinks: {
      website: "https://www.liverpoolfc.com",
      youtube: "https://www.youtube.com/@LiverpoolFC"
    },
    videoEmbed: "https://www.youtube.com/embed/gR1VjA6Yx5M"
  },

  "arsenal": {
    name: "آرسنال",
    league: "premier-league",
    leagueName: "الدوري الإنجليزي الممتاز",
    leagueUrl: "/league/premier-league/",
    colorFrom: "#991b1b",
    colorTo: "#f97316",
    accent: "#ef4444",
    logo: "/teams/premier-league/arsenal.png",
    founded: "1886",
    stadium: "ملعب الإمارات",
    city: "لندن",
    coach: "ميكيل أرتيتا",
    history: [
      "آرسنال من الأندية التاريخية في لندن وإنجلترا، ويملك قاعدة جماهيرية كبيرة وهوية كروية معروفة.",
      "عرف الفريق بأسلوب لعب جذاب وبفترات ناجحة محليًا، كما لعب دورًا مهمًا في تاريخ الدوري الإنجليزي.",
      "ويواصل النادي حضوره في قمة النقاشات المرتبطة بالبريميرليغ بفضل مشروعه الفني الحالي."
    ],
    titles: [
      "الدوري الإنجليزي",
      "كأس الاتحاد الإنجليزي",
      "الدرع الخيرية"
    ],
    staff: [
      "مدير فني",
      "جهاز مساعد",
      "إدارة رياضية",
      "طاقم طبي"
    ],
    players: [
      "بوكايو ساكا",
      "مارتن أوديغارد",
      "ديكلان رايس",
      "ويليام ساليبا",
      "غابرييل جيسوس",
      "كاي هافيرتز"
    ],
    legends: [
      "تييري هنري",
      "دينيس بيركامب",
      "باتريك فييرا",
      "توني آدامز"
    ],
    officialLinks: {
      website: "https://www.arsenal.com",
      youtube: "https://www.youtube.com/@arsenal"
    },
    videoEmbed: "https://www.youtube.com/embed/ed8nC7D2v1Q"
  },

  "chelsea": {
    name: "تشيلسي",
    league: "premier-league",
    leagueName: "الدوري الإنجليزي الممتاز",
    leagueUrl: "/league/premier-league/",
    colorFrom: "#1d4ed8",
    colorTo: "#2563eb",
    accent: "#3b82f6",
    logo: "/teams/premier-league/chelsea.png",
    founded: "1905",
    stadium: "ستامفورد بريدج",
    city: "لندن",
    coach: "المدرب الحالي حسب الموقع الرسمي",
    history: [
      "تشيلسي من أندية القمة في إنجلترا، وقد حقق نجاحات كبيرة محليًا وقاريًا خلال العقود الأخيرة.",
      "ارتبط النادي بلندن وبمشروع رياضي قوي جعله حاضرًا باستمرار في سباقات الألقاب.",
      "كما يتمتع بقاعدة جماهيرية كبيرة وبحضور إعلامي لافت داخل الدوري الإنجليزي."
    ],
    titles: [
      "الدوري الإنجليزي",
      "كأس الاتحاد الإنجليزي",
      "دوري أبطال أوروبا"
    ],
    staff: [
      "مدير فني",
      "جهاز فني",
      "إدارة كروية",
      "طاقم طبي"
    ],
    players: [
      "إنزو فيرنانديز",
      "كول بالمر",
      "ريس جيمس",
      "رحيم سترلينغ",
      "مويسيس كايسيدو",
      "نيكولاس جاكسون"
    ],
    legends: [
      "فرانك لامبارد",
      "جون تيري",
      "ديدييه دروغبا",
      "بيتر تشيك"
    ],
    officialLinks: {
      website: "https://www.chelseafc.com",
      youtube: "https://www.youtube.com/@chelseafc"
    },
    videoEmbed: "https://www.youtube.com/embed/fb1fM9h7n2Q"
  },

  "tottenham": {
    name: "توتنهام",
    league: "premier-league",
    leagueName: "الدوري الإنجليزي الممتاز",
    leagueUrl: "/league/premier-league/",
    colorFrom: "#0f172a",
    colorTo: "#334155",
    accent: "#475569",
    logo: "/teams/premier-league/tottenham.png",
    founded: "1882",
    stadium: "توتنهام هوتسبير",
    city: "لندن",
    coach: "المدرب الحالي حسب الموقع الرسمي",
    history: [
      "توتنهام من الأندية المعروفة في العاصمة لندن، ويملك حضورًا ثابتًا في الكرة الإنجليزية.",
      "يتميز النادي بجماهيره الكبيرة وبسعيه الدائم إلى تثبيت موقعه بين كبار البريميرليغ.",
      "وغالبًا ما يكون حاضرًا في صراع المراكز المتقدمة والمنافسات الأوروبية."
    ],
    titles: [
      "كأس الاتحاد الإنجليزي",
      "كأس الرابطة",
      "ألقاب أوروبية تاريخية"
    ],
    staff: [
      "مدير فني",
      "جهاز فني",
      "إدارة رياضية"
    ],
    players: [
      "سون هيونغ مين",
      "جيمس ماديسون",
      "ديان كولوسيفسكي",
      "روميرو",
      "ريتشارليسون",
      "بيدرو بورو"
    ],
    legends: [
      "هاري كين",
      "غاري لينيكر",
      "غلين هودل",
      "ليدلي كينغ"
    ],
    officialLinks: {
      website: "https://www.tottenhamhotspur.com",
      youtube: "https://www.youtube.com/@TottenhamHotspur"
    },
    videoEmbed: "https://www.youtube.com/embed/2h5mKQJ3d0Y"
  },

  "real-madrid": {
    name: "ريال مدريد",
    league: "la-liga",
    leagueName: "الدوري الإسباني",
    leagueUrl: "/league/la-liga/",
    colorFrom: "#1e293b",
    colorTo: "#64748b",
    accent: "#94a3b8",
    logo: "/teams/la-liga/real-madrid.png",
    founded: "1902",
    stadium: "سانتياغو برنابيو",
    city: "مدريد",
    coach: "كارلو أنشيلوتي",
    history: [
      "ريال مدريد من أنجح الأندية في تاريخ كرة القدم العالمية، ويملك إرثًا استثنائيًا على مستوى الألقاب والشهرة.",
      "ارتبط اسم النادي بكبار النجوم والمدربين، واحتل مكانة مركزية في تاريخ الليغا ودوري الأبطال.",
      "ويبقى من أكثر الفرق متابعة وتأثيرًا في المشهد الكروي العالمي."
    ],
    titles: [
      "الدوري الإسباني",
      "كأس الملك",
      "دوري أبطال أوروبا",
      "كأس العالم للأندية"
    ],
    staff: [
      "مدير فني",
      "جهاز فني",
      "إدارة رياضية",
      "طاقم طبي"
    ],
    players: [
      "جود بيلينغهام",
      "فينيسيوس جونيور",
      "رودريغو",
      "فيديريكو فالفيردي",
      "أوريلين تشواميني",
      "إدواردو كامافينغا"
    ],
    legends: [
      "كريستيانو رونالدو",
      "زين الدين زيدان",
      "راؤول",
      "إيكر كاسياس"
    ],
    officialLinks: {
      website: "https://www.realmadrid.com",
      youtube: "https://www.youtube.com/@RealMadrid"
    },
    videoEmbed: "https://www.youtube.com/embed/c0Qw0Q6M6Y8"
  },

  "barcelona": {
    name: "برشلونة",
    league: "la-liga",
    leagueName: "الدوري الإسباني",
    leagueUrl: "/league/la-liga/",
    colorFrom: "#1d4ed8",
    colorTo: "#7c2d12",
    accent: "#2563eb",
    logo: "/teams/la-liga/barcelona.png",
    founded: "1899",
    stadium: "كامب نو",
    city: "برشلونة",
    coach: "المدرب الحالي حسب الموقع الرسمي",
    history: [
      "برشلونة من أعظم أندية العالم، ويتميز بهويته الكروية الخاصة وبمدرسته الشهيرة في تطوير المواهب.",
      "حقق النادي نجاحات كبيرة محليًا وقاريًا، وظل حاضرًا في قمة المنافسة لسنوات طويلة.",
      "ويرتبط اسم برشلونة بأسلوب لعب جذاب وبنجوم بارزين تركوا بصمتهم في تاريخ اللعبة."
    ],
    titles: [
      "الدوري الإسباني",
      "كأس الملك",
      "دوري أبطال أوروبا",
      "السوبر الإسباني"
    ],
    staff: [
      "مدير فني",
      "جهاز فني",
      "إدارة",
      "طاقم طبي"
    ],
    players: [
      "روبرت ليفاندوفسكي",
      "بيدري",
      "غافي",
      "رافينيا",
      "جول كوندي",
      "فرينكي دي يونغ"
    ],
    legends: [
      "ليونيل ميسي",
      "تشافي",
      "أندريس إنييستا",
      "كارليس بويول"
    ],
    officialLinks: {
      website: "https://www.fcbarcelona.com",
      youtube: "https://www.youtube.com/@FCBarcelona"
    },
    videoEmbed: "https://www.youtube.com/embed/RM0R7s0TQ2A"
  },

  "atletico-madrid": {
    name: "أتلتيكو مدريد",
    league: "la-liga",
    leagueName: "الدوري الإسباني",
    leagueUrl: "/league/la-liga/",
    colorFrom: "#991b1b",
    colorTo: "#1d4ed8",
    accent: "#ef4444",
    logo: "/teams/la-liga/atletico-madrid.png",
    founded: "1903",
    stadium: "ميتروبوليتانو",
    city: "مدريد",
    coach: "دييغو سيميوني",
    history: [
      "أتلتيكو مدريد من الأندية الكبيرة في إسبانيا، ويملك شخصية تنافسية قوية داخل الليغا وأوروبا.",
      "عرف النادي بصلابته التنظيمية وروحه القتالية، ما جعله منافسًا دائمًا على الألقاب.",
      "كما رسخ مكانته كطرف أساسي في المشهد الكروي الإسباني إلى جانب ريال مدريد وبرشلونة."
    ],
    titles: [
      "الدوري الإسباني",
      "كأس الملك",
      "الدوري الأوروبي"
    ],
    staff: [
      "مدير فني",
      "جهاز فني",
      "إدارة",
      "طاقم طبي"
    ],
    players: [
      "أنطوان غريزمان",
      "كوكي",
      "أوبلاك",
      "ماركوس يورينتي",
      "ألفارو موراتا",
      "خوسيه خيمينيز"
    ],
    legends: [
      "فرناندو توريس",
      "دييغو غودين",
      "غابي",
      "لويس أراغونيس"
    ],
    officialLinks: {
      website: "https://en.atleticodemadrid.com",
      youtube: "https://www.youtube.com/@atleticodemadrid"
    },
    videoEmbed: "https://www.youtube.com/embed/uN4zJm6ZdFE"
  },

  "sevilla": {
    name: "إشبيلية",
    league: "la-liga",
    leagueName: "الدوري الإسباني",
    leagueUrl: "/league/la-liga/",
    colorFrom: "#b91c1c",
    colorTo: "#ef4444",
    accent: "#f87171",
    logo: "/teams/la-liga/sevilla.png",
    founded: "1890",
    stadium: "رامون سانشيز بيزخوان",
    city: "إشبيلية",
    coach: "المدرب الحالي حسب الموقع الرسمي",
    history: [
      "إشبيلية من الأندية الإسبانية المعروفة بقدرتها على المنافسة القارية، خاصة في الدوري الأوروبي.",
      "يملك النادي تاريخًا محترمًا في الليغا والكؤوس المحلية، كما يتمتع بحضور جماهيري واضح.",
      "ويبقى من الأندية التي تفرض احترامها في الكرة الإسبانية."
    ],
    titles: [
      "الدوري الأوروبي",
      "كأس الملك"
    ],
    staff: [
      "مدير فني",
      "جهاز فني",
      "إدارة"
    ],
    players: [
      "سيرخيو راموس",
      "خيسوس نافاس",
      "يوسف النصيري",
      "لوكاس أوكامبوس",
      "سوسو",
      "بادي"
    ],
    legends: [
      "خيسوس نافاس",
      "فريدريك كانوتيه",
      "داني ألفيس",
      "إيفان راكيتيتش"
    ],
    officialLinks: {
      website: "https://www.sevillafc.es",
      youtube: "https://www.youtube.com/@sevillafc"
    },
    videoEmbed: "https://www.youtube.com/embed/7v5r9Q4bR9A"
  },

  "valencia": {
    name: "فالنسيا",
    league: "la-liga",
    leagueName: "الدوري الإسباني",
    leagueUrl: "/league/la-liga/",
    colorFrom: "#111827",
    colorTo: "#f59e0b",
    accent: "#fbbf24",
    logo: "/teams/la-liga/valencia.png",
    founded: "1919",
    stadium: "ميستايا",
    city: "فالنسيا",
    coach: "المدرب الحالي حسب الموقع الرسمي",
    history: [
      "فالنسيا من الأندية التاريخية في إسبانيا، وسبق له أن لعب أدوارًا كبيرة في المنافسة المحلية والقارية.",
      "يتمتع النادي بقاعدة جماهيرية قوية وبملعب معروف يعد من رموز الكرة الإسبانية.",
      "ولا يزال اسم فالنسيا حاضرًا في نقاشات الليغا بفضل تاريخه ومكانته."
    ],
    titles: [
      "الدوري الإسباني",
      "كأس الملك",
      "ألقاب أوروبية"
    ],
    staff: [
      "مدير فني",
      "جهاز فني",
      "إدارة"
    ],
    players: [
      "خوسيه غايا",
      "خافي غيرا",
      "هوغو دورو",
      "أندري ألميادا",
      "أندريه ألميدا",
      "دييغو لوبيز"
    ],
    legends: [
      "دافيد فيا",
      "سانتياغو كانيزاريس",
      "بابلو أيمار",
      "روبرتو أيالا"
    ],
    officialLinks: {
      website: "https://www.valenciacf.com",
      youtube: "https://www.youtube.com/@valenciacf"
    },
    videoEmbed: "https://www.youtube.com/embed/p5cbA4m4o2Q"
  },

  "real-sociedad": {
    name: "ريال سوسيداد",
    league: "la-liga",
    leagueName: "الدوري الإسباني",
    leagueUrl: "/league/la-liga/",
    colorFrom: "#1d4ed8",
    colorTo: "#0f172a",
    accent: "#60a5fa",
    logo: "/teams/la-liga/real-sociedad.png",
    founded: "1909",
    stadium: "أنويتا",
    city: "سان سيباستيان",
    coach: "المدرب الحالي حسب الموقع الرسمي",
    history: [
      "ريال سوسيداد من الأندية المحترمة في إسبانيا، ويمتلك تاريخًا مهمًا داخل الليغا.",
      "عرف النادي بتطوير المواهب واللعب المنظم، ونجح في فرض نفسه في مراحل مختلفة من المنافسة.",
      "كما يحافظ على صورة مستقرة بين فرق الصف الأول في الكرة الإسبانية."
    ],
    titles: [
      "الدوري الإسباني",
      "كأس الملك"
    ],
    staff: [
      "مدير فني",
      "جهاز فني",
      "إدارة"
    ],
    players: [
      "ميكيل أويارزابال",
      "تاكيفوسا كوبو",
      "ميرينو",
      "زوبيلديا",
      "سوبيميندي",
      "ريميرو"
    ],
    legends: [
      "تشابي ألونسو",
      "داركو كوفاسيفيتش",
      "نيهات",
      "كاربين"
    ],
    officialLinks: {
      website: "https://www.realsociedad.eus",
      youtube: "https://www.youtube.com/@RealSociedadTV"
    },
    videoEmbed: "https://www.youtube.com/embed/kL0vF6YdC4M"
  }
};

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

  if (!team) {
    return {
      title: "الفريق غير موجود",
      description: "هذه الصفحة غير متاحة حالياً."
    };
  }

  return {
    title: team.name,
    description: `تعرف على تاريخ ${team.name}، أبرز الألقاب، الملعب، المدينة، والملفات الأساسية الخاصة بالنادي.`,
    alternates: {
      canonical: `https://nabdriyadah.com/team/${params.slug}/`
    }
  };
}

export default function TeamPage({ params }) {
  const team = teamsData[params.slug];

  if (!team) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "40px 20px",
          direction: "rtl",
          background: "#f8fafc"
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div
            style={{
              background: "white",
              borderRadius: "24px",
              padding: "28px",
              border: "1px solid #e5e7eb"
            }}
          >
            الفريق غير موجود.
          </div>
        </div>
      </main>
    );
  }

  const teamArticles = articles
    .filter((article) => article.league === team.league)
    .filter((article) => {
      const haystack = [
        article.title,
        article.description,
        ...(Array.isArray(article.keywords) ? article.keywords : [])
      ]
        .join(" ")
        .toLowerCase();

      const teamTokens = team.name.toLowerCase().split(" ");
      return teamTokens.some((token) => token && haystack.includes(token));
    })
    .slice(0, 6);

  const history = safeArray(team.history);
  const titles = safeArray(team.titles);
  const staff = safeArray(team.staff);
  const players = safeArray(team.players);
  const legends = safeArray(team.legends);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "28px 20px 52px",
        direction: "rtl"
      }}
    >
      <div style={{ maxWidth: "1450px", margin: "0 auto" }}>
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            background: `linear-gradient(135deg, ${team.colorFrom}, ${team.colorTo})`,
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
                href={team.leagueUrl}
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
                صفحة تعريفية شاملة عن {team.name} تتضمن لمحة تاريخية، الملعب، المدينة،
                أبرز الألقاب، وأهم المواد المرتبطة بالنادي داخل الموقع.
              </p>
            </div>
          </div>
        </section>

        <AdSlot label="مساحة إعلانية أعلى صفحة الفريق" minHeight={90} style={{ marginBottom: 24 }} />

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "20px",
            marginBottom: "28px"
          }}
        >
          <div style={{ background: "white", borderRadius: "22px", padding: "22px", border: "1px solid #e5e7eb" }}>
            <div style={{ color: team.accent, fontSize: "14px", fontWeight: 700, marginBottom: "8px" }}>سنة التأسيس</div>
            <div style={{ fontSize: "30px", fontWeight: 800, color: "#111827" }}>{team.founded}</div>
          </div>

          <div style={{ background: "white", borderRadius: "22px", padding: "22px", border: "1px solid #e5e7eb" }}>
            <div style={{ color: team.accent, fontSize: "14px", fontWeight: 700, marginBottom: "8px" }}>الملعب</div>
            <div style={{ fontSize: "30px", fontWeight: 800, color: "#111827" }}>{team.stadium}</div>
          </div>

          <div style={{ background: "white", borderRadius: "22px", padding: "22px", border: "1px solid #e5e7eb" }}>
            <div style={{ color: team.accent, fontSize: "14px", fontWeight: 700, marginBottom: "8px" }}>المدينة</div>
            <div style={{ fontSize: "30px", fontWeight: 800, color: "#111827" }}>{team.city}</div>
          </div>

          <div style={{ background: "white", borderRadius: "22px", padding: "22px", border: "1px solid #e5e7eb" }}>
            <div style={{ color: team.accent, fontSize: "14px", fontWeight: 700, marginBottom: "8px" }}>البطولة</div>
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
          <div style={{ background: "white", borderRadius: "28px", padding: "28px", border: "1px solid #e5e7eb" }}>
            <h2 style={{ margin: "0 0 18px 0", fontSize: "34px", fontWeight: 800, color: "#111827" }}>تاريخ النادي</h2>

            <div style={{ color: "#4b5563", fontSize: "18px", lineHeight: 2, display: "grid", gap: "14px" }}>
              {history.map((paragraph, index) => (
                <p key={index} style={{ margin: 0 }}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gap: "24px" }}>
            <div style={{ background: "white", borderRadius: "28px", padding: "28px", border: "1px solid #e5e7eb" }}>
              <h2 style={{ margin: "0 0 16px 0", fontSize: "28px", fontWeight: 800 }}>الجهاز الفني</h2>

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

                {staff.map((item, index) => (
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

            <div style={{ background: "white", borderRadius: "28px", padding: "28px", border: "1px solid #e5e7eb" }}>
              <h2 style={{ margin: "0 0 16px 0", fontSize: "28px", fontWeight: 800 }}>أبرز الألقاب</h2>

              <div style={{ display: "grid", gap: "10px" }}>
                {titles.map((title, index) => (
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

        <AdSlot label="مساحة إعلانية وسط صفحة الفريق" minHeight={120} style={{ marginBottom: 24 }} />

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginBottom: "28px"
          }}
        >
          <div style={{ background: "white", borderRadius: "28px", padding: "28px", border: "1px solid #e5e7eb" }}>
            <h2 style={{ margin: "0 0 16px 0", fontSize: "30px", fontWeight: 800 }}>اللاعبون الحاليون</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "12px"
              }}
            >
              {players.map((player, index) => (
                <div
                  key={index}
                  style={{
                    background: "#f8fafc",
                    borderRadius: "16px",
                    padding: "14px",
                    color: "#111827",
                    fontWeight: 700
                  }}
                >
                  {player}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "white", borderRadius: "28px", padding: "28px", border: "1px solid #e5e7eb" }}>
            <h2 style={{ margin: "0 0 16px 0", fontSize: "30px", fontWeight: 800 }}>أساطير النادي</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "12px"
              }}
            >
              {legends.map((legend, index) => (
                <div
                  key={index}
                  style={{
                    background: "#f8fafc",
                    borderRadius: "16px",
                    padding: "14px",
                    color: "#111827",
                    fontWeight: 700
                  }}
                >
                  {legend}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          style={{
            background: "white",
            borderRadius: "28px",
            padding: "28px",
            border: "1px solid #e5e7eb",
            marginBottom: "28px"
          }}
        >
          <h2 style={{ margin: "0 0 18px 0", fontSize: "30px", fontWeight: 800 }}>فيديو رسمي</h2>

          <div
            style={{
              position: "relative",
              paddingBottom: "56.25%",
              height: 0,
              overflow: "hidden",
              borderRadius: "20px"
            }}
          >
            <iframe
              src={team.videoEmbed}
              title={team.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: 0,
                borderRadius: "20px"
              }}
            />
          </div>
        </section>

        <section
          style={{
            background: "white",
            borderRadius: "28px",
            padding: "28px",
            border: "1px solid #e5e7eb",
            marginBottom: "28px"
          }}
        >
          <h2 style={{ margin: "0 0 18px 0", fontSize: "30px", fontWeight: 800 }}>روابط ومصادر رسمية</h2>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
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
            background: "white",
            borderRadius: "28px",
            padding: "28px",
            border: "1px solid #e5e7eb"
          }}
        >
          <h2 style={{ margin: "0 0 18px 0", fontSize: "30px", fontWeight: 800 }}>مواد مرتبطة بالنادي</h2>

          {teamArticles.length === 0 ? (
            <div style={{ color: "#6b7280", fontSize: "17px", lineHeight: 1.9 }}>
              لا توجد بعد مواد كثيرة مرتبطة مباشرة بهذا النادي داخل الموقع، لكن سيتم توسيع الربط تلقائيًا مع نمو المحتوى.
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
