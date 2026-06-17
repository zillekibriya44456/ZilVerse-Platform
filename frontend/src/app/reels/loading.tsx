export default function Loading() {
  return (
    <div style={{ padding: "120px 1.5rem 3rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
          <div>
            <div className="skeleton" style={{ width: 220, height: 36, borderRadius: 8, marginBottom: "0.5rem" }} />
            <div className="skeleton" style={{ width: 160, height: 18, borderRadius: 6 }} />
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <div className="skeleton" style={{ width: 100, height: 38, borderRadius: 99 }} />
            <div className="skeleton" style={{ width: 120, height: 38, borderRadius: 99 }} />
          </div>
        </div>

        {/* Search + filter row */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
          <div className="skeleton" style={{ flex: 1, height: 48, borderRadius: 12 }} />
          <div className="skeleton" style={{ width: 140, height: 48, borderRadius: 12 }} />
        </div>

        {/* Reel grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.25rem" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
              {/* 9:16 thumbnail */}
              <div className="skeleton" style={{ aspectRatio: "9/16", width: "100%" }} />
              <div style={{ padding: "0.75rem" }}>
                <div className="skeleton skeleton-text" style={{ width: "80%" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <div className="skeleton skeleton-avatar" style={{ width: 28, height: 28 }} />
                  <div className="skeleton skeleton-text" style={{ width: "50%", marginBottom: 0 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
