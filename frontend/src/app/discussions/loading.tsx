export default function Loading() {
  return (
    <div style={{ padding: "120px 1.5rem 3rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div>
            <div className="skeleton" style={{ width: 180, height: 36, borderRadius: 8, marginBottom: "0.5rem" }} />
            <div className="skeleton" style={{ width: 260, height: 18, borderRadius: 6 }} />
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <div className="skeleton" style={{ width: 120, height: 44, borderRadius: 12 }} />
            <div className="skeleton" style={{ width: 120, height: 44, borderRadius: 12 }} />
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
          {[80, 110, 90, 130, 70].map((w, i) => (
            <div key={i} className="skeleton" style={{ width: w, height: 36, borderRadius: 99 }} />
          ))}
        </div>

        {/* Discussion list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "1.25rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div className="skeleton skeleton-avatar" style={{ width: 44, height: 44, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-text" style={{ width: "65%", marginBottom: "0.5rem" }} />
                  <div className="skeleton skeleton-text" style={{ width: "90%" }} />
                  <div className="skeleton skeleton-text" style={{ width: "70%" }} />
                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
                    {[60, 80].map((w, j) => <div key={j} className="skeleton" style={{ width: w, height: 22, borderRadius: 99 }} />)}
                  </div>
                </div>
                <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                  <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 8 }} />
                  <div className="skeleton" style={{ width: 28, height: 14, borderRadius: 4 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
