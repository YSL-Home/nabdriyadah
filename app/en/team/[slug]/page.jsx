import teamsDataRaw from "../../../../content/teams-data.json";
import LocalizedTeamPage from "../../../components/LocalizedTeamPage";

export function generateStaticParams() {
  return Object.keys(teamsDataRaw).map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const team = teamsDataRaw[params.slug];
  if (!team) return { title: "Team not found" };
  return {
    title: `${team.name} — History, Honours & Fixtures | Sports Pulse`,
    description: `Everything about ${team.name}: history, trophies, stadium, squad and fixtures. Exclusive coverage on Sports Pulse.`,
    alternates: { canonical: `https://nabdriyadah.com/en/team/${params.slug}/` },
    openGraph: {
      title: `${team.name} | Sports Pulse`,
      url: `https://nabdriyadah.com/en/team/${params.slug}/`,
      locale: "en_US"
    }
  };
}

export default function EnTeamPage({ params }) {
  return <LocalizedTeamPage slug={params.slug} lang="en" />;
}
