export function GradientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 10% 10%, oklch(0.65 0.15 200 / 0.4) 0%, transparent 50%),
            radial-gradient(circle at 90% 90%, oklch(0.75 0.12 160 / 0.3) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, oklch(0.55 0.1 220 / 0.2) 0%, transparent 70%),
            radial-gradient(circle at 80% 20%, oklch(0.65 0.15 200 / 0.2) 0%, transparent 40%),
            oklch(0.12 0.02 240)
          `,
        }}
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 1px,
              oklch(0.98 0.01 240 / 0.02) 1px,
              oklch(0.98 0.01 240 / 0.02) 2px
            )
          `,
        }}
      />
    </div>
  );
}
