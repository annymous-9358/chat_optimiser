import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const bars = [60, 110, 170, 110, 60];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 48 }}>
          {bars.map((h, i) => (
            <div
              key={i}
              style={{ width: 22, height: h, borderRadius: 11, background: "white" }}
            />
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 96, fontWeight: 700, color: "white", letterSpacing: -2 }}>
          Convey
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "rgba(255,255,255,0.85)", marginTop: 16 }}>
          Write with the perfect tone
        </div>
      </div>
    ),
    { ...size },
  );
}
