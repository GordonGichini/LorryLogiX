import Link from "next/link";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/clients", label: "Clients" },
  { href: "/contracts", label: "Contracts" },
  { href: "/routes", label: "Routes" },
  { href: "/assets", label: "Lorries" },
  { href: "/drivers", label: "Drivers" },
  { href: "/trips", label: "Trips" },
  { href: "/fuel", label: "Fuel" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-200 bg-slate-950 text-slate-100 lg:flex lg:flex-col">
          <div className="border-b border-slate-800 px-6 py-5">
            <div className="text-xl font-semibold tracking-tight">LorryLogix</div>
            <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">Operations</div>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Operations</p>
                <h1 className="text-lg font-semibold text-slate-900">LorryLogix</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-sm text-slate-600 md:block">
                  Search
                </div>
                <div className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600">Alerts</div>
                <div className="rounded-full bg-slate-900 px-3 py-1 text-sm font-medium text-white">Nevila</div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
