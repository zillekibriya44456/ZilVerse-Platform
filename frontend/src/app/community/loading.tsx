export default function Loading() {
  return (
    <div style={{ padding: "120px 1.5rem 3rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="skeleton" style={{ width: 80, height: 24, borderRadius: 99, margin: "0 auto 1rem" }} />
          <div className="skeleton" style={{ width: 220, height: 40, borderRadius: 8, margin: "0 auto 0.75rem" }} />
          <div className="skeleton" style={{ width: 300, height: 18, borderRadius: 6, margin: "0 auto" }} />
        </div>

        {/* Hub cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.25rem", marginBottom: "3rem" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "1.75rem" }}>
              <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 12, marginBottom: "1rem" }} />
              <div className="skeleton skeleton-text" style={{ width: "70%", marginBottom: "0.5rem" }} />
              <div className="skeleton skeleton-text" style={{ width: "90%" }} />
              <div className="skeleton skeleton-text" style={{ width: "75%" }} />
            </div>
          ))}
        </div>

        {/* Live feed two-col */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          {Array.from({ length: 2 }).map((_, col) => (
            <div key={col}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <div className="skeleton" style={{ width: 160, height: 24, borderRadius: 6 }} />
                <div className="skeleton" style={{ width: 60, height: 20, borderRadius: 6 }} />
              </div>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ display: "flex", gap: "0.75rem", padding: "0.85rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, marginBottom: "0.6rem" }}>
                  <div className="skeleton skeleton-avatar" style={{ width: 38, height: 38, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton skeleton-text" style={{ width: "70%", marginBottom: "0.35rem" }} />
                    <div className="skeleton skeleton-text" style={{ width: "45%" }} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
