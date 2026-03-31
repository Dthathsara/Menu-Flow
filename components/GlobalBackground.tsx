export function GlobalBackground() {
  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 [background:var(--page-gradient)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1]"
      >
        <div className="global-glow global-glow-left" />
        <div className="global-glow global-glow-right" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[2]"
      >
        <div className="global-background-grid absolute inset-0 [background-image:var(--grid-pattern)] [background-size:40px_40px]" />
        <div className="absolute inset-x-0 top-0 h-40 [background-image:var(--top-wash)]" />
      </div>
    </>
  );
}
