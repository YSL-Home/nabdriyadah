"use client";
import { useState, useCallback } from "react";

/** Validated video ID → thumbnail + click-to-play */
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
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", padding: 0, cursor: "pointer", background: "transparent" }}
          aria-label={`تشغيل الفيديو ${index + 1}`}
        >
          <img
            src={thumbUrl}
            alt={`${teamName} فيديو ${index + 1}`}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={handleFail}
            onLoad={(e) => { if (e.target.naturalWidth > 0 && e.target.naturalWidth <= 120) handleFail(); }}
          />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.30)" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: accent || "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}

/** Direct embed for videoEmbed field — no thumbnail validation */
function DirectEmbed({ embedUrl, teamName, accent, label }) {
  const [clicked, setClicked] = useState(false);
  const src = (embedUrl.includes("?") ? embedUrl + "&rel=0&autoplay=1" : embedUrl + "?rel=0&autoplay=1");
  const preview = embedUrl.includes("?") ? embedUrl + "&rel=0" : embedUrl + "?rel=0";

  return (
    <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", background: "var(--bg-soft)", aspectRatio: "16/9", border: "1px solid var(--border)" }}>
      {clicked ? (
        <iframe
          src={src}
          title={`${teamName} — ${label}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
        />
      ) : (
        <button
          onClick={() => setClicked(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", padding: 0, cursor: "pointer", background: "linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.30) 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px" }}
          aria-label={`تشغيل ${label}`}
        >
          <div style={{ width: "68px", height: "68px", borderRadius: "50%", background: accent || "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
          </div>
          <span style={{ color: "white", fontWeight: 700, fontSize: "14px", textShadow: "0 1px 4px rgba(0,0,0,0.8)", maxWidth: "220px", textAlign: "center", lineHeight: 1.4 }}>
            {label}
          </span>
        </button>
      )}
    </div>
  );
}

/** YouTube search card — links to a YouTube search query */
function YouTubeSearchCard({ query, label, icon, accent }) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: "10px", aspectRatio: "16/9", borderRadius: "16px", textDecoration: "none",
        background: "var(--bg-soft)", border: "1px solid var(--border)",
        transition: "transform 0.15s, box-shadow 0.15s",
        cursor: "pointer"
      }}
    >
      <div style={{ fontSize: "36px" }}>{icon}</div>
      <span style={{ color: "var(--text-1)", fontWeight: 700, fontSize: "13px", textAlign: "center", lineHeight: 1.4, padding: "0 12px" }}>
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "999px", background: accent || "#dc2626" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
        <span style={{ color: "white", fontWeight: 800, fontSize: "12px" }}>YouTube</span>
      </div>
    </a>
  );
}

export default function VideoSection({ videos, videoEmbed, teamName, accent }) {
  const validIds = Array.isArray(videos) && videos.length > 0 ? videos : [];
  const [failCount, setFailCount] = useState(0);
  const handleFail = useCallback(() => setFailCount(c => c + 1), []);
  const allFailed = validIds.length > 0 && failCount >= validIds.length;

  // Search queries for when we don't have enough real videos
  const searchCards = [
    { query: `ملخص ${teamName} 2025`,             label: `ملخص مباريات ${teamName}`,    icon: "🎬" },
    { query: `أهداف ${teamName} 2025`,             label: `أهداف ${teamName}`,            icon: "⚽" },
    { query: `${teamName} highlights 2025`,         label: `${teamName} Highlights`,       icon: "🏆" },
    { query: `ملخص ${teamName} بين سبورت 2025`,    label: `${teamName} — beIN Sports`,    icon: "📺" },
  ];

  // How many validated video slots we have
  const realSlots = allFailed ? 0 : validIds.length;

  // We want a grid of 4 total items
  // → fill with real videos first, then videoEmbed (if no real), then search cards
  const items = [];

  if (realSlots > 0) {
    // Real validated video IDs
    validIds.forEach((id, idx) => {
      items.push({ type: "video", id, idx });
    });
  } else if (videoEmbed) {
    // videoEmbed as first item
    items.push({ type: "embed", url: videoEmbed, label: `فيديو رسمي — ${teamName}` });
  }

  // Fill up to 4 with search cards
  const needed = Math.max(0, 4 - items.length);
  searchCards.slice(0, needed).forEach(card => {
    items.push({ type: "search", ...card });
  });

  const cols = items.length === 1 ? "1fr" : items.length === 2 ? "repeat(2, 1fr)" : "repeat(2, 1fr)";

  return (
    <section style={{ background: "var(--bg-card)", borderRadius: "28px", padding: "28px", border: "1px solid var(--border)", marginBottom: "26px", boxShadow: "var(--shadow)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
        <div style={{ width: "5px", height: "32px", borderRadius: "999px", background: accent }} />
        <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "var(--text-1)" }}>
          ▶ فيديوهات الفريق
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: cols, gap: "14px" }}>
        {items.map((item, i) => {
          if (item.type === "video") {
            return (
              <VideoCard
                key={item.id + item.idx}
                videoId={item.id}
                teamName={teamName}
                index={item.idx}
                accent={accent}
                onFail={handleFail}
              />
            );
          }
          if (item.type === "embed") {
            return (
              <DirectEmbed
                key="embed"
                embedUrl={item.url}
                teamName={teamName}
                accent={accent}
                label={item.label}
              />
            );
          }
          return (
            <YouTubeSearchCard
              key={item.query}
              query={item.query}
              label={item.label}
              icon={item.icon}
              accent={accent}
            />
          );
        })}
      </div>
    </section>
  );
}
