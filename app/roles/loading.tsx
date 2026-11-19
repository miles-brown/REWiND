export default function RolesLoading() {
  return (
    <div className="page-shell">
      <header className="page-hero">
        <span className="eyebrow">CONSTITUTIONAL SUCCESSION</span>
        <h1>Offices & Leadership</h1>
        <p>Loading chronological succession records and scrollytelling timelines...</p>
      </header>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "flex",
            gap: "12px",
            overflowX: "auto",
            marginBottom: "32px",
            paddingBottom: "8px",
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: "160px",
                height: "44px",
                borderRadius: "999px",
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
          ))}
        </div>

        <div
          style={{
            height: "180px",
            borderRadius: "16px",
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            marginBottom: "32px",
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "360px 1fr",
            gap: "32px",
          }}
        >
          <div
            style={{
              height: "400px",
              borderRadius: "16px",
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: "220px",
                  borderRadius: "16px",
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
