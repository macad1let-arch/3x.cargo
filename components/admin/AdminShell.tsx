"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  Boxes,
  Users,
  Warehouse,
  ClipboardList,
  CreditCard,
  CircleDollarSign,
  Target,
  MessageCircle,
  Bot,
  Handshake,
  BadgeJapaneseYen,
  GraduationCap,
  Bell,
  Megaphone,
  UserCog,
  BarChart3,
  Settings,
} from "lucide-react";

const menuItems = [
  { label: "Главная", href: "/admin", icon: Home },
  { label: "Посылки", href: "/admin/shipments", icon: Package },
  { label: "Партии", href: "/admin/batches", icon: Boxes },
  { label: "Клиенты", href: "/admin/clients", icon: Users },
  { label: "Склад", href: "/admin/warehouse", icon: Warehouse },
  { label: "Сортировка", href: "/admin/sorting", icon: ClipboardList },
  { label: "Касса", href: "/admin/cash", icon: CreditCard },
  { label: "Финансы", href: "/admin/finance", icon: CircleDollarSign },
  { label: "Заявки / Лиды", href: "/admin/leads", icon: Target },
  { label: "Диалоги", href: "/admin/dialogs", icon: MessageCircle },
  { label: "AI Ассистент", href: "/admin/ai", icon: Bot },
  { label: "Карго партнёры", href: "/admin/partners", icon: Handshake },
  { label: "Юани", href: "/admin/yuan", icon: BadgeJapaneseYen },
  { label: "Обучение", href: "/admin/education", icon: GraduationCap },
  { label: "Уведомления", href: "/admin/notifications", icon: Bell },
  { label: "Уведомления для клиентов", href: "/admin/client-notifications", icon: Megaphone },
  { label: "Сотрудники", href: "/admin/staff", icon: UserCog },
  { label: "Аналитика", href: "/admin/analytics", icon: BarChart3 },
  { label: "Настройки", href: "/admin/settings", icon: Settings },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const cargoName = "3X Cargo";
  const cargoSubtitle = "Карго из Китая";

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col bg-[#071a33] text-white">
          <div className="flex h-20 items-center gap-3 px-6">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-900/30">
              <span className="text-sm font-black tracking-tight text-white">
                3X
              </span>

              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-lg bg-white/95 text-blue-600 shadow-sm">
                <Package size={13} strokeWidth={2.4} />
              </div>
            </div>

            <div>
              <p className="text-lg font-black leading-none tracking-tight">
                {cargoName}
              </p>
              <p className="mt-1 text-xs text-white/50">CRM админ-панель</p>
            </div>
          </div>

          <nav className="admin-sidebar-scroll flex-1 space-y-1 overflow-y-auto px-4 pb-6 pr-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                      : "text-white/65 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="flex h-7 w-7 items-center justify-center">
                    <Icon size={20} strokeWidth={1.8} />
                  </span>

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="rounded-2xl bg-white/5 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-black text-white">
                  3X
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{cargoName}</p>
                  <p className="text-xs text-white/50">{cargoSubtitle}</p>
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-white/5 px-3 py-2">
                <p className="text-xs text-white/45">Роль</p>
                <p className="text-sm font-semibold text-white">Владелец</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="ml-[240px] min-h-screen flex-1 px-6 py-6">
          {children}
        </section>
      </div>
    </main>
  );
}