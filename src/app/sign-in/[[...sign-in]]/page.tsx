"use client";

import { SignIn } from "@clerk/nextjs";

const features = [
  { icon: "🎬", label: "Multi-Clip", desc: "Timeline editing" },
  { icon: "✨", label: "Transitions", desc: "15+ effects" },
  { icon: "🎨", label: "Filters", desc: "Real-time preview" },
  { icon: "📦", label: "Export", desc: "HD output" },
];

export default function SignInPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1a1a2e",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "40px 20px",
      }}
    >
      {/* Gradient orbs */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,92,252,0.15) 0%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          right: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "30%",
          right: "20%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(147,51,234,0.1) 0%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "8px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #3b82f6, #7c5cfc, #9333ea)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
          </svg>
        </div>
        <span
          style={{
            fontSize: "24px",
            fontWeight: 800,
            background: "linear-gradient(135deg, #e8e8f0, #7c5cfc)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          FrameCut
        </span>
      </div>

      {/* Tagline */}
      <p
        style={{
          color: "#8888a8",
          fontSize: "14px",
          marginBottom: "32px",
          position: "relative",
          zIndex: 1,
        }}
      >
        Sign in to your video editing workspace
      </p>

      {/* Clerk SignIn */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <SignIn />
      </div>

      {/* Feature highlights */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "40px",
          position: "relative",
          zIndex: 1,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {features.map((f) => (
          <div
            key={f.label}
            style={{
              background: "rgba(37,37,69,0.6)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              padding: "12px 16px",
              textAlign: "center",
              minWidth: "110px",
            }}
          >
            <div style={{ fontSize: "20px", marginBottom: "4px" }}>{f.icon}</div>
            <div style={{ color: "#e8e8f0", fontSize: "12px", fontWeight: 600 }}>
              {f.label}
            </div>
            <div style={{ color: "#555570", fontSize: "11px" }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Privacy badge */}
      <p
        style={{
          color: "#555570",
          fontSize: "11px",
          marginTop: "24px",
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#555570"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        100% browser-based — your videos never leave your device
      </p>
    </div>
  );
}
