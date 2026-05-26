import Link from "next/link";

export default function AppShell({
  children,
  userEmail,
  active,
}: {
  children: React.ReactNode;
  userEmail: string;
  active: "form" | "history";
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-slate-200/70">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <Link href="/form" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </span>
            <span className="font-semibold tracking-tight">Protocol EcoCord</span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/form"
              className={`btn-ghost ${active === "form" ? "bg-slate-100 text-slate-900" : ""}`}
            >
              Examinare nouă
            </Link>
            <Link
              href="/history"
              className={`btn-ghost ${active === "history" ? "bg-slate-100 text-slate-900" : ""}`}
            >
              Istoric
            </Link>
            <div className="hidden md:flex items-center gap-2 ml-3 pl-3 border-l border-slate-200">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-medium flex items-center justify-center">
                {(userEmail[0] ?? "u").toUpperCase()}
              </div>
              <span className="text-sm text-slate-600 max-w-[180px] truncate">{userEmail}</span>
            </div>
            <form action="/auth/signout" method="post">
              <button className="btn-ghost" title="Deconectare">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
