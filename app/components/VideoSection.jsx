"use client";
import { useState, useCallback } from "react";

/** A single video card with thumbnail-first → iframe on click */
function VideoCard({ videoId, teamName, index, accent, onFail }) {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed]   = useState(false);

  const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  const handleFail = useCallback(() => {
    if (!failed) { setFailed(true); onFail?.(); }
  }, [failed, onFail]);

  if (failed) return null;

  return (
    <div style={{
      position: "relative", borderRadius: "16px", overflow: "hidden",
      background: "var(--bg-soft)", aspectRatio: "16/9",
      border: "1px solid var(--border)"
    }}>
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={`${teamName} — فيديو ${index + 1}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
        />
      ) : (
        <button
          onClick={() => setPlaying(true)}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            border: "none", padding: 0, cursor: "pointer", background: "transparent"
          }}
          aria-label={`تشغيل الفيديو ${index + 1}`}
        >
          <img
            src={thumbUrl}
            alt={`${teamName} فيديو ${index + 1}`}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={handleFail}
            onLoad={(e) => {
              // YouTube returns a 120×90 grey placeholder for deleted/invalid videos
              if (e.target.naturalWidth > 0 && e.target.naturalWidth <= 120) {
                handleFail();
              }
            }}
          />
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.30)"
          }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "50%",
              background: accent || "#dc2626",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 24px rgba(0,0,0,0.5)"
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}

/**
 * Direct embed — used for videoEmbed field (skips thumbnail validation).
 * Even if the specific video is removed, YouTube shows a proper "Video unavailable" UI.
 */
function DirectEmbed({ embedUrl, teamName, accent }) {
  const [clicked, setClicked] = useState(false);
  // Build a clean embed URL
  const src = embedUrl.includes("?")
    ? embedUrl + "&rel=0"
    : embedUrl + "?rel=0";

  return (
    <div style={{
      position: "relative", borderRadius: "16px", overflow: "hidden",
      background: "var(--bg-soft)", aspectRatio: "16/9",
      border: "1px solid var(--border)"
    }}>
      {clicked ? (
        <iframe
          src={src.replace("rel=0", "autoplay=1&rel=0")}
          title={`${teamName} — فيديو الفريق`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
        />
      ) : (
        <button
          onClick={() => setClicked(true)}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            border: "none", padding: 0, cursor: "pointer",
            background: "linear-gradient(135deg, var(--bg-soft) 0%, rgba(0,0,0,0.4) 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: "12px"
          }}
          aria-label="تشغيل الفيديو"
        >
          <div style={{
            width: "72px", height: "72px", borderRadius: "50%",
            background: accent || "#dc2626",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)"
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span style={{ color: "white", fontWeight: 700, fontSize: "15px", textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
            {teamName} — فيديو الفريق
          </span>
        </button>
      )}
    </div>
  );
}

/** Fallback: YouTube search button when no stored IDs and no embed URL */
function YouTubeSearchFallback({ teamName, accent }) {
  const query = encodeURIComponent(`ملخص ${teamName} 2025`);
  const url = `https://www.youtube.com/results?search_query=${query}`;
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: "16px",
      padding: "32px 20px",
      background: "var(--bg-soft)", borderRadius: "20px",
      border: "1px solid var(--border)"
    }}>
      <div style={{ fontSize: "48px" }}>▶</div>
      <p style={{ margin: 0, fontSize: "15px", color: "var(--text-2)", fontWeight: 700, textAlign: "center" }}>
        فيديوهات {teamName} متوفرة على يوتيوب
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "12px 24px", borderRadius: "999px",
          background: accent || "#dc2626", color: "white",
          fontWeight: 800, fontSize: "15px", textDecoration: "none",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)"
        }}
      >
        🔎 مشاهدة على يوتيوب
      </a>
    </div>
  );
}

export default function VideoSection({ videos, videoEmbed, teamName, accent, accentMid }) {
  // Priority 1: validated video IDs array
  const videoIds = Array.isArray(videos) && videos.length > 0 ? videos : [];

  const [failCount, setFailCount] = useState(0);
  const handleFail = useCallback(() => setFailCount(c => c + 1), []);

  const allFailed = videoIds.length > 0 && failCount >= videoIds.length;

  // Priority 2: direct videoEmbed URL (shown when no valid IDs array)
  const showDirect = (videoIds.length === 0 || allFailed) && Boolean(videoEmbed);
  // Priority 3: YouTube search fallback
  const showSearch = !showDirect && (videoIds.length === 0 || allFailed);

  return (
    <section style={{
      background: "var(--bg-card)",
      borderRadius: "28px",
      padding: "28px",
      border: "1px solid var(--border)",
      marginBottom: "26px",
      boxShadow: "var(--shadow)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
        <div style={{ width: "5px", height: "32px", borderRadius: "999px", background: accent }} />
        <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "var(--text-1)" }}>
          ▶ فيديوهات الفريق
        </h2>
      </div>

      {showSearch ? (
        <YouTubeSearchFallback teamName={teamName} accent={accent} />
      ) : showDirect ? (
        <DirectEmbed embedUrl={videoEmbed} teamName={teamName} accent={accent} />
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: videoIds.length === 1 ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px"
        }}>
          {videoIds.map((id, idx) => (
            <VideoCard
              key={id + idx}
              videoId={id}
              teamName={teamName}
              index={idx}
              accent={accent}
              onFail={handleFail}
            />
          ))}
        </div>
      )}
    </section>
  );
}
