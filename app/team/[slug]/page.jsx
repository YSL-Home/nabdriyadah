import Image from "next/image";

const teamsData = {
  "real-madrid": {
    name: "ريال مدريد",
    logo: "/teams/la-liga/real-madrid.png",
    description:
      "ريال مدريد هو أحد أعظم أندية كرة القدم في تاريخ اللعبة، تأسس سنة 1902 ويملك سجلاً حافلاً بالألقاب.",
    players: [
      "فينيسيوس جونيور",
      "جود بيلينغهام",
      "لوكا مودريتش",
      "توني كروس",
      "رودريغو"
    ],
    staff: ["كارلو أنشيلوتي"],
    titles: ["دوري أبطال أوروبا", "الدوري الإسباني", "كأس الملك"]
  },

  "barcelona": {
    name: "برشلونة",
    logo: "/teams/la-liga/barcelona.png",
    description:
      "نادي برشلونة هو رمز كرة القدم الجميلة، تأسس عام 1899 ويتميز بأسلوبه الهجومي.",
    players: ["ليفاندوفسكي", "بيدري", "غافي", "رافينيا"],
    staff: ["تشافي"],
    titles: ["الدوري الإسباني", "دوري أبطال أوروبا"]
  }
};

export default function TeamPage({ params }) {
  const team = teamsData[params.slug];

  if (!team) {
    return <div style={{ padding: 40 }}>الفريق غير موجود</div>;
  }

  return (
    <div style={{ padding: "40px", direction: "rtl" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Image src={team.logo} alt={team.name} width={80} height={80} />
        <h1>{team.name}</h1>
      </div>

      {/* DESCRIPTION */}
      <p style={{ marginTop: 20 }}>{team.description}</p>

      {/* PLAYERS */}
      <section style={{ marginTop: 40 }}>
        <h2>اللاعبون</h2>
        <ul>
          {(team.players || []).map((player, i) => (
            <li key={i}>{player}</li>
          ))}
        </ul>
      </section>

      {/* STAFF */}
      <section style={{ marginTop: 40 }}>
        <h2>الجهاز الفني</h2>
        <ul>
          {(team.staff || []).map((member, i) => (
            <li key={i}>{member}</li>
          ))}
        </ul>
      </section>

      {/* TITLES */}
      <section style={{ marginTop: 40 }}>
        <h2>الألقاب</h2>
        <ul>
          {(team.titles || []).map((title, i) => (
            <li key={i}>{title}</li>
          ))}
        </ul>
      </section>

    </div>
  );
}
