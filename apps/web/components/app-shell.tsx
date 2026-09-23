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
    <div className="min-h-screen text-[#292b27]">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-[#555d4d] bg-[#3f4938] text-[#f1f0e8] lg:flex">
          <div className="border-b border-[#626b59] px-6 py-6">
            <div className="flex items-center gap-3 text-xl font-semibold tracking-[-0.03em]"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#d6d8c6] text-[#3f4938]">L</span>LorryLogix</div>
            <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c3c8b5]">Fleet operations</div>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-5">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#d7dacd] transition hover:bg-[#55604d] hover:text-white"
              >
                <span aria-hidden="true" className="grid h-6 w-6 place-items-center rounded-md border border-[#77806b] text-[#c8ccbd] transition group-hover:border-[#d6d8c6] group-hover:text-white"><item.icon size={14} strokeWidth={1.8} /></span>{item.label}
              </Link>
            ))}
          </nav>
          <div className="m-4 rounded-xl border border-[#65705b] bg-[#495441] p-4"><div className="eyebrow !text-[#cdd1c2]">System status</div><div className="mt-3 flex items-center gap-2 text-sm text-[#eef0e8]"><CircleCheck size={15} className="text-[#c9b98d]" /> API connected</div></div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-[#d5d4cb] bg-[#f7f6f1]/85 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-8">
              <div>
                <p className="eyebrow">Operations / Kenya</p>
                <h1 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#292b27]">LorryLogix control room</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-lg border border-[#d5d4cb] bg-[#ebe9e2] px-3 py-2 text-xs text-[#777970] md:flex">
                  <Search size={14} aria-hidden="true" /> Search fleet
                </div>
                <div aria-label="Alerts" className="grid h-9 w-9 place-items-center rounded-lg border border-[#d5d4cb] text-sm text-[#65685f]"><Bell size={16} strokeWidth={1.8} /></div>
                <div className="flex items-center gap-2 rounded-lg bg-[#d8d9c9] px-3 py-2 text-xs font-semibold text-[#3f4938]"><span className="grid h-5 w-5 place-items-center rounded-md bg-[#66705b] text-[10px] text-white">N</span>Nevila</div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
