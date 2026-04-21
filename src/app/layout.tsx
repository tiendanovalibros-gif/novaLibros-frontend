import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth.context";
import LayoutShell from "@/components/layout-shell";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NovaLibros",
  description: "Tienda Novalibros",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.className} antialiased`}>
        <AuthProvider>
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
