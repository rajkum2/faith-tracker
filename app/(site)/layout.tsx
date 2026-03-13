"use client";

import { usePathname } from "next/navigation";
import { FaithTrackerI18nProvider } from "@/lib/faith-tracker-i18n";
import SiteHeader from "@/components/faith-tracker/site-header";
import SiteFooter from "@/components/faith-tracker/site-footer";

const IMMERSIVE_ROUTES = new Set([
  "/",
  "/telangana",
  "/manage-layouts",
]);

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isImmersiveRoute = pathname ? IMMERSIVE_ROUTES.has(pathname) : false;

  return (
    <FaithTrackerI18nProvider>
      <div className={isImmersiveRoute ? "h-screen flex flex-col bg-white overflow-hidden" : "min-h-screen flex flex-col bg-[#f8f9fb]"}>
        <SiteHeader />
        <main className={isImmersiveRoute ? "flex-1 min-h-0 overflow-hidden" : "flex-1"}>
          {children}
        </main>
        {!isImmersiveRoute && <SiteFooter />}
      </div>
    </FaithTrackerI18nProvider>
  );
}
