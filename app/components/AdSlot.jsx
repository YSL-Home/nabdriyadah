const ADS_ENABLED = false;

export default function AdSlot({
  label = "إعلان",
  minHeight = 120,
  style = {}
}) {
  if (!ADS_ENABLED) {
    return <div style={{ display: "none", minHeight }} />;
  }

  return (
    <div
      style={{
        minHeight,
        borderRadius: "20px",
        border: "1px dashed #cbd5e1",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#64748b",
        fontSize: "14px",
        fontWeight: 700,
        ...style
      }}
    >
      {label}
    </div>
  );
}
