export default function Loading() {
  return (
    <div style={{ paddingTop: "120px", padding: "120px 1.5rem 3rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Hero skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center", marginBottom: "4rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="skeleton" style={{ width: 180, height: 28, borderRadius: 99 }} />
            <div className="skeleton" style={{ width: "90%", height: 56, borderRadius: 8 }} />
            <div className="skeleton" style={{ width: "70%", height: 56, borderRadius: 8 }} />
            <div className="skeleton" style={{ width: "80%", height: 20, borderRadius: 6, marginTop: 8 }} />
            <div className="skeleton" style={{ width: "60%", height: 20, borderRadius: 6 }} />
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <div className="skeleton" style={{ width: 160, height: 48, borderRadius: 12 }} />
              <div className="skeleton" style={{ width: 160, height: 48, borderRadius: 12 }} />
            </div>
          </div>
          <div className="skeleton" style={{ height: 360, borderRadius: 20 }} />
        </div>

        {/* Stats skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "1rem", marginBottom: "4rem" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />
          ))}
        </div>

        {/* Cards skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 180, borderRadius: 14 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
