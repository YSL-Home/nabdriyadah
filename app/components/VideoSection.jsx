"use client";
import { useState, useCallback } from "react";

// YouTube thumbnail URL: if video doesn't exist, YouTube returns a gray placeholder
// We detect it by checking the thumbnail image dimensions (default = 120x90)
function VideoCard({ videoId, teamName, index, accent, onFail }) {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  const handleFail = useCallback(() => {
    if (!failed) {
      setFailed(true);
      onFail?.();
    }
  }, [failed, onFail]);

  if (failed) return null;

  return (
    <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", background: "#000", aspectRatio: "16/9" }}>
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
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", padding: 0, cursor: "pointer", background: "transparent" }}
          aria-label={`تشغيل الفيديو ${index + 1}`}
        >
          {/* Thumbnail */}
          <img
            src={thumbUrl}
            alt={`${teamName} فيديو ${index + 1}`}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={handleFail}
            onLoad={(e) => {
              // YouTube returns a 120×90 "no thumbnail" image for invalid videos
              if (e.target.naturalWidth <= 120 && e.target.naturalHeight <= 90) {
                handleFail();
              }
            }}
          />
          {/* Play overlay */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.25)",
            transition: "background 0.15s"
          }}>
            <div style={{
              width: "60px", height: "60px", borderRadius: "999px",
              background: accent || "#dc2626",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}

export default function VideoSection({ videos, videoEmbed, teamName, accent, accentMid }) {
  const videoIds = videos?.length > 0
    ? videos
    : videoEmbed
      ? [videoEmbed.replace("https://www.youtube.com/embed/", "").split("?")[0]]
      : [];

  // Track how many cards have failed
  const [failCount, setFailCount] = useState(0);
  const handleFail = useCallback(() => setFailCount(c => c + 1), []);

  if (videoIds.length === 0) return null;

  // Hide entire section once all cards have failed
  if (failCount >= videoIds.length) return null;

  return (
    <section style={{
      background: "white",
      borderRadius: "28px",
      padding: "28px",
      border: `1px solid ${accentMid}`,
      marginBottom: "26px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.04)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
        <div style={{ width: "5px", height: "32px", borderRadius: "999px", background: accent }} />
        <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 800 }}>▶ فيديوهات الفريق</h2>
      </div>
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
    </section>
  );
}
