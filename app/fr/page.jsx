import LocalizedHomePage from "../components/LocalizedHomePage";

export const metadata = {
  title: "Sports Pulse — Football, Basketball & Tennis Actualités",
  description: "Suivez les dernières actualités football, basketball, tennis et padel avec une couverture quotidienne sur Sports Pulse.",
  alternates: { canonical: "https://nabdriyadah.com/fr/" }
};

export default function FrHomePage() {
  return <LocalizedHomePage lang="fr" />;
}
