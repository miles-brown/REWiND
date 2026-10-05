export default function PlacesLoading() {
  return (
    <div className="places-page-shell" aria-busy="true" aria-label="Loading places directory">
      <header className="page-hero" style={{ padding: "32px 24px" }}>
        <span className="eyebrow">GEOGRAPHY & VENUES</span>
        <h1>Global Places & Sovereign Venues</h1>
        <p>Loading historical diplomatic venues and coordinate registers...</p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "16px",
          padding: "0 24px 48px",
        }}
        aria-hidden="true"
      >
        {Array.from({ length: 9 }).map((_, idx) => (
          <div
            key={idx}
            style={{
              padding: "20px",
              background: "rgba(9, 19, 26, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "10px",
              minHeight: "140px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "25%",
                height: "10px",
                borderRadius: "4px",
                background: "rgba(255, 255, 255, 0.04)",
                animation: "pulse 1.8s infinite ease-in-out",
              }}
            />
            <div
              style={{
                width: "60%",
                height: "20px",
                borderRadius: "4px",
                background: "rgba(255, 255, 255, 0.08)",
                animation: "pulse 1.8s infinite ease-in-out",
              }}
            />
            <div
              style={{
                width: "45%",
                height: "14px",
                borderRadius: "4px",
                background: "rgba(255, 255, 255, 0.04)",
                animation: "pulse 1.8s infinite ease-in-out",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
