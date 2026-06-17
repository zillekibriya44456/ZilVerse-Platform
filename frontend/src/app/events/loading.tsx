export default function Loading() {
  return (
    <div style={{ padding: "120px 1.5rem 3rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Hero banner skeleton */}
        <div className="skeleton" style={{ height: 220, borderRadius: 20, marginBottom: "2.5rem" }} />

        {/* Filters */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
          {[90, 120, 100, 80, 110].map((w, i) => (
            <div key={i} className="skeleton" style={{ width: w, height: 38, borderRadius: 99 }} />
          ))}
        </div>

        {/* Event cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div className="skeleton" style={{ width: 70, height: 24, borderRadius: 99 }} />
                  <div className="skeleton" style={{ width: 50, height: 24, borderRadius: 99 }} />
                </div>
                <div className="skeleton skeleton-text" style={{ width: "85%", marginBottom: "0.5rem" }} />
                <div className="skeleton skeleton-text" style={{ width: "60%", marginBottom: "1rem" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1.25rem" }}>
                  {[1, 2].map(j => <div key={j} className="skeleton skeleton-text" style={{ width: "50%", marginBottom: 0 }} />)}
                </div>
                <div className="skeleton skeleton-text" style={{ width: "90%" }} />
                <div className="skeleton skeleton-text" style={{ width: "70%" }} />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.25rem" }}>
                  <div className="skeleton" style={{ width: 120, height: 40, borderRadius: 10 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
