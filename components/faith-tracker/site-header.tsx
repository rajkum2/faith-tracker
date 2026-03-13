"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Menu, X, Map, PlusCircle, MapPin, LayoutGrid, MapPinned
} from "lucide-react";
import { Logo } from "./logo";

/* ───── Simplified Navigation for Faith Tracker ───── */

const NAV_ITEMS = [
  { label: "India Map", href: "/", icon: Map },
  { label: "Telangana", href: "/telangana", icon: MapPinned },
  { label: "Submit Listing", href: "/submit-listing", icon: PlusCircle },
  { label: "Submit Project", href: "/submit-project", icon: MapPin },
  { label: "Manage Layouts", href: "/manage-layouts", icon: LayoutGrid },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname?.startsWith(href + "/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo - Left aligned */}
          <Link href="/" className="flex-shrink-0">
            <Logo size="sm" />
          </Link>

          {/* Desktop nav links - Right aligned */}
          <nav className="hidden md:flex items-center gap-1 ml-auto">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors",
                  isActive(item.href)
                    ? "text-primary font-medium bg-primary/5"
                    : "text-slate-600 hover:text-primary hover:bg-slate-50"
                )}
              >
                <item.icon size={14} />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-primary rounded-md"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                  isActive(item.href)
                    ? "text-primary bg-primary/5 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
