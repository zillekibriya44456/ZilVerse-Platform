export default function Loading() {
  return (
    <div style={{ padding: "120px 1.5rem 3rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Greeting header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
          <div>
            <div className="skeleton" style={{ width: 260, height: 36, borderRadius: 8, marginBottom: "0.5rem" }} />
            <div className="skeleton" style={{ width: 180, height: 18, borderRadius: 6 }} />
          </div>
          <div className="skeleton" style={{ width: 90, height: 38, borderRadius: 10 }} />
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 110, borderRadius: 14 }} />
          ))}
        </div>

        {/* Quick actions */}
        <div className="skeleton" style={{ height: 80, borderRadius: 14, marginBottom: "2rem" }} />

        {/* Two-col: Activity + Analytics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
          <div className="skeleton" style={{ height: 300, borderRadius: 14 }} />
          <div className="skeleton" style={{ height: 300, borderRadius: 14 }} />
        </div>

        {/* Badges */}
        <div className="skeleton" style={{ height: 160, borderRadius: 14 }} />
      </div>
    </div>
  );
}
