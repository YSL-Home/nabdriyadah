import fs from "fs";
import path from "path";

// English names for TheSportsDB lookup — keyed by teamSlug
// Arrays: [players, legends] (same order as teamsData in page.jsx)
const PLAYER_EN = {
  "manchester-city": {
    players: ["Erling Haaland", "Kevin De Bruyne", "Phil Foden", "Bernardo Silva", "Rodri", "Ruben Dias"],
    legends: ["Sergio Aguero", "David Silva", "Vincent Kompany", "Yaya Toure"],
  },
  "manchester-united": {
    players: ["Bruno Fernandes", "Marcus Rashford", "Casemiro", "Andre Onana", "Lisandro Martinez", "Rasmus Hojlund"],
    legends: ["Ryan Giggs", "Paul Scholes", "Wayne Rooney", "Eric Cantona"],
  },
  "liverpool": {
    players: ["Mohamed Salah", "Virgil van Dijk", "Alisson Becker", "Trent Alexander-Arnold", "Alexis Mac Allister", "Darwin Nunez"],
    legends: ["Steven Gerrard", "Kenny Dalglish", "Ian Rush", "Jamie Carragher"],
  },
  "arsenal": {
    players: ["Bukayo Saka", "Martin Odegaard", "Declan Rice", "William Saliba", "Gabriel Jesus", "Kai Havertz"],
    legends: ["Thierry Henry", "Dennis Bergkamp", "Patrick Vieira", "Tony Adams"],
  },
  "chelsea": {
    players: ["Enzo Fernandez", "Cole Palmer", "Reece James", "Raheem Sterling", "Moises Caicedo", "Nicolas Jackson"],
    legends: ["Frank Lampard", "John Terry", "Didier Drogba", "Petr Cech"],
  },
  "tottenham": {
    players: ["Son Heung-min", "James Maddison", "Dejan Kulusevski", "Cristian Romero", "Richarlison", "Pedro Porro"],
    legends: ["Harry Kane", "Gary Lineker", "Glenn Hoddle", "Ledley King"],
  },
  "real-madrid": {
    players: ["Jude Bellingham", "Vinicius Junior", "Rodrygo", "Federico Valverde", "Aurelien Tchouameni", "Eduardo Camavinga"],
    legends: ["Cristiano Ronaldo", "Zinedine Zidane", "Raul", "Iker Casillas"],
  },
  "barcelona": {
    players: ["Robert Lewandowski", "Pedri", "Gavi", "Raphinha", "Jules Kounde", "Frenkie de Jong"],
    legends: ["Lionel Messi", "Xavi", "Andres Iniesta", "Carles Puyol"],
  },
  "atletico-madrid": {
    players: ["Antoine Griezmann", "Koke", "Jan Oblak", "Marcos Llorente", "Alvaro Morata", "Jose Gimenez"],
    legends: ["Fernando Torres", "Diego Godin", "Gabi", "Luis Aragones"],
  },
  "sevilla": {
    players: ["Sergio Ramos", "Jesus Navas", "Youssef En-Nesyri", "Lucas Ocampos", "Suso", "Loic Bade"],
    legends: ["Jesus Navas", "Frederic Kanoute", "Dani Alves", "Ivan Rakitic"],
  },
  "valencia": {
    players: ["Jose Gaya", "Hugo Duro", "Andre Almeida", "Diego Lopez"],
    legends: ["David Villa", "Santiago Canizares", "Pablo Aimar", "Roberto Ayala"],
  },
  "real-sociedad": {
    players: ["Mikel Oyarzabal", "Takefusa Kubo", "Mikel Merino", "Martin Zubimendi", "Aihen Munoz", "Alex Remiro"],
    legends: ["Xabi Alonso", "Nihat Kahveci"],
  },
  "bayern-munich": {
    players: ["Harry Kane", "Manuel Neuer", "Joshua Kimmich", "Leon Goretzka", "Jamal Musiala", "Leroy Sane"],
    legends: ["Gerd Muller", "Franz Beckenbauer", "Karl-Heinz Rummenigge", "Oliver Kahn"],
  },
  "borussia-dortmund": {
    players: ["Gregor Kobel", "Niclas Fullkrug", "Marcel Sabitzer", "Julian Ryerson"],
    legends: ["Michael Zorc", "Marcio Amoroso", "Robert Lewandowski", "Mats Hummels"],
  },
  "bayer-leverkusen": {
    players: ["Granit Xhaka", "Florian Wirtz", "Victor Boniface", "Jonathan Tah"],
    legends: ["Michael Ballack", "Lothar Matthaus"],
  },
  "rb-leipzig": {
    players: ["Benjamin Sesko", "David Raum", "Xavi Simons", "Yussuf Poulsen"],
    legends: ["Timo Werner", "Marcel Halstenberg", "Naby Keita"],
  },
  "eintracht-frankfurt": {
    players: ["Kevin Trapp", "Hugo Ekitike"],
    legends: ["Anthony Yeboah"],
  },
  "borussia-monchengladbach": {
    players: ["Lars Stindl", "Florian Neuhaus", "Jonas Omlin"],
    legends: ["Jupp Heynckes", "Allan Simonsen"],
  },
  "juventus": {
    players: ["Filip Kostic", "Adrien Rabiot", "Federico Chiesa"],
    legends: ["Michel Platini", "Roberto Baggio", "Alessandro Del Piero", "Gianluigi Buffon"],
  },
  "ac-milan": {
    players: ["Mike Maignan", "Theo Hernandez", "Rafael Leao"],
    legends: ["Paolo Maldini", "Ronaldo Nazario", "Andrea Pirlo"],
  },
  "inter-milan": {
    players: ["Lautaro Martinez", "Nicolo Barella", "Henrikh Mkhitaryan", "Marcus Thuram"],
    legends: ["Ronaldo Nazario", "Javier Zanetti", "Hernan Crespo", "Christian Vieri"],
  },
  "as-roma": {
    players: ["Paulo Dybala", "Lorenzo Pellegrini", "Romelu Lukaku"],
    legends: ["Francesco Totti", "Gabriel Batistuta", "Daniele De Rossi"],
  },
  "napoli": {
    players: ["Victor Osimhen", "Khvicha Kvaratskhelia", "Piotr Zielinski", "Giovanni Di Lorenzo"],
    legends: ["Diego Maradona", "Ciro Ferrara", "Dino Zoff"],
  },
  "lazio": {
    players: ["Ciro Immobile", "Luis Alberto", "Felipe Anderson"],
    legends: ["Pavel Nedved", "Juan Sebastian Veron", "Alessandro Nesta"],
  },
  "fiorentina": {
    players: ["Nicolas Gonzalez", "Sofyan Amrabat", "Giacomo Bonaventura"],
    legends: ["Gabriel Batistuta", "Rui Costa", "Giancarlo Antognoni"],
  },
  "psg": {
    players: ["Kylian Mbappe", "Neymar", "Marco Asensio", "Gianluigi Donnarumma", "Marquinhos", "Ousmane Dembele"],
    legends: ["Zlatan Ibrahimovic", "Ronaldinho", "David Ginola"],
  },
  "olympique-marseille": {
    players: ["Pierre-Emerick Aubameyang", "Iliman Ndiaye", "Jordan Veretout"],
    legends: ["Didier Drogba", "Chris Waddle", "Jean-Pierre Papin"],
  },
  "olympique-lyonnais": {
    players: ["Alexandre Lacazette", "Nicolas Tagliafico"],
    legends: ["Juninho", "Karim Benzema", "Sidney Govou"],
  },
  "monaco": {
    players: ["Wissam Ben Yedder", "Aleksandr Golovin"],
    legends: ["Thierry Henry", "George Weah", "Jurgen Klinsmann"],
  },
  "lille": {
    players: ["Jonathan David", "Remy Cabella"],
    legends: ["Luiz Adriano", "Eden Hazard"],
  },
  "nice": {
    players: ["Terem Moffi", "Khephren Thuram"],
    legends: ["Franck Ribery"],
  },
  "ajax": {
    players: ["Steven Berghuis", "Dusan Tadic", "Jordan Henderson"],
    legends: ["Johan Cruyff", "Marco van Basten", "Dennis Bergkamp"],
  },
  "psv-eindhoven": {
    players: ["Luuk de Jong", "Xavi Simons"],
    legends: ["Ruud Gullit", "Ronaldo Nazario", "Arjen Robben"],
  },
  "feyenoord": {
    players: ["Santiago Gimenez", "Calvin Stengs"],
    legends: ["Dirk Kuyt", "Robin van Persie"],
  },
  "al-hilal": {
    players: ["Neymar", "Aleksandar Mitrovic", "Ruben Neves", "Kalidou Koulibaly", "Sergej Milinkovic-Savic", "Salem Al-Dawsari"],
    legends: ["Sami Al-Jaber", "Yasser Al-Qahtani"],
  },
  "al-nassr": {
    players: ["Cristiano Ronaldo", "Sadio Mane", "Marcelo Brozovic", "Aymeric Laporte", "Seko Fofana", "Anderson Talisca"],
    legends: ["Ahmed Jamil", "Mohammed Al-Deayea"],
  },
  "al-ittihad": {
    players: ["Karim Benzema", "N'Golo Kante", "Fabinho", "Jota", "Romarinho", "Ahmed Al-Ghamdi"],
    legends: ["Marzouq Al-Otaibi", "Abdullah Al-Jabir"],
  },
  "al-ahli": {
    players: ["Roberto Firmino", "Riyad Mahrez", "Allan Saint-Maximin", "Edouard Mendy", "Franck Kessie", "Roger Ibanez"],
    legends: ["Hossam Hassan"],
  },
};

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function searchPlayer(name) {
  const encoded = encodeURIComponent(name);
  const url = `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encoded}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "nabdriyadah-bot/1.0" } });
    if (!res.ok) return null;
    const data = await res.json();
    const players = data.player;
    if (!players || players.length === 0) return null;
    const p = players[0];
    return p.strThumb || p.strCutout || null;
  } catch {
    return null;
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const outPath = path.join(process.cwd(), "content", "player-photos.json");
  let existing = {};
  try { existing = JSON.parse(fs.readFileSync(outPath, "utf-8")); } catch {}

  const result = { ...existing };
  let updated = 0;

  for (const [teamSlug, { players, legends }] of Object.entries(PLAYER_EN)) {
    // Keys use numeric index so page.jsx can look up by teamSlug/player/0 etc.
    const allNames = [
      ...players.map((n, i) => ({ key: `${teamSlug}/player/${i}`, name: n })),
      ...legends.map((n, i) => ({ key: `${teamSlug}/legend/${i}`, name: n })),
    ];

    for (let idx = 0; idx < allNames.length; idx++) {
      const { key, name } = allNames[idx];
      if (result[key] !== undefined) continue; // already fetched (null or url)
      const photoUrl = await searchPlayer(name);
      result[key] = photoUrl || null;
      if (photoUrl) updated++;
      console.log(`[${key}] → ${photoUrl ? "✓" : "✗"}`);
      await sleep(400);
    }
  }

  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(`\nDone. ${updated} new photos added. Total keys: ${Object.keys(result).length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
