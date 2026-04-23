import Image from "next/image";

const teamsData = {
  "real-madrid": {
    name: "ريال مدريد",
    logo: "/teams/la-liga/real-madrid.png",
    color: "from-gray-800 to-gray-600",

    description:
      "يُعد ريال مدريد من أعظم الأندية في تاريخ كرة القدم، حيث حقق نجاحات كبيرة على المستوى المحلي والأوروبي.",

    history: `
تأسس نادي ريال مدريد سنة 1902، ويُعتبر من أكثر الأندية تتويجًا بالألقاب في العالم.
حقق الفريق نجاحات كبيرة في دوري أبطال أوروبا وأصبح رمزًا عالميًا لكرة القدم.
    `,

    stadium: "سانتياغو برنابيو",
    coach: "كارلو أنشيلوتي",

    titles: [
      "الدوري الإسباني",
      "دوري أبطال أوروبا",
      "كأس ملك إسبانيا",
      "كأس العالم للأندية",
    ],

    players: [
      "فينيسيوس جونيور",
      "جود بيلينغهام",
      "لوكا مودريتش",
      "توني كروس",
      "رودريغو",
      "كامافينغا",
    ],

    legends: [
      "كريستيانو رونالدو",
      "زين الدين زيدان",
      "راؤول",
      "كاسياس",
    ],

    video: "https://www.youtube.com/embed/3GwjfUFyY6M",
  },
};

export default function TeamPage({ params }) {
  const team = teamsData[params.slug];

  if (!team) return <div className="p-10">Team not found</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* HERO */}
      <div
        className={`bg-gradient-to-r ${team.color} text-white p-10 rounded-3xl mb-10`}
      >
        <div className="flex items-center gap-6">
          <img src={team.logo} className="w-20 h-20" />
          <div>
            <h1 className="text-4xl font-bold">{team.name}</h1>
            <p className="opacity-80 mt-2">{team.description}</p>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* MAIN */}
        <div className="md:col-span-2 space-y-6">

          {/* HISTORY */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-4">تاريخ النادي</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {team.history}
            </p>
          </div>

          {/* PLAYERS */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-4">اللاعبون الحاليون</h2>
            <div className="grid grid-cols-2 gap-2">
              {team.players.map((p) => (
                <div key={p} className="bg-gray-100 p-2 rounded">
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* LEGENDS */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-4">أساطير النادي</h2>
            <div className="grid grid-cols-2 gap-2">
              {team.legends.map((p) => (
                <div key={p} className="bg-gray-100 p-2 rounded">
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* VIDEO */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-4">فيديو رسمي</h2>
            <iframe
              className="w-full h-[400px] rounded-xl"
              src={team.video}
              title="team video"
              allowFullScreen
            />
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">

          {/* INFO */}
          <div className="bg-white p-6
