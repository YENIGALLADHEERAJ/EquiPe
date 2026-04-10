"use client";

export default function AuroraBackground() {
  return (
    <div className="aurora-bg" aria-hidden="true">
      <div
        className="aurora-blob"
        style={{
          width: "700px",
          height: "700px",
          background: "radial-gradient(circle, #4f46e5 0%, transparent 70%)",
          top: "-200px",
          left: "-150px",
          animationDelay: "0s",
          animationDuration: "20s",
        }}
      />
      <div
        className="aurora-blob"
        style={{
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
          top: "30%",
          right: "-100px",
          animationDelay: "-6s",
          animationDuration: "24s",
        }}
      />
      <div
        className="aurora-blob"
        style={{
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, #0891b2 0%, transparent 70%)",
          bottom: "-100px",
          left: "30%",
          animationDelay: "-12s",
          animationDuration: "18s",
        }}
      />
      <div
        className="aurora-blob"
        style={{
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, #6d28d9 0%, transparent 70%)",
          top: "50%",
          left: "20%",
          animationDelay: "-3s",
          animationDuration: "22s",
        }}
      />
    </div>
  );
}
