import { notFound } from "next/navigation";
import LocalizedSportPage from "../../../components/LocalizedSportPage";

const validSports = ["football", "basketball", "tennis", "padel", "futsal"];

export function generateStaticParams() {
  return validSports.map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const titles = {
    football:   "Football — Leagues, Teams & News",
    basketball: "Basketball — NBA & World News",
    tennis:     "Tennis — Grand Slams & Rankings",
    padel:      "Padel — World Tour & Results",
    futsal:     "Futsal — Tournaments & Results",
  };
  const descs = {
    football:   "Full coverage of the world's biggest football leagues, transfers and analysis on Sports Pulse.",
    basketball: "Latest NBA and world basketball news, results and top players on Sports Pulse.",
    tennis:     "Grand Slam coverage, ATP/WTA rankings and top tennis news on Sports Pulse.",
    padel:      "World padel news, major tournaments and top players on Sports Pulse.",
    futsal:     "Latest futsal and indoor football news, tournaments and match results on Sports Pulse.",
  };
  if (!validSports.includes(params.slug)) return { title: "Not found" };
  return {
    title: `${titles[params.slug]} | Sports Pulse`,
    description: descs[params.slug],
    alternates: { canonical: `https://nabdriyadah.com/en/sport/${params.slug}/` },
    openGraph: {
      title: titles[params.slug],
      description: descs[params.slug],
      url: `https://nabdriyadah.com/en/sport/${params.slug}/`,
      locale: "en_US",
      type: "website",
    },
  };
}

export default function EnSportPage({ params }) {
  if (!validSports.includes(params.slug)) return notFound();
  return <LocalizedSportPage slug={params.slug} lang="en" />;
}
