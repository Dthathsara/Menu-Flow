export function GlobalBackground() {
  return (
    <>
      <div
        aria-hidden="true"
        className="global-background-base fixed inset-0 z-0"
      />
      <div
        aria-hidden="true"
        className="global-background-glow-layer pointer-events-none fixed inset-0 z-[1] overflow-visible"
      >
        <div className="global-glow-orb global-glow-left" />
        <div className="global-glow-orb global-glow-right" />
      </div>
      <div
        aria-hidden="true"
        className="global-background-grid-layer pointer-events-none fixed inset-0 z-[2]"
      >
        <div className="global-background-grid absolute inset-0 [background-image:var(--grid-pattern)] [background-size:40px_40px]" />
        <div className="absolute inset-x-0 top-0 h-40 [background-image:var(--top-wash)]" />
      </div>
    </>
  );
}
