"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Search, Package, Calculator, User } from "lucide-react";

const NAV = [
  { href: "/",           icon: Home,       label: "Главная"     },
  { href: "/tracking",   icon: Search,     label: "Отследить"   },
  { href: "/services",   icon: Package,    label: "Услуги"      },
  { href: "/calculator", icon: Calculator, label: "Калькулятор" },
  { href: "/profile",    icon: User,       label: "Профиль"     },
];

export default function Navigation() {
  const path = usePathname();

  if (path.startsWith("/admin")) return null;

  return (
    <nav style={{
      position: "fixed",
      bottom: 0, left: 0, right: 0,
      zIndex: 500,
      background: "#fff",
      borderTop: "1.5px solid #dce4ef",
      padding: "8px 4px",
      boxShadow: "0 -4px 24px rgba(0,0,0,.08)",
      display: "flex",
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        width: "100%",
        maxWidth: 480,
        margin: "0 auto",
      }}>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = path === href || (href !== "/" && path.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "4px 2px",
              textDecoration: "none",
              color: active ? "#005eaa" : "#7a8fa8",
            }}>
              <div style={{
                width: 32, height: 32,
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 9,
                background: active ? "#e8f2fb" : "transparent",
              }}>
                <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              </div>
              <span style={{
                fontSize: 10, fontWeight: 600,
                fontFamily: "Geologica, sans-serif",
                lineHeight: 1,
              }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}