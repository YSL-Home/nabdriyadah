"use client";
import { useState, useCallback } from "react";

/** ── Validated video ID → thumbnail + click-to-play ── */
function VideoCard({ videoId, teamName, index, accent, onFail }) {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed]   = useState(false);
  const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const handleFail = useCallback(() => { if (!failed) { setFailed(true); onFail?.(); } }, [failed, onFail]);
  if (failed) return null;
  return (
    <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", background: "var(--bg-soft)", aspectRatio: "16/9", border: "1px solid var(--border)" }}>
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={`${teamName} — فيديو ${index + 1}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
        />
      ) : (
        <button onClick={() => setPlaying(true)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", padding: 0, cursor: "pointer", background: "transparent" }} aria-label={`تشغيل الفيديو ${index + 1}`}>
          <img src={thumbUrl} alt={`${teamName} فيديو ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={handleFail} onLoad={(e) => { if (e.target.naturalWidth > 0 && e.target.naturalWidth <= 120) handleFail(); }} />
          <PlayOverlay accent={accent} />
        </button>
      )}
    </div>
  );
}

/** ── YouTube channel uploads playlist — browse ALL team videos on-site ── */
function ChannelPlaylist({ channelId, teamName, accent }) {
  const [clicked, setClicked] = useState(false);
  // UU... = uploads playlist (replace UC with UU)
  const playlist = channelId.replace(/^UC/, "UU");
  const src = `https://www.youtube.com/embed/videoseries?list=${playlist}&rel=0&autoplay=1`;
  return (
    <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", background: "#000", border: "1px solid var(--border)", gridColumn: "1 / -1", aspectRatio: "16/7" }}>
      {clicked ? (
        <iframe
          src={src}
          title={`${teamName} — chaîne officielle`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
        />
      ) : (
        <button
          onClick={() => setClicked(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", padding: 0, cursor: "pointer", background: `linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.50) 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}
          aria-label="Lancer la chaîne officielle"
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: accent || "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 30px rgba(0,0,0,0.6)" }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0, color: "white", fontWeight: 900, fontSize: "20px", textShadow: "0 2px 6px rgba(0,0,0,0.8)" }}>
                {teamName}
              </p>
              <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.8)", fontWeight: 600, fontSize: "14px" }}>
                📺 Chaîne officielle · Playlist complète
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
              {["▶ Dernier match","⚽ Buts","🏆 Highlights"].map(label => (
                <span key={label} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", padding: "6px 14px", borderRadius: "999px", color: "white", fontSize: "12px", fontWeight: 700 }}>{label}</span>
              ))}
            </div>
          </div>
        </button>
      )}
    </div>
  );
}

/** ── Direct embed from videoEmbed field ── */
function DirectEmbed({ embedUrl, teamName, accent, label }) {
  const [clicked, setClicked] = useState(false);
  const src = (embedUrl.includes("?") ? embedUrl + "&rel=0&autoplay=1" : embedUrl + "?rel=0&autoplay=1");
  return (
    <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", background: "var(--bg-soft)", aspectRatio: "16/9", border: "1px solid var(--border)" }}>
      {clicked ? (
        <iframe src={src} title={`${teamName} — ${label}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
      ) : (
        <button onClick={() => setClicked(true)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", padding: 0, cursor: "pointer", background: "linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.30) 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px" }} aria-label={`تشغيل ${label}`}>
          <PlayOverlay accent={accent} size={68} />
          <span style={{ color: "white", fontWeight: 700, fontSize: "13px", textShadow: "0 1px 4px rgba(0,0,0,0.8)", maxWidth: "220px", textAlign: "center", lineHeight: 1.4 }}>{label}</span>
        </button>
      )}
    </div>
  );
}

/** ── YouTube search card → links to YouTube search ── */
function SearchCard({ query, label, icon, accent }) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", aspectRatio: "16/9", borderRadius: "16px", textDecoration: "none", background: "var(--bg-soft)", border: "1px solid var(--border)", cursor: "pointer" }}>
      <div style={{ fontSize: "32px" }}>{icon}</div>
      <span style={{ color: "var(--text-1)", fontWeight: 700, fontSize: "13px", textAlign: "center", lineHeight: 1.4, padding: "0 12px" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "999px", background: accent || "#dc2626" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
        <span style={{ color: "white", fontWeight: 800, fontSize: "11px" }}>YouTube</span>
      </div>
    </a>
  );
}

function PlayOverlay({ accent, size = 64 }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.28)" }}>
      <div style={{ width: `${size}px`, height: `${size}px`, borderRadius: "50%", background: accent || "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>
        <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
      </div>
    </div>
  );
}

export default function VideoSection({ videos, videoEmbed, youtubeChannelId, teamName, accent }) {
  const validIds  = Array.isArray(videos) && videos.length > 0 ? videos : [];
  const [failCount, setFailCount] = useState(0);
  const handleFail = useCallback(() => setFailCount(c => c + 1), []);
  const allFailed  = validIds.length > 0 && failCount >= validIds.length;

  // Search cards for teams without dedicated video content
  const searchCards = [
    { query: `ملخص ${teamName} 2025`,          label: `ملخص مباريات ${teamName}`, icon: "🎬" },
    { query: `أهداف ${teamName} 2025`,          label: `أهداف ${teamName}`,        icon: "⚽" },
    { query: `${teamName} highlights 2025`,      label: `${teamName} Highlights`,   icon: "🏆" },
  ];

  const hasChannel   = Boolean(youtubeChannelId);
  const hasRealIds   = validIds.length > 0 && !allFailed;
  const hasEmbed     = Boolean(videoEmbed);

  return (
    <section style={{ background: "var(--bg-card)", borderRadius: "28px", padding: "28px", border: "1px solid var(--border)", marginBottom: "26px", boxShadow: "var(--shadow)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
        <div style={{ width: "5px", height: "32px", borderRadius: "999px", background: accent }} />
        <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "var(--text-1)" }}>▶ فيديوهات الفريق</h2>
      </div>

      {/* ── PRIORITY 1: Official channel playlist (browse all videos on-site) ── */}
      {hasChannel && (
        <div style={{ display: "grid", gap: "14px" }}>
          <ChannelPlaylist channelId={youtubeChannelId} teamName={teamName} accent={accent} />
          {/* Below the playlist: 3 quick-search cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px" }}>
            {searchCards.map(c => (
              <SearchCard key={c.query} query={c.query} label={c.label} icon={c.icon} accent={accent} />
            ))}
          </div>
        </div>
      )}

      {/* ── PRIORITY 2: Validated video IDs grid ── */}
      {!hasChannel && hasRealIds && (
        <div style={{ display: "grid", gridTemplateColumns: validIds.length === 1 ? "1fr" : "repeat(2,1fr)", gap: "14px" }}>
          {validIds.map((id, idx) => (
            <VideoCard key={id + idx} videoId={id} teamName={teamName} index={idx} accent={accent} onFail={handleFail} />
          ))}
        </div>
      )}

      {/* ── PRIORITY 3: Single videoEmbed + 3 search cards ── */}
      {!hasChannel && !hasRealIds && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "14px" }}>
          {hasEmbed && (
            <DirectEmbed embedUrl={videoEmbed} teamName={teamName} accent={accent} label={`فيديو رسمي — ${teamName}`} />
          )}
          {searchCards.slice(0, hasEmbed ? 3 : 4).map(c => (
            <SearchCard key={c.query} query={c.query} label={c.label} icon={c.icon} accent={accent} />
          ))}
          {!hasEmbed && (
            <SearchCard query={`ملخص ${teamName} بين سبورت 2025`} label={`${teamName} — beIN Sports`} icon="📺" accent={accent} />
          )}
        </div>
      )}
    </section>
  );
}
