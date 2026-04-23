import Link from "next/link";
import articles from "../../../content/articles/seo-articles.json";
import AdSlot from "../../components/AdSlot";

const teamsData = {
  "real-madrid": {
    name: "ريال مدريد",
    logo: "/teams/la-liga/real-madrid.png",
    league: "la-liga",
    leagueName: "الدوري الإسباني",
    colorFrom: "#374151",
    colorTo: "#6b7280",
    accent: "#9ca3af",
    description:
      "يُعد ريال مدريد من أنجح الأندية في تاريخ كرة القدم العالمية، ويملك إرثًا استثنائيًا على مستوى الألقاب والشهرة.",
    history: [
      "تأسس نادي ريال مدريد سنة 1902، ويعتبر من أبرز الأندية في العالم من حيث الإنجازات والقيمة التاريخية.",
      "ارتبط اسم النادي بكبار النجوم والمدربين، واحتل مكانة مركزية في تاريخ الليغا ودوري أبطال أوروبا.",
      "ويظل ريال مدريد واحدًا من أكثر الفرق متابعة وتأثيرًا في المشهد الكروي العالمي، بفضل تاريخه الطويل وحضوره المستمر في المنافسات الكبرى."
    ],
    stadium: "سانتياغو برنابيو",
    city: "مدريد",
    coach: "المدرب الحالي حسب آخر تحديثات النادي الرسمية",
    titles: [
      "الدوري الإسباني",
      "كأس ملك إسبانيا",
      "دوري أبطال أوروبا",
      "كأس العالم للأندية"
    ],
    players: [
      "فينيسيوس جونيور",
      "جود بيلينغهام",
      "رودريغو",
      "كامافينغا",
      "فالفيردي",
      "تيبو كورتوا"
    ],
    legends: [
      "كريستيانو رونالدو",
      "زين الدين زيدان",
      "راؤول",
      "إيكر كاسياس"
    ],
    video: "https://www.youtube.com/embed/V8v8J8v8-placeholder",
    officialLinks: {
      website: "https://www.realmadrid.com",
      youtube: "https://www.youtube.com/@RealMadrid"
    }
  },

  "barcelona": {
    name: "برشلونة",
    logo: "/teams/la-liga/barcelona.png",
    league: "la-liga",
    leagueName: "الدوري الإسباني",
    colorFrom: "#1d4ed8",
    colorTo: "#7c2d12",
    accent: "#2563eb",
    description:
      "يعد برشلونة من أعظم الأندية في العالم، ويتميز بهويته الكروية الخاصة وبمدرسته الشهيرة في تطوير المواهب.",
    history: [
      "تأسس نادي برشلونة سنة 1899، وأصبح واحدًا من أبرز رموز كرة القدم الإسبانية والعالمية.",
      "ارتبط النادي بأسلوب لعب مميز وبأجيال من اللاعبين الكبار الذين صنعوا تاريخه محليًا وقاريًا.",
      "ويحظى برشلونة بمتابعة جماهيرية هائلة بفضل إرثه الرياضي الكبير ومكانته في تاريخ اللعبة."
    ],
    stadium: "كامب نو",
    city: "برشلونة",
    coach: "المدرب الحالي حسب آخر تحديثات النادي الرسمية",
    titles: [
      "الدوري الإسباني",
      "كأس ملك إسبانيا",
      "دوري أبطال أوروبا",
      "السوبر الإسباني"
    ],
    players: [
      "ليفاندوفسكي",
      "بيدري",
      "جافي",
      "أراوخو",
      "دي يونغ",
      "لامين يامال"
    ],
    legends: [
      "ليونيل ميسي",
      "تشافي",
      "إنييستا",
      "كارليس بويول"
    ],
    video: "https://www.youtube.com/embed/V8v8J8v8-placeholder",
    officialLinks: {
      website: "https://www.fcbarcelona.com",
      youtube: "https://www.youtube.com/@FCBarcelona"
    }
  },

  "atletico-madrid": {
    name: "أتلتيكو مدريد",
    logo: "/teams/la-liga/atletico-madrid.png",
    league: "la-liga",
    leagueName: "الدوري الإسباني",
    colorFrom: "#991b1b",
    colorTo: "#1d4ed8",
    accent: "#ef4444",
    description:
      "يعد أتلتيكو مدريد من الأندية الكبيرة في إسبانيا، ويملك شخصية تنافسية قوية داخل الليغا وأوروبا.",
    history: [
      "تأسس أتلتيكو مدريد سنة 1903، ونجح في ترسيخ مكانته كأحد أبرز أندية العاصمة الإسبانية.",
      "عرف النادي بشخصيته القتالية وانضباطه التكتيكي، ما جعله منافسًا دائمًا على الألقاب.",
      "ويبقى الفريق أحد الأسماء المهمة في تاريخ الدوري الإسباني خلال العقود الأخيرة."
    ],
    stadium: "ميتروبوليتانو",
    city: "مدريد",
    coach: "المدرب الحالي حسب آخر تحديثات النادي الرسمية",
    titles: [
      "الدوري الإسباني",
      "كأس ملك إسبانيا",
      "الدوري الأوروبي"
    ],
    players: [
      "أنطوان غريزمان",
      "كوكي",
      "أوبلاك",
      "خوسيه ماريا خيمينيز",
      "ماركوس يورينتي",
      "موراتا"
    ],
    legends: [
      "دييغو فورلان",
      "فرناندو توريس",
      "غودين",
      "أغويرو"
    ],
    video: "https://www.youtube.com/embed/V8v8J8v8-placeholder",
    officialLinks: {
      website: "https://en.atleticodemadrid.com",
      youtube: "https://www.youtube.com/@atleticodemadrid"
    }
  },

  "sevilla": {
    name: "إشبيلية",
    logo: "/teams/la-liga/sevilla.png",
    league: "la-liga",
    leagueName: "الدوري الإسباني",
    colorFrom: "#b91c1c",
    colorTo: "#ef4444",
    accent: "#f87171",
    description:
      "يملك إشبيلية حضورًا قويًا في الكرة الإسبانية، واشتهر بقدرته الكبيرة على المنافسة القارية.",
    history: [
      "يعد إشبيلية من الأندية العريقة في إسبانيا، وحقق مكانة بارزة خصوصًا في البطولات الأوروبية.",
      "ارتبط اسم النادي بإنجازات مهمة في الدوري الأوروبي وبقدرة واضحة على تقديم مواسم قوية.",
      "كما يتمتع الفريق بقاعدة جماهيرية معروفة وحضور مستمر في المنافسات المحلية."
    ],
    stadium: "رامون سانشيز بيزخوان",
    city: "إشبيلية",
    coach: "المدرب الحالي حسب آخر تحديثات النادي الرسمية",
    titles: [
      "الدوري الأوروبي",
      "كأس ملك إسبانيا"
    ],
    players: [
      "اللاعبون الحاليون حسب آخر تحديث رسمي",
      "قائمة الفريق الأول",
      "خط الدفاع",
      "خط الوسط",
      "خط الهجوم"
    ],
    legends: [
      "خيسوس نافاس",
      "كانوتيه",
      "راكيتيتش",
      "داني ألفيس"
    ],
    video: "https://www.youtube.com/embed/V8v8J8v8-placeholder",
    officialLinks: {
      website: "https://www.sevillafc.es",
      youtube: "https://www.youtube.com/@sevillafc"
    }
  },

  "valencia": {
    name: "فالنسيا",
    logo: "/teams/la-liga/valencia.png",
    league: "la-liga",
    leagueName: "الدوري الإسباني",
    colorFrom: "#111827",
    colorTo: "#f59e0b",
    accent: "#fbbf24",
    description:
      "يعد فالنسيا من الأندية التاريخية في إسبانيا، وقد لعب أدوارًا مهمة في المنافسة المحلية والقارية.",
    history: [
      "تأسس فالنسيا سنة 1919، ونجح في بناء مكانة كبيرة داخل الكرة الإسبانية.",
      "عرف النادي بفترات قوية على مستوى الدوري والكأس، كما ترك بصمة واضحة في المنافسات الأوروبية.",
      "ويظل ملعب ميستايا من أبرز رموز النادي ومن أشهر الملاعب في إسبانيا."
    ],
    stadium: "ميستايا",
    city: "فالنسيا",
    coach: "المدرب الحالي حسب آخر تحديثات النادي الرسمية",
    titles: [
      "الدوري الإسباني",
      "كأس ملك إسبانيا",
      "منافسات أوروبية"
    ],
    players: [
      "اللاعبون الحاليون حسب آخر تحديث رسمي",
      "قائمة الدفاع",
      "قائمة الوسط",
      "قائمة الهجوم"
    ],
    legends: [
      "ديفيد فيا",
      "غايزكا مندييتا",
      "سانتي كانيزاريس",
      "روبرتو أيالا"
    ],
    video: "https://www.youtube.com/embed/V8v8J8v8-placeholder",
    officialLinks: {
      website: "https://www.valenciacf.com",
      youtube: "https://www.youtube.com/@valenciacf"
    }
  },

  "real-sociedad": {
    name: "ريال سوسيداد",
    logo: "/teams/la-liga/real-sociedad.png",
    league: "la-liga",
    leagueName: "الدوري الإسباني",
    colorFrom: "#1d4ed8",
    colorTo: "#0f172a",
    accent: "#60a5fa",
    description:
      "ريال سوسيداد من الأندية المحترمة في إسبانيا، ويمتلك تاريخًا مهمًا داخل الليغا.",
    history: [
      "يعتبر ريال سوسيداد من الأندية المعروفة في الكرة الإسبانية، ويملك تاريخًا جيدًا في البطولة المحلية.",
      "تميز النادي بتطوير المواهب وبالاستقرار الفني في مراحل مختلفة من تاريخه.",
      "كما حافظ على صورة قوية بين أندية الصف الأول في إسبانيا."
    ],
    stadium: "أنويتا",
    city: "سان سيباستيان",
    coach: "المدرب الحالي حسب آخر تحديثات النادي الرسمية",
    titles: [
      "الدوري الإسباني",
      "كأس ملك إسبانيا"
    ],
    players: [
      "اللاعبون الحاليون حسب آخر تحديث رسمي",
      "قائمة الفريق الأول",
      "لاعبي الوسط",
      "لاعبي الهجوم"
    ],
    legends: [
      "تشابي ألونسو",
      "أنطوان غريزمان",
      "ميكيل أرتيتا",
      "كوڤاسيفيتش"
    ],
    video: "https://www.youtube.com/embed/V8v8J8v8-placeholder",
    officialLinks: {
      website: "https://www.realsociedad.eus",
      youtube: "https://www.youtube.com/@RealSociedadTV"
    }
  },

  "manchester-city": {
    name: "مانشستر سيتي",
    logo: "/teams/premier-league/manchester-city.png",
    league: "premier-league",
    leagueName: "الدوري الإنجليزي الممتاز",
    colorFrom: "#4f46e5",
    colorTo: "#7c3aed",
    accent: "#6366f1",
    description:
      "يعد مانشستر سيتي من الأندية البارزة في كرة القدم الإنجليزية، وقد عرف تطورًا كبيرًا خلال العقود الأخيرة.",
    history: [
      "تأسس مانشستر سيتي سنة 1880، ونجح في ترسيخ اسمه بين كبار الكرة الإنجليزية.",
      "شهد النادي تحولًا كبيرًا في العصر الحديث، وحقق نجاحات لافتة محليًا وقاريًا.",
      "ويحظى الفريق بمتابعة واسعة بفضل أسلوب لعبه الهجومي وحضوره القوي في المنافسات الكبرى."
    ],
    stadium: "الاتحاد",
    city: "مانشستر",
    coach: "المدرب الحالي حسب آخر تحديثات النادي الرسمية",
    titles: [
      "الدوري الإنجليزي الممتاز",
      "كأس الاتحاد الإنجليزي",
      "كأس الرابطة",
      "دوري أبطال أوروبا"
    ],
    players: [
      "هالاند",
      "كيفن دي بروين",
      "فودين",
      "برناردو سيلفا",
      "إيدرسون",
      "رودري"
    ],
    legends: [
      "سيرخيو أغويرو",
      "دافيد سيلفا",
      "يايا توريه",
      "كومباني"
    ],
    video: "https://www.youtube.com/embed/V8v8J8v8-placeholder",
    officialLinks: {
      website: "https://www.mancity.com",
      youtube: "https://www.youtube.com/@mancity"
    }
  },

  "manchester-united": {
    name: "مانشستر يونايتد",
    logo: "/teams/premier-league/manchester-united.png",
    league: "premier-league",
    leagueName: "الدوري الإنجليزي الممتاز",
    colorFrom: "#7f1d1d",
    colorTo: "#dc2626",
    accent: "#ef4444",
    description:
      "يعد مانشستر يونايتد من أكثر الأندية شهرة في العالم، ويملك إرثًا كبيرًا في الكرة الإنجليزية والأوروبية.",
    history: [
      "يملك مانشستر يونايتد تاريخًا طويلًا في كرة القدم الإنجليزية، ويعد من أكثر الأندية جماهيرية في العالم.",
      "ارتبط النادي بمرحلة ذهبية كبيرة جعلته من أبرز القوى الكروية في أوروبا.",
      "ولا يزال اليونايتد يحافظ على حضوره الإعلامي والجماهيري الواسع."
    ],
    stadium: "أولد ترافورد",
    city: "مانشستر",
    coach: "المدرب الحالي حسب آخر تحديثات النادي الرسمية",
    titles: [
      "الدوري الإنجليزي",
      "كأس الاتحاد",
      "كأس الرابطة",
      "دوري أبطال أوروبا"
    ],
    players: [
      "اللاعبون الحاليون حسب آخر تحديث رسمي",
      "قائمة الحراس",
      "قائمة الوسط",
      "قائمة الهجوم"
    ],
    legends: [
      "واين روني",
      "إريك كانتونا",
      "رايان غيغز",
      "بول سكولز"
    ],
    video: "https://www.youtube.com/embed/V8v8J8v8-placeholder",
    officialLinks: {
      website: "https://www.manutd.com",
      youtube: "https://www.youtube.com/@manutd"
    }
  },

  "liverpool": {
    name: "ليفربول",
    logo: "/teams/premier-league/liverpool.png",
    league: "premier-league",
    leagueName: "الدوري الإنجليزي الممتاز",
    colorFrom: "#991b1b",
    colorTo: "#ef4444",
    accent: "#dc2626",
    description:
      "يعد ليفربول من أكثر الأندية عراقة في الكرة الإنجليزية، ويملك إرثًا كبيرًا على المستوى المحلي والأوروبي.",
    history: [
      "تأسس ليفربول سنة 1892، ونجح في تكوين واحدة من أكبر القواعد الجماهيرية في العالم.",
      "ارتبط النادي بأجواء أنفيلد وبفترات ذهبية تاريخية داخل إنجلترا وأوروبا.",
      "ولا يزال الفريق حاضرًا بقوة في صدارة مشهد الكرة الإنجليزية."
    ],
    stadium: "أنفيلد",
    city: "ليفربول",
    coach: "المدرب الحالي حسب آخر تحديثات النادي الرسمية",
    titles: [
      "الدوري الإنجليزي",
      "كأس الاتحاد",
      "كأس الرابطة",
      "دوري أبطال أوروبا"
    ],
    players: [
      "محمد صلاح",
      "أليسون",
      "فان دايك",
      "أرنولد",
      "سوبوسلاي",
      "لويس دياز"
    ],
    legends: [
      "ستيفن جيرارد",
      "إيان راش",
      "كيني دالغليش",
      "محمد صلاح"
    ],
    video: "https://www.youtube.com/embed/V8v8J8v8-placeholder",
    officialLinks: {
      website: "https://www.liverpoolfc.com",
      youtube: "https://www.youtube.com/@LiverpoolFC"
    }
  },

  "arsenal": {
    name: "آرسنال",
    logo: "/teams/premier-league/arsenal.png",
    league: "premier-league",
    leagueName: "الدوري الإنجليزي الممتاز",
    colorFrom: "#991b1b",
    colorTo: "#f97316",
    accent: "#ef4444",
    description:
      "آرسنال واحد من الأندية التاريخية في لندن وإنجلترا، ويمتلك قاعدة جماهيرية كبيرة.",
    history: [
      "يعتبر آرسنال من الأندية العريقة في إنجلترا، وارتبط اسمه بتاريخ مهم في العاصمة لندن.",
      "عرف النادي بأسلوب لعب جميل وبقدرته على صناعة أجيال من اللاعبين المميزين.",
      "ولا يزال آرسنال حاضرًا بقوة في المنافسة على المراكز المتقدمة."
    ],
    stadium: "الإمارات",
    city: "لندن",
    coach: "المدرب الحالي حسب آخر تحديثات النادي الرسمية",
    titles: [
      "الدوري الإنجليزي",
      "كأس الاتحاد",
      "الدرع الخيرية"
    ],
    players: [
      "ساكا",
      "أوديغارد",
      "رايس",
      "مارتينيلي",
      "ويليام ساليبا",
      "غابرييل جيسوس"
    ],
    legends: [
      "تييري هنري",
      "دينيس بيركامب",
      "باتريك فييرا",
      "توني آدامز"
    ],
    video: "https://www.youtube.com/embed/V8v8J8v8-placeholder",
    officialLinks: {
      website: "https://www.arsenal.com",
      youtube: "https://www.youtube.com/@arsenal"
    }
  },

  "chelsea": {
    name: "تشيلسي",
    logo: "/teams/premier-league/chelsea.png",
    league: "premier-league",
    leagueName: "الدوري الإنجليزي الممتاز",
    colorFrom: "#1d4ed8",
    colorTo: "#2563eb",
    accent: "#3b82f6",
    description:
      "تشيلسي من أندية القمة في إنجلترا، وقد حقق نجاحات محلية وقارية كبيرة.",
    history: [
      "تأسس تشيلسي سنة 1905، وتمكن من بناء مكانة قوية داخل الكرة الإنجليزية.",
      "شهد النادي مراحل حديثة ناجحة جعلته من أبرز الأندية في أوروبا.",
      "ويحظى البلوز بجماهيرية كبيرة وحضور دائم في سباقات الألقاب."
    ],
    stadium: "ستامفورد بريدج",
    city: "لندن",
    coach: "المدرب الحالي حسب آخر تحديثات النادي الرسمية",
    titles: [
      "الدوري الإنجليزي",
      "كأس الاتحاد",
      "دوري أبطال أوروبا"
    ],
    players: [
      "اللاعبون الحاليون حسب آخر تحديث رسمي",
      "قائمة الدفاع",
      "قائمة الوسط",
      "قائمة الهجوم"
    ],
    legends: [
      "فرانك لامبارد",
      "جون تيري",
      "ديدييه دروغبا",
      "بيتر تشيك"
    ],
    video: "https://www.youtube.com/embed/V8v8J8v8-placeholder",
    officialLinks: {
      website: "https://www.chelseafc.com",
      youtube: "https://www.youtube.com/@chelseafc"
    }
  },

  "tottenham": {
    name: "توتنهام",
    logo: "/teams/premier-league/tottenham.png",
    league: "premier-league",
    leagueName: "الدوري الإنجليزي الممتاز",
    colorFrom: "#0f172a",
    colorTo: "#334155",
    accent: "#475569",
    description:
      "يعد توتنهام من الأندية المعروفة في العاصمة لندن، ويملك حضورًا ثابتًا في الكرة الإنجليزية.",
    history: [
      "تأسس توتنهام سنة 1882، وأصبح مع الوقت من الأندية البارزة في العاصمة البريطانية.",
      "تميز النادي بجماهيره الكبيرة وبسعيه المستمر إلى التواجد بين كبار الدوري.",
      "ويبقى الفريق حاضرًا في النقاشات المرتبطة بالبريميرليغ والمنافسات الأوروبية."
    ],
    stadium: "توتنهام هوتسبير",
    city: "لندن",
    coach: "المدرب الحالي حسب آخر تحديثات النادي الرسمية",
    titles: [
      "كأس الاتحاد",
      "كأس الرابطة",
      "منافسات أوروبية تاريخية"
    ],
    players: [
      "اللاعبون الحاليون حسب آخر تحديث رسمي",
      "قائمة الحراس",
      "قائمة الوسط",
      "قائمة الهجوم"
    ],
    legends: [
      "هاري كين",
      "غاري لينيكر",
      "ليدلي كينغ",
      "لوكا مودريتش"
    ],
    video: "https://www.youtube.com/embed/V8v8J8v8-placeholder",
    officialLinks: {
      website: "https://www.tottenhamhotspur.com",
      youtube: "https://www.youtube.com/@TottenhamHotspur"
    }
  }
};

export function generateStaticParams() {
  return Object.keys(teamsData).map((slug) => ({ slug }));
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
    description: `تعرف على تاريخ ${team.name}، أبرز الألقاب، معلومات الملعب، والملفات الأساسية الخاصة بالنادي.`,
    alternates: {
      canonical: `https://nabdriyadah.com/team/${params.slug}/`
    }
  };
}

export default function TeamPage({ params }) {
  const team = teamsData[params.slug];

  if (!team) {
    return (
      <main style={{ padding: "40px", direction: "rtl" }}>
        <div>الفريق غير موجود</div>
      </main>
    );
  }

  const relatedArticles = articles
    .filter(
      (article) =>
        article.league === team.league &&
        (article.title.includes(team.name) ||
          article.description.includes(team.name) ||
          (article.keywords || []).some((keyword) => keyword.includes(team.name)))
    )
    .slice(0, 6);

  return (
    <main
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "24px",
        direction: "rtl"
      }}
    >
      <section
        style={{
          background: `linear-gradient(135deg, ${team.colorFrom}, ${team.colorTo})`,
          color: "white",
          borderRadius: "28px",
          padding: "36px",
          marginBottom: "24px",
          display: "grid",
          gridTemplateColumns: "160px 1fr",
          gap: "24px",
          alignItems: "center"
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            borderRadius: "24px",
            padding: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <img
            src={team.logo}
            alt={team.name}
            style={{
              width: "120px",
              height: "120px",
              objectFit: "contain"
            }}
          />
        </div>

        <div>
          <Link
            href={team.league === "premier-league" ? "/league/premier-league/" : "/league/la-liga/"}
            style={{
              color: "white",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "14px"
            }}
          >
            العودة إلى صفحة البطولة
          </Link>

          <h1
            style={{
              fontSize: "56px",
              lineHeight: 1.2,
              margin: "14px 0 12px"
            }}
          >
            {team.name}
          </h1>

          <p
            style={{
              fontSize: "20px",
              lineHeight: 1.9,
              margin: 0,
              maxWidth: "900px"
            }}
          >
            {team.description}
          </p>
        </div>
      </section>

      <AdSlot label="مساحة إعلانية أعلى صفحة الفريق" minHeight={90} style={{ marginBottom: 24 }} />

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "18px",
          marginBottom: "24px"
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "22px",
            padding: "22px",
            border: "1px solid #e5e7eb"
          }}
        >
          <div style={{ color: team.accent, fontWeight: 700, marginBottom: "8px" }}>سنة التأسيس</div>
          <div style={{ fontSize: "28px", fontWeight: 800 }}>{team.founded}</div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "22px",
            padding: "22px",
            border: "1px solid #e5e7eb"
          }}
        >
          <div style={{ color: team.accent, fontWeight: 700, marginBottom: "8px" }}>الملعب</div>
          <div style={{ fontSize: "28px", fontWeight: 800 }}>{team.stadium}</div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "22px",
            padding: "22px",
            border: "1px solid #e5e7eb"
          }}
        >
          <div style={{ color: team.accent, fontWeight: 700, marginBottom: "8px" }}>المدينة</div>
          <div style={{ fontSize: "28px", fontWeight: 800 }}>{team.city}</div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "22px",
            padding: "22px",
            border: "1px solid #e5e7eb"
          }}
        >
          <div style={{ color: team.accent, fontWeight: 700, marginBottom: "8px" }}>البطولة</div>
          <div style={{ fontSize: "28px", fontWeight: 800 }}>{team.leagueName}</div>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: "24px",
          marginBottom: "24px"
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "28px",
            padding: "28px",
            border: "1px solid #e5e7eb"
          }}
        >
          <h2
            style={{
              margin: "0 0 18px 0",
              fontSize: "34px",
              fontWeight: 800
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
              background: "white",
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
              background: "white",
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

      <AdSlot label="مساحة إعلانية وسط صفحة الفريق" minHeight={120} style={{ marginBottom: 24 }} />

      <section
        style={{
          background: "white",
          borderRadius: "28px",
          padding: "28px",
          border: "1px solid #e5e7eb",
          marginBottom: "24px"
        }}
      >
        <h2
          style={{
            margin: "0 0 16px 0",
            fontSize: "30px",
            fontWeight: 800
          }}
        >
          اللاعبون الحاليون
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "14px"
          }}
        >
          {team.players.map((player, index) => (
            <div
              key={index}
              style={{
                background: "#f8fafc",
                borderRadius: "18px",
                padding: "18px",
                color: "#111827",
                fontWeight: 700,
                textAlign: "center"
              }}
            >
              {player}
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          background: "white",
          borderRadius: "28px",
          padding: "28px",
          border: "1px solid #e5e7eb",
          marginBottom: "24px"
        }}
      >
        <h2
          style={{
            margin: "0 0 16px 0",
            fontSize: "30px",
            fontWeight: 800
          }}
        >
          أساطير النادي
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "14px"
          }}
        >
          {team.legends.map((legend, index) => (
            <div
              key={index}
              style={{
                background: "#f8fafc",
                borderRadius: "18px",
                padding: "18px",
                color: "#111827",
                fontWeight: 700,
                textAlign: "center"
              }}
            >
              {legend}
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          background: "white",
          borderRadius: "28px",
          padding: "28px",
          border: "1px solid #e5e7eb",
          marginBottom: "24px"
        }}
      >
        <h2
          style={{
            margin: "0 0 18px 0",
            fontSize: "30px",
            fontWeight: 800
          }}
        >
          فيديو رسمي
        </h2>

        <p
          style={{
            margin: "0 0 18px 0",
            color: "#4b5563",
            fontSize: "17px",
            lineHeight: 1.9
          }}
        >
          يمكن لاحقًا استبدال هذا الرابط بفيديو رسمي مباشر من قناة النادي أو من مصدر رسمي موثوق.
        </p>

        <div
          style={{
            borderRadius: "22px",
            overflow: "hidden",
            border: "1px solid #e5e7eb"
          }}
        >
          <iframe
            src={team.video}
            title={`${team.name} video`}
            style={{
              width: "100%",
              height: "460px",
              border: 0,
              display: "block"
            }}
            allowFullScreen
          />
        </div>
      </section>

      <section
        style={{
          background: "white",
          borderRadius: "28px",
          padding: "28px",
          border: "1px solid #e5e7eb",
          marginBottom: "24px"
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
          لإثراء هذه الصفحة بصور وفيديوهات أكثر، يمكن الاعتماد على المواد الرسمية للنادي أو القناة الرسمية عند التوسعة.
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
          background: "white",
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

        {relatedArticles.length === 0 ? (
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
            {relatedArticles.map((item) => (
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
    </main>
  );
}
