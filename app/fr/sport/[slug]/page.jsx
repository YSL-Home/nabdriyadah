import { notFound } from "next/navigation";
import LocalizedSportPage from "../../../components/LocalizedSportPage";

const validSports = ["football", "basketball", "tennis", "padel", "futsal"];

export function generateStaticParams() {
  return validSports.map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const titles = {
    football:   "Football — Championnats, Équipes & Actualités",
    basketball: "Basketball — NBA & Actus mondiales",
    tennis:     "Tennis — Grand Chelems & Classements",
    padel:      "Padel — World Tour & Résultats",
    futsal:     "Futsal — Compétitions & Résultats",
  };
  const descs = {
    football:   "Toute l'actualité des grands championnats de football, transferts et analyses sur Sports Pulse.",
    basketball: "Dernières actus NBA et basketball mondial, résultats et meilleurs joueurs sur Sports Pulse.",
    tennis:     "Couverture des Grand Chelems, classements ATP/WTA et actualités tennis sur Sports Pulse.",
    padel:      "Actus padel mondial, grandes compétitions et meilleurs joueurs sur Sports Pulse.",
    futsal:     "Dernières actus futsal et football en salle, compétitions et résultats sur Sports Pulse.",
  };
  if (!validSports.includes(params.slug)) return { title: "Introuvable" };
  return {
    title: `${titles[params.slug]} | Sports Pulse`,
    description: descs[params.slug],
    alternates: { canonical: `https://nabdriyadah.com/fr/sport/${params.slug}/` },
    openGraph: {
      title: titles[params.slug],
      description: descs[params.slug],
      url: `https://nabdriyadah.com/fr/sport/${params.slug}/`,
      locale: "fr_FR",
      type: "website",
    },
  };
}

export default function FrSportPage({ params }) {
  if (!validSports.includes(params.slug)) return notFound();
  return <LocalizedSportPage slug={params.slug} lang="fr" />;
}
