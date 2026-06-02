import LocalizedHomePage from "../components/LocalizedHomePage";

export const metadata = {
  title: "Sports Pulse — Actualité Sportive Arabe",
  description: "Suivez l'actualité sportive arabe : Ligue des Champions, Premier League, NBA et plus — couverture quotidienne et analyses exclusives sur Sports Pulse.",
  alternates: { canonical: "https://nabdriyadah.com/fr/" }
};

export default function FrHomePage() {
  return <LocalizedHomePage lang="fr" />;
}
