export default function PeopleLoading() {
  return (
    <div className="page-shell" aria-busy="true" aria-label="Loading people directory">
      <header className="page-hero">
        <span className="eyebrow">PEOPLE</span>
        <h1>Lives in the record</h1>
        <p>Loading documented historical figures and sovereigns...</p>
      </header>

      <div className="people-grid" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, idx) => (
          <div
            key={idx}
            className="person-card-skeleton"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "20px",
              background: "rgba(9, 19, 26, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "10px",
              minHeight: "110px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.05)",
                animation: "pulse 1.8s infinite ease-in-out",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
              <div
                style={{
                  width: "30%",
                  height: "12px",
                  borderRadius: "4px",
                  background: "rgba(255, 255, 255, 0.04)",
                  animation: "pulse 1.8s infinite ease-in-out",
                }}
              />
              <div
                style={{
                  width: "70%",
                  height: "18px",
                  borderRadius: "4px",
                  background: "rgba(255, 255, 255, 0.08)",
                  animation: "pulse 1.8s infinite ease-in-out",
                }}
              />
              <div
                style={{
                  width: "90%",
                  height: "12px",
                  borderRadius: "4px",
                  background: "rgba(255, 255, 255, 0.04)",
                  animation: "pulse 1.8s infinite ease-in-out",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
