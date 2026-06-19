"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, BookOpen, Gift, User } from "lucide-react";

const navItems = [
  { href: "/dashboard",           label: "Главная",    icon: Home     },
  { href: "/dashboard/orders",    label: "Заказы",     icon: Package  },
  { href: "/dashboard/instructions", label: "Инструкция", icon: BookOpen },
  { href: "/dashboard/bonuses",   label: "Бонусы",     icon: Gift     },
  { href: "/dashboard/profile",   label: "Профиль",    icon: User     },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <main className="pb-24">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1 px-3 py-1"
              >
                <Icon
                  size={22}
                  className={isActive ? "text-[#005eaa]" : "text-slate-400"}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span
                  className={`text-[11px] font-medium ${
                    isActive ? "text-[#005eaa]" : "text-slate-400"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}