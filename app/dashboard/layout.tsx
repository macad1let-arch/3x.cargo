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
  if (href === "/dashboard") {
    return pathname === href;
  }

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
        'button, a, [role="button"]',
      );

      controls.forEach((control) => {
        if (control.closest('nav[aria-label="Основная навигация"]')) {
          return;
        }

        const rect = control.getBoundingClientRect();
        const isBottomRight =
          rect.width >= 44 &&
          rect.width <= 90 &&
          rect.height >= 44 &&
          rect.height <= 90 &&
          rect.right >= window.innerWidth - 110 &&
          rect.bottom >= window.innerHeight - 170;

        if (!isBottomRight) return;

        let element: HTMLElement | null = control;
        let fixedContainer: HTMLElement | null = null;

        while (element && element !== document.body) {
          if (window.getComputedStyle(element).position === "fixed") {
            fixedContainer = element;
            break;
          }
          element = element.parentElement;
        }

        if (fixedContainer) {
          fixedContainer.style.setProperty("display", "none", "important");
        }
      });
    }

    hideFloatingChatButton();

    const observer = new MutationObserver(hideFloatingChatButton);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-[100dvh] overflow-x-clip bg-[#F6F8FB] text-[#101828]">
      <main className="mx-auto w-full max-w-[430px] pb-[calc(85px+env(safe-area-inset-bottom))]">
        {children}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 h-[calc(68px+env(safe-area-inset-bottom))] border-t border-[#E4E9F1] bg-white pb-[env(safe-area-inset-bottom)]"
        aria-label="Основная навигация"
      >
        <div className="mx-auto grid h-[68px] w-full max-w-[430px] grid-cols-5 px-2">
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
                    "relative -mt-[8px] flex min-w-0 flex-col",
                    "items-center justify-start gap-[3px] no-underline",
                    "text-[#0B318C]",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-[#1769E8] focus-visible:ring-offset-2",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "grid h-[50px] w-[50px] place-items-center rounded-full",
                      "border-[1.5px] border-white bg-[#0B318C] text-white",
                      "shadow-[0_4px_12px_rgba(11,49,140,0.18)]",
                      "transition-transform duration-150",
                      "hover:-translate-y-0.5 active:translate-y-0",
                    ].join(" ")}
                  >
                    <Icon size={26} strokeWidth={1.9} aria-hidden="true" />
                  </span>
                  <span className="text-[11px] font-semibold leading-[14px]">
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
                  "flex min-w-0 flex-col items-center justify-center gap-[5px]",
                  "rounded-xl px-1 py-[7px] no-underline",
                  "transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-[#1769E8] focus-visible:ring-offset-2",
                  active
                    ? "text-[#0B318C]"
                    : "text-[#7F8EA6] hover:text-[#667085]",
                ].join(" ")}
              >
                <Icon
                  size={23}
                  strokeWidth={active ? 2.2 : 1.8}
                  aria-hidden="true"
                />
                <span
                  className={[
                    "max-w-full truncate text-[11px] leading-[14px]",
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