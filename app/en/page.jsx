import LocalizedHomePage from "../components/LocalizedHomePage";

export const metadata = {
  title: "Sports Pulse — Football, Basketball & Tennis News",
  description: "Follow the latest football, basketball, tennis and padel news with daily coverage and exclusive analysis on Sports Pulse.",
  alternates: { canonical: "https://nabdriyadah.com/en/" }
};

export default function EnHomePage() {
  return <LocalizedHomePage lang="en" />;
}
