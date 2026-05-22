export default function BackgroundGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute top-10 right-0 h-[420px] w-[420px] rounded-full bg-violet-500/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-[360px] w-[360px] rounded-full bg-blue-500/10 blur-3xl" />
    </div>
  );
}