/**
 * lib/i18n.js — Nabdriyadah Translations
 * Supports: ar (Arabic, RTL), fr (French, LTR), en (English, LTR)
 */

export const locales = ["ar", "fr", "en"];
export const defaultLocale = "ar";

export const dir = { ar: "rtl", fr: "ltr", en: "ltr" };

export const siteName = {
  ar: "نبض الرياضة",
  fr: "Sports Pulse",
  en: "Sports Pulse",
};

export const siteDescription = {
  ar: "موقع عربي للأخبار الرياضية يقدم تغطية يومية لكرة القدم، كرة السلة، التنس والبادل.",
  fr: "Site arabophone d'actualités sportives : football, basketball, tennis et padel, mis à jour chaque jour.",
  en: "Arabic sports news site covering football, basketball, tennis and padel with daily updates.",
};

/** All UI translation strings */
export const t = {
  ar: {
    // Nav
    football: "كرة القدم",
    basketball: "كرة السلة",
    tennis: "التنس",
    padel: "البادل",
    futsal: "الصالات",
    leagues: "الدوريات",
    teams: "الفرق",
    live: "مباشر",
    // Common
    readMore: "اقرأ المزيد",
    backHome: "العودة إلى الرئيسية",
    updatedAt: "آخر تحديث",
    loading: "جارٍ التحميل...",
    notFound: "الصفحة غير موجودة",
    // Homepage
    latestNews: "آخر الأخبار",
    featuredArticle: "المقال الرئيسي",
    moreNews: "أخبار أخرى",
    sportsCategories: "أقسام الرياضة",
    // Team page
    teamHistory: "تاريخ الفريق",
    teamTitles: "الألقاب والبطولات",
    teamStadium: "الملعب",
    teamCoach: "المدرب",
    teamPlayers: "اللاعبون",
    teamLegends: "الأساطير",
    teamFixtures: "جدول المباريات",
    teamVideos: "فيديوهات الفريق",
    teamArticles: "مقالات حول الفريق",
    upcomingMatches: "المقبلة",
    pastResults: "النتائج",
    season: "الموسم",
    homeGame: "🏠 دار",
    awayGame: "✈ خارج",
    noUpcoming: "لا توجد مباريات مجدولة حالياً",
    noPast: "لا توجد نتائج لهذا الموسم",
    autoUpdate: "سيتم التحديث تلقائياً",
    // League page
    leagueStandings: "جدول الترتيب",
    rank: "الترتيب",
    played: "لعب",
    won: "فاز",
    drawn: "تعادل",
    lost: "خسر",
    gf: "أهداف",
    ga: "تلقى",
    gd: "الفارق",
    points: "النقاط",
    leagueTeams: "أندية الدوري",
    leagueArticles: "أحدث الأخبار",
    // Article
    publishedOn: "نُشر في",
    minuteRead: "دقيقة قراءة",
    relatedArticles: "مقالات ذات صلة",
    // Footer
    allRightsReserved: "جميع الحقوق محفوظة",
  },

  fr: {
    // Nav
    football: "Football",
    basketball: "Basketball",
    tennis: "Tennis",
    padel: "Padel",
    futsal: "Futsal",
    leagues: "Ligues",
    teams: "Équipes",
    live: "En direct",
    // Common
    readMore: "Lire la suite",
    backHome: "Retour à l'accueil",
    updatedAt: "Mis à jour le",
    loading: "Chargement...",
    notFound: "Page introuvable",
    // Homepage
    latestNews: "Dernières actualités",
    featuredArticle: "À la une",
    moreNews: "Plus d'actualités",
    sportsCategories: "Catégories sportives",
    // Team page
    teamHistory: "Histoire du club",
    teamTitles: "Palmarès",
    teamStadium: "Stade",
    teamCoach: "Entraîneur",
    teamPlayers: "Joueurs",
    teamLegends: "Légendes",
    teamFixtures: "Calendrier des matchs",
    teamVideos: "Vidéos du club",
    teamArticles: "Articles sur le club",
    upcomingMatches: "À venir",
    pastResults: "Résultats",
    season: "Saison",
    homeGame: "🏠 Domicile",
    awayGame: "✈ Extérieur",
    noUpcoming: "Aucun match programmé pour le moment",
    noPast: "Aucun résultat pour cette saison",
    autoUpdate: "Mise à jour automatique",
    // League page
    leagueStandings: "Classement",
    rank: "Rang",
    played: "Joués",
    won: "Gagnés",
    drawn: "Nuls",
    lost: "Perdus",
    gf: "BP",
    ga: "BC",
    gd: "Diff.",
    points: "Pts",
    leagueTeams: "Clubs de la ligue",
    leagueArticles: "Dernières actualités",
    // Article
    publishedOn: "Publié le",
    minuteRead: "min de lecture",
    relatedArticles: "Articles similaires",
    // Footer
    allRightsReserved: "Tous droits réservés",
  },

  en: {
    // Nav
    football: "Football",
    basketball: "Basketball",
    tennis: "Tennis",
    padel: "Padel",
    futsal: "Futsal",
    leagues: "Leagues",
    teams: "Teams",
    live: "Live",
    // Common
    readMore: "Read more",
    backHome: "Back to home",
    updatedAt: "Updated",
    loading: "Loading...",
    notFound: "Page not found",
    // Homepage
    latestNews: "Latest news",
    featuredArticle: "Featured",
    moreNews: "More news",
    sportsCategories: "Sports categories",
    // Team page
    teamHistory: "Club history",
    teamTitles: "Honours",
    teamStadium: "Stadium",
    teamCoach: "Manager",
    teamPlayers: "Players",
    teamLegends: "Legends",
    teamFixtures: "Fixtures & results",
    teamVideos: "Team videos",
    teamArticles: "Articles about this club",
    upcomingMatches: "Upcoming",
    pastResults: "Results",
    season: "Season",
    homeGame: "🏠 Home",
    awayGame: "✈ Away",
    noUpcoming: "No upcoming fixtures",
    noPast: "No results for this season",
    autoUpdate: "Updates automatically",
    // League page
    leagueStandings: "Standings",
    rank: "Pos",
    played: "P",
    won: "W",
    drawn: "D",
    lost: "L",
    gf: "GF",
    ga: "GA",
    gd: "GD",
    points: "Pts",
    leagueTeams: "League clubs",
    leagueArticles: "Latest news",
    // Article
    publishedOn: "Published on",
    minuteRead: "min read",
    relatedArticles: "Related articles",
    // Footer
    allRightsReserved: "All rights reserved",
  },
};

/** Get translations for a locale, falls back to Arabic */
export function getT(lang = "ar") {
  return t[lang] || t.ar;
}

/** League names in each language */
export const leagueNames = {
  "premier-league": { ar: "الدوري الإنجليزي الممتاز", fr: "Premier League", en: "Premier League" },
  "la-liga":        { ar: "الدوري الإسباني",          fr: "La Liga",        en: "La Liga" },
  "bundesliga":     { ar: "البوندسليغا",               fr: "Bundesliga",     en: "Bundesliga" },
  "serie-a":        { ar: "الدوري الإيطالي",           fr: "Serie A",        en: "Serie A" },
  "ligue-1":        { ar: "الدوري الفرنسي",            fr: "Ligue 1",        en: "Ligue 1" },
  "champions-league":{ ar: "دوري أبطال أوروبا",       fr: "Ligue des Champions", en: "Champions League" },
  "saudi-pro-league":{ ar: "الدوري السعودي",          fr: "Saudi Pro League", en: "Saudi Pro League" },
  "eredivisie":     { ar: "الدوري الهولندي",           fr: "Eredivisie",     en: "Eredivisie" },
  "mls":            { ar: "الدوري الأمريكي",           fr: "MLS",            en: "MLS" },
  "liga-portugal":  { ar: "الدوري البرتغالي",          fr: "Liga Portugal",  en: "Liga Portugal" },
  "botola":         { ar: "البطولة الاحترافية المغربية", fr: "Botola Pro",   en: "Botola Pro" },
};

/** Sport names in each language */
export const sportNames = {
  football:   { ar: "كرة القدم",      fr: "Football",    en: "Football" },
  basketball: { ar: "كرة السلة",      fr: "Basketball",  en: "Basketball" },
  tennis:     { ar: "التنس",          fr: "Tennis",      en: "Tennis" },
  padel:      { ar: "البادل",         fr: "Padel",       en: "Padel" },
  futsal:     { ar: "كرة قدم الصالات", fr: "Futsal",     en: "Futsal" },
};

/** Navigation links with multilingual labels */
export function getNavLinks(lang = "ar") {
  const tr = getT(lang);
  const prefix = lang === "ar" ? "" : `/${lang}`;
  return [
    { emoji: "⚽", label: tr.football,   href: `${prefix}/sport/football/` },
    { emoji: "🏀", label: tr.basketball, href: `${prefix}/sport/basketball/` },
    { emoji: "🎾", label: tr.tennis,     href: `${prefix}/sport/tennis/` },
    { emoji: "🏸", label: tr.padel,      href: `${prefix}/sport/padel/` },
    { emoji: "🥅", label: tr.futsal,     href: `${prefix}/sport/futsal/` },
  ];
}

/** Language switcher links — maps current path to equivalent in other langs */
export function getLangSwitcherLinks(currentPath = "/", currentLang = "ar") {
  // Strip language prefix
  let basePath = currentPath;
  if (basePath.startsWith("/en")) basePath = basePath.slice(3) || "/";
  if (basePath.startsWith("/fr")) basePath = basePath.slice(3) || "/";

  return [
    { lang: "ar", label: "العربية", flag: "🇸🇦", href: basePath || "/" },
    { lang: "fr", label: "Français", flag: "🇫🇷", href: `/fr${basePath === "/" ? "" : basePath}` },
    { lang: "en", label: "English",  flag: "🇬🇧", href: `/en${basePath === "/" ? "" : basePath}` },
  ];
}
