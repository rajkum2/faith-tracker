"use client";

import React from "react";
import Link from "next/link";
import { Map, PlusCircle, MapPin, LayoutGrid } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Map Search", icon: Map },
  { href: "/submit-listing", label: "Submit Listing", icon: PlusCircle },
  { href: "/submit-project", label: "Submit Project", icon: MapPin },
  { href: "/manage-layouts", label: "Manage Layouts", icon: LayoutGrid },
];

export default function SiteFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Footer Main */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/assets/img/faith-tracker-logo.svg"
              alt="Faith Tracker"
              className="h-7 brightness-0 invert"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </Link>

          {/* Quick Links */}
          <nav className="flex flex-wrap items-center justify-center gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <link.icon size={14} />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-slate-800/50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 text-center">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Faith Tracker. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
