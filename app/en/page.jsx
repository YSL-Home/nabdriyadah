import LocalizedHomePage from "../components/LocalizedHomePage";

export const metadata = {
  title: "Sports Pulse — Arabic Sports News",
  description: "Follow the latest Arabic sports news: Champions League, Premier League, La Liga, NBA and more — daily coverage and exclusive analysis on Sports Pulse.",
  alternates: { canonical: "https://nabdriyadah.com/en/" }
};

export default function EnHomePage() {
  return <LocalizedHomePage lang="en" />;
}
