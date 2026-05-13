import Link from "next/link";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export const metadata = {
  title: "فيديوهات كاريكاتورية | نبض الرياضة",
  description: "أبرز الفيديوهات الكاريكاتورية الساخرة عن أحداث كرة القدم — تصميم حركي احترافي",
};

const SPORT_LABEL = {
  football: "كرة القدم", basketball: "كرة السلة",
  tennis: "التنس", padel: "البادل", futsal: "كرة الصالات",
};
const SPORT_COLOR = {
  football: "#16a34a", basketball: "#ea580c",
  tennis: "#ca8a04", padel: "#0891b2", futsal: "#7c3aed",
};

function getVideos() {
  try {
    const indexPath = join(process.cwd(), "content", "cartoon-videos-index.json");
    if (existsSync(indexPath)) {
      return JSON.parse(readFileSync(indexPath, "utf-8"));
    }
  } catch {}
  return [];
}

export default function VideosPage() {
  const videos = getVideos();

  return (
    <main dir="rtl" className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] px-4 py-10 text-center bg-[var(--color-surface)]">
        <div className="text-4xl mb-3">🎬</div>
        <h1 className="text-3xl font-black mb-2">فيديوهات كاريكاتورية</h1>
        <p className="text-[var(--color-subtext)] text-sm max-w-lg mx-auto">
          تصميم حركي ساخر لأبرز أحداث الملاعب — يُنشر تلقائياً يومياً
        </p>
        <div className="flex gap-2 justify-center mt-4 flex-wrap">
          {["Instagram", "TikTok", "Facebook", "YouTube Shorts"].map((p) => (
            <span key={p} className="text-xs px-3 py-1 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-subtext)]">
              {p}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {videos.length === 0 ? (
          <div className="text-center py-24 text-[var(--color-subtext)]">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-xl font-bold mb-2">أول فيديو في الطريق...</p>
            <p className="text-sm">يُولَّد تلقائياً عند كل خبر رياضي جديد</p>
            <div className="mt-8 inline-flex items-center gap-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
              Pipeline actif · Gemini → Leonardo → Kling → FFmpeg
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-[var(--color-subtext)] mb-6">{videos.length} فيديو متاح</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {videos.map((v) => <VideoCard key={v.slug} video={v} />)}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function VideoCard({ video }) {
  const color = SPORT_COLOR[video.sport] || "#6b7280";
  const label = SPORT_LABEL[video.sport] || video.sport;

  return (
    <div className="group rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
      <div className="relative aspect-[9/16] bg-gray-100 overflow-hidden">
        {video.thumb ? (
          <img src={video.thumb} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🎬</div>
        )}
        <a href={video.videoPath} download className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </a>
        <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: color }}>{label}</span>
        {video.isDemo && <span className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">DEMO</span>}
      </div>
      <div className="p-3">
        <Link href={`/articles/${video.slug}/`}>
          <h2 className="text-[11px] font-bold leading-tight line-clamp-3 hover:text-blue-600 transition-colors">{video.title}</h2>
        </Link>
        <p className="text-[10px] text-[var(--color-subtext)] mt-1">
          {video.publishedAt ? new Date(video.publishedAt).toLocaleDateString("ar-MA", { day: "numeric", month: "short" }) : ""}
        </p>
      </div>
    </div>
  );
}
