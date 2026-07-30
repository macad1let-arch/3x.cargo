"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Home,
  MessageCircleMore,
  Package,
  User,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  raised?: boolean;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Главная", icon: Home },
  { href: "/dashboard/orders", label: "Заказы", icon: Package },
  {
    href: "/dashboard/assistant",
    label: "Помощник",
    icon: MessageCircleMore,
    raised: true,
  },
  {
    href: "/dashboard/instructions",
    label: "Инструкции",
    icon: BookOpen,
  },
  { href: "/dashboard/profile", label: "Профиль", icon: User },
];

function isCurrentRoute(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    function hideFloatingChatButton() {
      const controls = document.querySelectorAll<HTMLElement>(
        'button, a, [role="button"]'
      );

      controls.forEach((control) => {
        if (control.closest('nav[aria-label="Основная навигация"]')) return;

        const rect = control.getBoundingClientRect();
        const isBottomCorner =
          rect.width >= 44 &&
          rect.width <= 90 &&
          rect.height >= 44 &&
          rect.height <= 90 &&
          rect.bottom >= window.innerHeight - 150 &&
          (rect.right >= window.innerWidth - 100 || rect.left <= 20);

        if (!isBottomCorner) return;

        let element: HTMLElement | null = control;
        while (element && element !== document.body) {
          if (window.getComputedStyle(element).position === "fixed") {
            element.style.setProperty("display", "none", "important");
            break;
          }
          element = element.parentElement;
        }
      });
    }

    hideFloatingChatButton();

    const observer = new MutationObserver(hideFloatingChatButton);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", hideFloatingChatButton);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", hideFloatingChatButton);
    };
  }, []);

  return (
    <div className="min-h-[100dvh] overflow-x-clip bg-white text-[#0A1E3D]">
      <main className="mx-auto w-full max-w-[430px] pb-[calc(72px+env(safe-area-inset-bottom))]">
        {children}
      </main>

      <nav
        aria-label="Основная навигация"
        className={[
          "fixed inset-x-0 bottom-0 z-50",
          "h-[calc(64px+env(safe-area-inset-bottom))]",
          "border-t border-[#E8EDF4]",
          "bg-white pb-[env(safe-area-inset-bottom)]",
        ].join(" ")}
      >
        <div className="mx-auto grid h-16 w-full max-w-[430px] grid-cols-5 px-1">
          {navItems.map(({ href, label, icon: Icon, raised }) => {
            const active = isCurrentRoute(pathname, href);

            if (raised) {
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  aria-label="Открыть чат с помощником"
                  className={[
                    "relative -mt-2 flex min-w-0 flex-col",
                    "items-center justify-start gap-0.5",
                    "rounded-2xl no-underline text-[#123B9F]",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-[#1769E8] focus-visible:ring-offset-2",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "grid h-[46px] w-[46px] place-items-center",
                      "rounded-full border-[3px] border-white",
                      "bg-[#123B9F] text-white",
                      "shadow-[0_4px_12px_rgba(18,59,159,0.16)]",
                      "transition-transform duration-150 active:scale-[0.97]",
                      active ? "ring-2 ring-[#DCE6FF]" : "",
                    ].join(" ")}
                  >
                    <Icon size={22} strokeWidth={1.9} aria-hidden="true" />
                  </span>

                  <span className="text-[10px] font-semibold leading-[13px] tracking-[-0.1px]">
                    {label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={[
                  "group relative flex min-w-0 flex-col",
                  "items-center justify-center gap-[2px]",
                  "rounded-xl px-0.5 py-1.5 no-underline",
                  "transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-[#1769E8] focus-visible:ring-offset-1",
                  active
                    ? "text-[#123B9F]"
                    : "text-[#8492A8] hover:text-[#52627A]",
                ].join(" ")}
              >
                <span className="relative grid h-7 w-8 place-items-center">
                  <Icon
                    size={21}
                    strokeWidth={active ? 2.05 : 1.8}
                    aria-hidden="true"
                  />

                  {active && (
                    <i
                      aria-hidden="true"
                      className="absolute -bottom-[1px] h-[3px] w-[3px] rounded-full bg-[#123B9F]"
                    />
                  )}
                </span>

                <span
                  className={[
                    "max-w-full truncate text-[10px] leading-[13px]",
                    "tracking-[-0.1px]",
                    active ? "font-semibold" : "font-medium",
                  ].join(" ")}
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