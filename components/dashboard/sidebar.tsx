"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    emoji: "🏡",
  },
  {
    title: "Repositories",
    href: "/dashboard/repos",
    emoji: "🌿",
  },
  {
    title: "Tasks",
    href: "/dashboard/all-tasks",
    emoji: "☀️",
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    emoji: "⚙️",
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {sidebarItems.map((item, index) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-[var(--organic-sage)]/30 text-[var(--organic-forest)]"
                : "text-[var(--organic-earth)] hover:bg-[var(--organic-sage)]/15 hover:text-[var(--organic-forest)]",
            )}
          >
            <span className="text-lg">{item.emoji}</span>
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
