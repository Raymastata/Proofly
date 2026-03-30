import { Link } from 'react-router-dom';

/**
 * Shared chrome: nav, subtle grid background, footer — reads like a real product shell.
 */
export function AppShell({ children }) {

  return (
    <div className="relative min-h-full overflow-hidden flex flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 0%, rgb(45 212 191 / 0.12), transparent 45%), radial-gradient(circle at 80% 10%, rgb(167 139 250 / 0.14), transparent 40%), radial-gradient(circle at 50% 120%, rgb(56 189 248 / 0.08), transparent 55%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(148 163 184 / 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgb(148 163 184 / 0.18) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at top, black, transparent 70%)',
        }}
      />

      <header className="relative z-10 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="group flex items-center gap-2">
            <img src="/favicon.svg" alt="Proofly" className="h-8 w-8 object-contain" />
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-heading tracking-tighter font-extrabold text-white">Proofly</span>
                <span className="rounded border border-white/20 px-1 py-px text-[9px] font-semibold tracking-widest text-slate-400 uppercase leading-none select-none">BETA</span>
              </div>
              <div className="text-xs text-slate-400">Credibility intelligence</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-slate-300 sm:flex">
            <Link to="/product" className="hover:text-white">
              Product
            </Link>
            <Link to="/how-it-works" className="hover:text-white">
              How it works
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200 ring-1 ring-emerald-400/20 sm:inline">
              Demo environment
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-6 pb-16 pt-10">{children}</main>

      <footer className="relative z-10 border-t border-white/5 bg-slate-950/60 py-10 text-sm text-slate-500">
        <div className="mx-auto flex max-w-5xl flex-col justify-between gap-4 px-6 sm:flex-row sm:items-center">
          <div>© {new Date().getFullYear()} Proofly</div>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-slate-400 transition hover:text-white">
              Privacy
            </Link>
            <Link to="/security" className="text-slate-400 transition hover:text-white">
              Security
            </Link>
            <Link to="/terms" className="text-slate-400 transition hover:text-white">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
