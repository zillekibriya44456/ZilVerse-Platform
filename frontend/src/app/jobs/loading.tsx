export default function Loading() {
  return (
    <div style={{ paddingTop: "120px", padding: "120px 1.5rem 3rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Page header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div>
            <div className="skeleton" style={{ width: 200, height: 36, borderRadius: 8, marginBottom: "0.5rem" }} />
            <div className="skeleton" style={{ width: 300, height: 18, borderRadius: 6 }} />
          </div>
          <div className="skeleton" style={{ width: 130, height: 44, borderRadius: 12 }} />
        </div>

        {/* Filter row */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ width: 90 + i * 10, height: 38, borderRadius: 99 }} />
          ))}
        </div>

        {/* Job cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-card" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "1.25rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div className="skeleton skeleton-avatar" style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-text" style={{ width: "50%", marginBottom: "0.5rem" }} />
                  <div className="skeleton skeleton-text" style={{ width: "35%" }} />
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                    {[70, 80, 60].map((w, j) => (
                      <div key={j} className="skeleton" style={{ width: w, height: 22, borderRadius: 99 }} />
                    ))}
                  </div>
                </div>
                <div className="skeleton" style={{ width: 90, height: 36, borderRadius: 10, flexShrink: 0 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
