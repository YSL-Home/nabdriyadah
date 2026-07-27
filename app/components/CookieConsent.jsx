"use client";
import { useState, useEffect } from "react";

const LABELS = {
  ar: {
    msg: "يستخدم هذا الموقع ملفات تعريف الارتباط (Cookies) لتحليل الزيارات وعرض الإعلانات المناسبة عبر Google Analytics وGoogle AdSense.",
    accept: "أوافق",
    decline: "رفض",
    more: "سياسة الخصوصية",
  },
  fr: {
    msg: "Ce site utilise des cookies pour analyser le trafic et afficher des publicités pertinentes via Google Analytics et Google AdSense.",
    accept: "Accepter",
    decline: "Refuser",
    more: "Politique de confidentialité",
  },
  en: {
    msg: "This site uses cookies for traffic analysis and relevant ads via Google Analytics and Google AdSense.",
    accept: "Accept",
    decline: "Decline",
    more: "Privacy Policy",
  },
};

const PRIVACY = { ar: "/privacy/", fr: "/privacy/", en: "/privacy/" };

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [lang, setLang] = useState("ar");

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setShow(true);
    const p = window.location.pathname;
    if (p.startsWith("/en")) setLang("en");
    else if (p.startsWith("/fr")) setLang("fr");
    else setLang("ar");
  }, []);

  const handle = (choice) => {
    localStorage.setItem("cookie_consent", choice);
    setShow(false);
  };

  if (!show) return null;

  const t = LABELS[lang];
  const isRTL = lang === "ar";

  return (
    <div
      role="dialog"
      aria-label={isRTL ? "إشعار ملفات تعريف الارتباط" : "Cookie notice"}
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
        background: "rgba(13,22,42,0.97)", color: "#e8edf8",
        padding: "16px 20px",
        display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap",
        direction: isRTL ? "rtl" : "ltr",
        backdropFilter: "blur(8px)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.3)",
      }}
    >
      <p style={{ flex: 1, margin: 0, fontSize: "14px", lineHeight: 1.6, color: "#c9d4f0", minWidth: "220px" }}>
        {t.msg}{" "}
        <a href={PRIVACY[lang]} style={{ color: "#7da9ff", textDecoration: "underline" }}>
          {t.more}
        </a>
      </p>
      <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
        <button
          onClick={() => handle("declined")}
          style={{
            background: "transparent", color: "#9ca3af",
            border: "1px solid rgba(156,163,175,0.35)",
            borderRadius: "8px", padding: "8px 18px",
            fontSize: "14px", fontWeight: 600, cursor: "pointer",
          }}
        >
          {t.decline}
        </button>
        <button
          onClick={() => handle("accepted")}
          style={{
            background: "#1a56db", color: "#fff",
            border: "none", borderRadius: "8px",
            padding: "8px 22px", fontSize: "14px",
            fontWeight: 700, cursor: "pointer",
          }}
        >
          {t.accept}
        </button>
      </div>
    </div>
  );
}
