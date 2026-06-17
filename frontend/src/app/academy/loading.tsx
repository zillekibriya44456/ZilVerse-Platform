export default function Loading() {
  return (
    <div style={{ padding: "120px 1.5rem 3rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="skeleton" style={{ width: 200, height: 40, borderRadius: 8, margin: "0 auto 1rem" }} />
          <div className="skeleton" style={{ width: 320, height: 20, borderRadius: 6, margin: "0 auto 0.5rem" }} />
          {/* Tabs */}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1.5rem" }}>
            {[100, 80, 80].map((w, i) => (
              <div key={i} className="skeleton" style={{ width: w, height: 40, borderRadius: 99 }} />
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div className="skeleton" style={{ width: 220, height: 24, borderRadius: 6 }} />
          <div className="skeleton" style={{ width: 160, height: 38, borderRadius: 8 }} />
        </div>

        {/* Course grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden" }}>
              <div className="skeleton" style={{ height: 160 }} />
              <div style={{ padding: "1rem" }}>
                <div className="skeleton skeleton-text" style={{ width: "70%" }} />
                <div className="skeleton skeleton-text" style={{ width: "50%" }} />
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  {[1, 2, 3].map(j => <div key={j} className="skeleton" style={{ width: 56, height: 18, borderRadius: 99 }} />)}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
                  <div className="skeleton" style={{ width: 56, height: 24, borderRadius: 6 }} />
                  <div className="skeleton" style={{ width: 100, height: 36, borderRadius: 10 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
