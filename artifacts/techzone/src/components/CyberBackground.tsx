export function CyberBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background pointer-events-none">
      {/* deep radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 10%, hsl(var(--primary) / 0.10), transparent 45%), radial-gradient(circle at 85% 90%, hsl(var(--secondary) / 0.10), transparent 45%)",
        }}
      />
      {/* flat grid */}
      <div className="absolute inset-0 cyber-grid opacity-60" />
      {/* perspective horizon grid at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[45vh] cyber-grid-perspective opacity-40" />
      {/* scanlines */}
      <div className="absolute inset-0 scanlines opacity-40" />
      {/* vignette */}
      <div className="absolute inset-0 vignette" />
    </div>
  );
}
