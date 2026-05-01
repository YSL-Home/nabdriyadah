import teamsDataRaw from "../../../../content/teams-data.json";
import LocalizedTeamPage from "../../../components/LocalizedTeamPage";

export function generateStaticParams() {
  return Object.keys(teamsDataRaw).map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const team = teamsDataRaw[params.slug];
  if (!team) return { title: "Équipe introuvable" };
  return {
    title: `${team.name} — Histoire, Palmarès & Matchs | Sports Pulse`,
    description: `Tout sur ${team.name} : histoire, palmarès, stade, joueurs et calendrier des matchs. Couverture exclusive sur Sports Pulse.`,
    alternates: { canonical: `https://nabdriyadah.com/fr/team/${params.slug}/` },
    openGraph: {
      title: `${team.name} | Sports Pulse`,
      url: `https://nabdriyadah.com/fr/team/${params.slug}/`,
      locale: "fr_FR"
    }
  };
}

export default function FrTeamPage({ params }) {
  return <LocalizedTeamPage slug={params.slug} lang="fr" />;
}
