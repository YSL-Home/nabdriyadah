"use client";
import { useState, useCallback, useRef } from "react";

/* ── Play button overlay ─────────────────────────────── */
function PlayOverlay({ accent, size = 56 }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.32)" }}>
      <div style={{ width: `${size}px`, height: `${size}px`, borderRadius: "50%", background: accent || "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.55)", transition: "transform 0.15s", flexShrink: 0 }}>
        <svg width={size * 0.38} height={size * 0.38} viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
      </div>
    </div>
  );
}

/* ── Single video card (thumbnail → click to play) ───── */
function VideoCard({ videoId, teamName, index, accent, onFail }) {
  const [playing, setPlaying] = useState(false);
  const [failed,  setFailed]  = useState(false);
  const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  const handleFail = useCallback(() => {
    if (!failed) { setFailed(true); onFail?.(); }
  }, [failed, onFail]);

  if (failed) return null;

  return (
    <div style={{
      position: "relative", flexShrink: 0,
      width: "300px", aspectRatio: "16/9",
      borderRadius: "14px", overflow: "hidden",
      background: "#000", border: "1px solid var(--border)",
      boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
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
            onLoad={e => { if (e.target.naturalWidth > 0 && e.target.naturalWidth <= 120) handleFail(); }}
          />
          <PlayOverlay accent={accent} />
          {/* Video number badge */}
          <div style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(0,0,0,0.65)", color: "white", fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "999px", backdropFilter: "blur(4px)" }}>
            {index === 0 ? "🆕 الأحدث" : `#${index + 1}`}
          </div>
        </button>
      )}
    </div>
  );
}

/* ── Channel playlist card ───────────────────────────── */
function ChannelPlaylist({ channelId, teamName, accent }) {
  const [clicked, setClicked] = useState(false);
  const playlist = channelId.replace(/^UC/, "UU");
  return (
    <div style={{
      position: "relative", flexShrink: 0,
      width: "480px", aspectRatio: "16/9",
      borderRadius: "14px", overflow: "hidden",
      background: "#000", border: "1px solid var(--border)",
      boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
    }}>
      {clicked ? (
        <iframe
          src={`https://www.youtube.com/embed/videoseries?list=${playlist}&rel=0&autoplay=1`}
          title={`${teamName} — chaîne officielle`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
        />
      ) : (
        <button
          onClick={() => setClicked(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", padding: 0, cursor: "pointer", background: `linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}
        >
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: accent || "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 24px rgba(0,0,0,0.6)" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, color: "white", fontWeight: 900, fontSize: "16px" }}>{teamName}</p>
            <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.75)", fontSize: "12px", fontWeight: 600 }}>📺 القناة الرسمية — كل المقاطع</p>
          </div>
          <div style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(0,0,0,0.65)", color: "white", fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "999px" }}>
            📋 قناة
          </div>
        </button>
      )}
    </div>
  );
}

/* ── YouTube search fallback card ────────────────────── */
function SearchCard({ query, label, icon, accent }) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  return (
    <a
      href={url} target="_blank" rel="noopener noreferrer"
      style={{
        flexShrink: 0, width: "220px", aspectRatio: "16/9",
        borderRadius: "14px", textDecoration: "none",
        background: "var(--bg-soft)", border: "1px solid var(--border)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px",
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: "28px" }}>{icon}</div>
      <span style={{ color: "var(--text-1)", fontWeight: 700, fontSize: "12px", textAlign: "center", lineHeight: 1.4, padding: "0 10px" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "999px", background: accent || "#dc2626" }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
        <span style={{ color: "white", fontWeight: 800, fontSize: "10px" }}>YouTube</span>
      </div>
    </a>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN EXPORT — horizontal scrollable strip
══════════════════════════════════════════════════════ */
export default function VideoSection({ videos, videoEmbed, youtubeChannelId, teamName, accent }) {
  const validIds = Array.isArray(videos) && videos.length > 0 ? videos : [];
  const [failCount, setFailCount] = useState(0);
  const handleFail = useCallback(() => setFailCount(c => c + 1), []);
  const allFailed  = validIds.length > 0 && failCount >= validIds.length;
  const hasRealIds = validIds.length > 0 && !allFailed;
  const hasChannel = Boolean(youtubeChannelId);
  const hasEmbed   = Boolean(videoEmbed);

  const scrollRef = useRef(null);
  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  // Search cards (fallback)
  const searchCards = [
    { query: `ملخص ${teamName} 2025`,       label: `ملخص مباريات ${teamName}`, icon: "🎬" },
    { query: `أهداف ${teamName} 2025`,       label: `أهداف ${teamName}`,        icon: "⚽" },
    { query: `${teamName} highlights 2025`,   label: `${teamName} Highlights`,   icon: "🏆" },
    { query: `${teamName} best goals 2025`,   label: `أجمل أهداف ${teamName}`,   icon: "🌟" },
  ];

  return (
    <section style={{ background: "var(--bg-card)", borderRadius: "28px", padding: "24px 0", border: "1px solid var(--border)", marginBottom: "26px", boxShadow: "var(--shadow)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "5px", height: "28px", borderRadius: "999px", background: accent }} />
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "var(--text-1)" }}>▶ فيديوهات الفريق</h2>
          {hasRealIds && (
            <span style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 600 }}>
              {validIds.length} مقاطع · من الأحدث للأقدم
            </span>
          )}
        </div>
        {/* Scroll arrows */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => scroll(-1)} style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid var(--border)", background: "var(--bg-soft)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-1)", fontSize: "16px" }}>‹</button>
          <button onClick={() => scroll(1)}  style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid var(--border)", background: "var(--bg-soft)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-1)", fontSize: "16px" }}>›</button>
        </div>
      </div>

      {/* Horizontal scroll strip */}
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          gap: "14px",
          overflowX: "auto",
          paddingInline: "24px",
          paddingBottom: "8px",
          scrollbarWidth: "thin",
          scrollbarColor: `${accent || "#4f8eff"} transparent`,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Official channel — wide card at start */}
        {hasChannel && (
          <ChannelPlaylist channelId={youtubeChannelId} teamName={teamName} accent={accent} />
        )}

        {/* Real video IDs — newest first */}
        {hasRealIds && validIds.map((id, idx) => (
          <VideoCard
            key={id + idx}
            videoId={id}
            teamName={teamName}
            index={idx}
            accent={accent}
            onFail={handleFail}
          />
        ))}

        {/* Single embed */}
        {!hasRealIds && hasEmbed && (
          <div style={{ position: "relative", flexShrink: 0, width: "380px", aspectRatio: "16/9", borderRadius: "14px", overflow: "hidden", background: "var(--bg-soft)", border: "1px solid var(--border)" }}>
            <iframe src={videoEmbed.includes("?") ? videoEmbed + "&rel=0" : videoEmbed + "?rel=0"} title={teamName} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
          </div>
        )}

        {/* Search cards — always show as extra cards after real videos */}
        {searchCards.map(c => (
          <SearchCard key={c.query} query={c.query} label={c.label} icon={c.icon} accent={accent} />
        ))}
      </div>
    </section>
  );
}
