export function CyberBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background pointer-events-none" style={{ contain: "paint" }}>
      {/* deep radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 10%, hsl(var(--primary) / 0.08), transparent 45%), radial-gradient(circle at 85% 90%, hsl(var(--secondary) / 0.08), transparent 45%)",
        }}
      />
      {/* flat grid - lighter opacity */}
      <div className="absolute inset-0 cyber-grid opacity-35" style={{ willChange: "transform", transform: "translateZ(0)" }} />
      {/* perspective horizon grid - lighter opacity */}
      <div className="absolute bottom-0 left-0 right-0 h-[45vh] cyber-grid-perspective opacity-20" style={{ willChange: "transform", transform: "translateZ(0)" }} />
      {/* vignette */}
      <div className="absolute inset-0 vignette" />
    </div>
  );
}
