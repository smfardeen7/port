/**
 * Ambient background: three slow-drifting aurora blobs, a dotted grid that
 * fades toward the top, and a fine grain layer. Purely decorative and fixed
 * behind all content. Motion is paused via prefers-reduced-motion in CSS.
 */
export default function Aurora() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="aurora-blob left-[-10%] top-[-15%] h-[46rem] w-[46rem] animate-aurora"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, hsl(var(--aurora-1) / 0.9), transparent 60%)",
        }}
      />
      <div
        className="aurora-blob right-[-15%] top-[10%] h-[40rem] w-[40rem] animate-aurora-slow"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, hsl(var(--aurora-2) / 0.8), transparent 62%)",
        }}
      />
      <div
        className="aurora-blob bottom-[-20%] left-[20%] h-[38rem] w-[38rem] animate-aurora"
        style={{
          animationDelay: "-8s",
          background:
            "radial-gradient(circle at 50% 50%, hsl(var(--aurora-3) / 0.7), transparent 60%)",
        }}
      />

      <div className="absolute inset-0 grid-fade" />
      <div className="absolute inset-0 grain" />
    </div>
  );
}
