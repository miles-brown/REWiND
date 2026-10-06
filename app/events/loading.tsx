export default function EventsLoading() {
  return (
    <div className="page-shell" role="status" aria-busy="true" aria-label="Loading events directory">
      <header className="page-hero">
        <span className="eyebrow">CHRONOLOGY</span>
        <h1>Historical Events & Diplomatic Summits</h1>
        <p>Loading verified historical timeline and primary evidence records...</p>
      </header>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 24px 48px",
        }}
        aria-hidden="true"
      >
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            style={{
              padding: "20px 24px",
              background: "rgba(9, 19, 26, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div
                style={{
                  width: "90px",
                  height: "12px",
                  borderRadius: "4px",
                  background: "rgba(255, 255, 255, 0.05)",
                  animation: "pulse 1.8s infinite ease-in-out",
                }}
              />
              <div
                style={{
                  width: "120px",
                  height: "12px",
                  borderRadius: "4px",
                  background: "rgba(255, 255, 255, 0.05)",
                  animation: "pulse 1.8s infinite ease-in-out",
                }}
              />
            </div>
            <div
              style={{
                width: "55%",
                height: "22px",
                borderRadius: "4px",
                background: "rgba(255, 255, 255, 0.08)",
                animation: "pulse 1.8s infinite ease-in-out",
              }}
            />
            <div
              style={{
                width: "85%",
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
