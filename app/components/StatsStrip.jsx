/* Server component — pas de "use client" */
export default function StatsStrip({ totalArticles }) {
  const stats = [
    { value: totalArticles, label: "مقال منشور", icon: "📰" },
    { value: 7,             label: "رياضة مغطاة", icon: "🏅" },
    { value: "كل 30 دقيقة", label: "تحديث الأخبار", icon: "🔄" },
  ];

  return (
    <div style={{
      display: "flex",
      flexDirection: "row",
      gap: "12px",
      marginBottom: "20px",
      flexWrap: "wrap",
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          flex: "1 1 0",
          minWidth: "120px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          background: "color-mix(in srgb, var(--accent) 10%, transparent)",
          border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
          borderRadius: "14px",
          padding: "16px 12px",
          textAlign: "center",
        }}>
          <span style={{ fontSize: "16px", lineHeight: 1 }}>{s.icon}</span>
          <span style={{
            fontWeight: 700,
            fontSize: "28px",
            color: "var(--accent)",
            lineHeight: 1.1,
          }}>
            {s.value}
          </span>
          <span style={{
            fontSize: "13px",
            color: "var(--text-2)",
            fontWeight: 500,
            lineHeight: 1.3,
          }}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}
