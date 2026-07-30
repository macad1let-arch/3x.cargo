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
        'button, a, [role="button"]',
      );

      controls.forEach((control) => {
        if (control.closest('nav[aria-label="Основная навигация"]')) return;
        if (control.closest('[data-dashboard-assistant="true"]')) return;

        const rect = control.getBoundingClientRect();
        const isBottomCorner =
          rect.width >= 44 &&
          rect.width <= 90 &&
          rect.height >= 44 &&
          rect.height <= 90 &&
          rect.bottom >= window.innerHeight - 160 &&
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
      <main className="mx-auto w-full max-w-[430px] pb-[calc(90px+env(safe-area-inset-bottom))]">
        {children}
      </main>

      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] translate-z-0"
        style={{ transform: "translateZ(0)" }}
      >
        <nav
          aria-label="Основная навигация"
          className={[
            "pointer-events-auto relative w-full",
            "h-[calc(76px+env(safe-area-inset-bottom))]",
            "border-t border-[#E4EAF2]",
            "bg-white/98 pb-[env(safe-area-inset-bottom)]",
            "shadow-[0_-3px_14px_rgba(10,30,61,0.045)]",
            "backdrop-blur-[14px]",
          ].join(" ")}
        >
          <div className="mx-auto grid h-[76px] w-full max-w-[430px] grid-cols-5 px-1.5">
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
                      "relative -mt-2.5 flex min-w-0 flex-col",
                      "items-center justify-start gap-1",
                      "rounded-[18px] no-underline text-[#123B9F]",
                      "focus-visible:outline-none focus-visible:ring-2",
                      "focus-visible:ring-[#1769E8] focus-visible:ring-offset-2",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "grid h-[52px] w-[52px] place-items-center",
                        "rounded-full border-[3px] border-white",
                        "bg-[#123B9F] text-white",
                        "shadow-[0_5px_14px_rgba(18,59,159,0.18)]",
                        "transition-transform duration-150 active:scale-[0.97]",
                        active ? "ring-2 ring-[#DCE6FF]" : "",
                      ].join(" ")}
                    >
                      <Icon size={25} strokeWidth={1.9} aria-hidden="true" />
                    </span>

                    <span className="text-[11px] font-semibold leading-[14px] tracking-[-0.1px]">
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
                    "items-center justify-center gap-1",
                    "rounded-[14px] px-0.5 py-1.5 no-underline",
                    "transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-[#1769E8] focus-visible:ring-offset-1",
                    active
                      ? "text-[#123B9F]"
                      : "text-[#8492A8] hover:text-[#52627A]",
                  ].join(" ")}
                >
                  <span className="relative grid h-8 w-10 place-items-center">
                    <Icon
                      size={24}
                      strokeWidth={active ? 2.1 : 1.85}
                      aria-hidden="true"
                    />

                    {active && (
                      <i
                        aria-hidden="true"
                        className="absolute -bottom-px h-1 w-1 rounded-full bg-[#123B9F]"
                      />
                    )}
                  </span>

                  <span
                    className={[
                      "max-w-full truncate text-[11px] leading-[14px]",
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
    </div>
  );
}