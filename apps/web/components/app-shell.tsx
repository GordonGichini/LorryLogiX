import Link from "next/link";
import { ArrowUpRight, Bell, CircleCheck, FileText, Fuel, LayoutDashboard, Route, Search, Truck, UserRound, UsersRound } from "lucide-react";

const navigation = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: UsersRound },
  { href: "/contracts", label: "Contracts", icon: FileText },
  { href: "/routes", label: "Routes", icon: Route },
  { href: "/assets", label: "Lorries", icon: Truck },
  { href: "/drivers", label: "Drivers", icon: UserRound },
  { href: "/trips", label: "Trips", icon: ArrowUpRight },
  { href: "/fuel", label: "Fuel", icon: Fuel },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-[#1c2835]">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-[#304963] bg-[#172b42] text-[#edf2f6] lg:flex">
          <div className="border-b border-[#304963] px-6 py-6">
            <div className="flex items-center gap-3 text-xl font-semibold tracking-[-0.03em]"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#c8d5e0] text-[#172b42]">L</span>LorryLogix</div>
            <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#aebdcb]">Fleet operations</div>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-5">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#c9d4df] transition hover:bg-[#27415e] hover:text-white"
              >
                <span aria-hidden="true" className="grid h-6 w-6 place-items-center rounded-md border border-[#526b84] text-[#b8c7d5] transition group-hover:border-[#c8d5e0] group-hover:text-white"><item.icon size={14} strokeWidth={1.8} /></span>{item.label}
              </Link>
            ))}
          </nav>
          <div className="m-4 rounded-xl border border-[#3d5a76] bg-[#203951] p-4"><div className="eyebrow !text-[#b8c7d5]">System status</div><div className="mt-3 flex items-center gap-2 text-sm text-[#eef3f7]"><CircleCheck size={15} className="text-[#9eb7cc]" /> API connected</div></div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-[#d1d9e0] bg-[#f5f7f8]/88 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-8">
              <div>
                <p className="eyebrow">Operations / Kenya</p>
                <h1 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#1c2835]">LorryLogix control room</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-lg border border-[#d1d9e0] bg-[#e8edf2] px-3 py-2 text-xs text-[#6c7782] md:flex">
                  <Search size={14} aria-hidden="true" /> Search fleet
                </div>
                <div aria-label="Alerts" className="grid h-9 w-9 place-items-center rounded-lg border border-[#d1d9e0] text-sm text-[#607080]"><Bell size={16} strokeWidth={1.8} /></div>
                <div className="flex items-center gap-2 rounded-lg bg-[#d5e0e9] px-3 py-2 text-xs font-semibold text-[#27415e]"><span className="grid h-5 w-5 place-items-center rounded-md bg-[#5c7894] text-[10px] text-white">N</span>Nevila</div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
