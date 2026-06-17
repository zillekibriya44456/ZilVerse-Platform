export default function Loading() {
  return (
    <div style={{ padding: "120px 1.5rem 3rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div className="skeleton" style={{ width: 200, height: 38, borderRadius: 8, margin: "0 auto 0.75rem" }} />
          <div className="skeleton" style={{ width: 300, height: 18, borderRadius: 6, margin: "0 auto" }} />
        </div>

        {/* Category pills */}
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "2rem", flexWrap: "wrap" }}>
          {[90, 110, 80, 130, 70, 100].map((w, i) => (
            <div key={i} className="skeleton" style={{ width: w, height: 36, borderRadius: 99 }} />
          ))}
        </div>

        {/* Service cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden" }}>
              <div className="skeleton" style={{ height: 160 }} />
              <div style={{ padding: "1rem" }}>
                <div className="skeleton skeleton-text" style={{ width: "80%", marginBottom: "0.5rem" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <div className="skeleton skeleton-avatar" style={{ width: 24, height: 24 }} />
                  <div className="skeleton skeleton-text" style={{ width: "40%", marginBottom: 0 }} />
                </div>
                <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem" }}>
                  {[1, 2, 3].map(j => <div key={j} className="skeleton" style={{ width: 48, height: 18, borderRadius: 99 }} />)}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="skeleton" style={{ width: 64, height: 26, borderRadius: 6 }} />
                  <div className="skeleton" style={{ width: 96, height: 36, borderRadius: 10 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
