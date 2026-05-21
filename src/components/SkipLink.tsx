export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-6 focus:py-3 focus:bg-emerald-500 focus:text-slate-950 focus:rounded-xl focus:font-mono focus:text-xs focus:font-bold focus:uppercase focus:tracking-widest focus:shadow-xl focus:outline-none"
    >
      Skip to main content
    </a>
  );
}
