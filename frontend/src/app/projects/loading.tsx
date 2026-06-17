export default function Loading() {
  return (
    <div style={{ padding: "120px 1.5rem 3rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Featured project banner */}
        <div className="skeleton" style={{ height: 280, borderRadius: 20, marginBottom: "2.5rem" }} />

        <div style={{ display: "flex", gap: "2rem" }}>
          {/* Sidebar */}
          <div style={{ width: 240, flexShrink: 0 }}>
            <div className="skeleton" style={{ height: 44, borderRadius: 10, marginBottom: "1rem" }} />
            <div className="skeleton" style={{ height: 320, borderRadius: 14, marginBottom: "1rem" }} />
            <div className="skeleton" style={{ height: 160, borderRadius: 14 }} />
          </div>

          {/* Grid */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {[80, 100, 110, 90, 70].map((w, i) => (
                <div key={i} className="skeleton" style={{ width: w, height: 36, borderRadius: 99 }} />
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden" }}>
                  <div className="skeleton" style={{ height: 180 }} />
                  <div style={{ padding: "1rem" }}>
                    <div className="skeleton skeleton-text" style={{ width: "80%", marginBottom: "0.4rem" }} />
                    <div className="skeleton skeleton-text" style={{ width: "55%" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", alignItems: "center" }}>
                      <div className="skeleton" style={{ width: 70, height: 22, borderRadius: 6 }} />
                      <div className="skeleton" style={{ width: 90, height: 36, borderRadius: 10 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
