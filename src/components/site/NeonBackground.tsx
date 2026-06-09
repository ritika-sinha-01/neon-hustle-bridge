export function NeonBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 hustle-grid opacity-30" />
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#F5E400]/20 blur-[120px] animate-blob" />
      <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-[#FF0A78]/20 blur-[140px] animate-blob" style={{ animationDelay: "4s" }} />
      <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-[#FF0A78]/10 blur-[120px] animate-blob" style={{ animationDelay: "8s" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]" />
    </div>
  );
}