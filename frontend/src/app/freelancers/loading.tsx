export default function Loading() {
  return (
    <div style={{ paddingTop: "120px", padding: "120px 1.5rem 3rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "2rem" }}>
          {/* Sidebar */}
          <div style={{ width: 280, flexShrink: 0 }}>
            <div className="skeleton" style={{ height: 400, borderRadius: 14 }} />
          </div>
          {/* Grid */}
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden" }}>
                <div className="skeleton" style={{ height: 160, borderRadius: 0 }} />
                <div style={{ padding: "1rem" }}>
                  <div className="skeleton skeleton-text" style={{ width: "80%" }} />
                  <div className="skeleton skeleton-text" style={{ width: "50%" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem" }}>
                    <div className="skeleton" style={{ width: 60, height: 24, borderRadius: 6 }} />
                    <div className="skeleton" style={{ width: 80, height: 24, borderRadius: 6 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
