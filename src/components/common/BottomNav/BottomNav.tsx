"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Calendar,
  PlusCircle,
  BarChart3,
  BookOpen,
  Settings,
} from "lucide-react";
import type { NavItem } from "@/types";

const navItems: NavItem[] = [
  {
    name: "Home",
    href: "/home",
    icon: Home,
  },
  {
    name: "Plan",
    href: "/plan",
    icon: Calendar,
  },
  {
    name: "Log",
    href: "/log",
    icon: PlusCircle,
  },
  {
    name: "Baseline",
    href: "/baseline",
    icon: BarChart3,
  },
  {
    name: "Glossary",
    href: "/glossary",
    icon: BookOpen,
  },
];

interface BottomNavProps {
  className?: string;
}

/**
 * Bottom navigation component for mobile-first navigation
 * Includes all main app sections with proper accessibility
 */
export function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed right-0 bottom-0 left-0 z-50 border-t backdrop-blur",
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="grid h-16 grid-cols-5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs transition-colors",
                "min-h-[44px] min-w-[44px]", // Accessibility: 44px touch targets
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
                "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="leading-none">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Settings button component for the bottom nav area
 * Positioned separately from main nav items
 */
export function SettingsButton() {
  const pathname = usePathname();
  const isActive = pathname === "/settings";

  return (
    <Link
      href="/settings"
      className={cn(
        "bg-background fixed right-4 bottom-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border shadow-lg transition-colors",
        isActive
          ? "text-primary border-primary"
          : "text-muted-foreground hover:text-foreground hover:border-border",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      )}
      aria-label="Settings"
      aria-current={isActive ? "page" : undefined}
    >
      <Settings className="h-5 w-5" aria-hidden="true" />
    </Link>
  );
}
