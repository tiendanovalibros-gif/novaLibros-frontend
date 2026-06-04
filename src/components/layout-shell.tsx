"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";

const HIDDEN_LAYOUT_ROUTES = new Set(["/login", "/register"]);

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const hideLayout = Array.from(HIDDEN_LAYOUT_ROUTES).some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (hideLayout) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
