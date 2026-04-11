import type { Metadata } from "next";
import { Suspense } from "react";
import { ApiProvider } from "@/api/provider";
import { WatchTransitionProvider } from "@/components/watch-transition";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import "../styles/globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "SAPANA — Streaming",
  description: "3D Globe and Streaming Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(geist.variable, geistMono.variable, "dark")}>
      <body className="relative min-h-screen bg-background font-sans text-foreground antialiased selection:bg-brand/30 selection:text-foreground">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -top-40 left-1/2 h-[40rem] w-[60rem] -translate-x-1/2 rounded-full bg-brand/[0.08] blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-purple-500/[0.05] blur-3xl" />
        </div>

        <ApiProvider>
          <Suspense fallback={<div className="h-16" />}>
            <Navbar />
          </Suspense>
          <WatchTransitionProvider>
            <div className="pt-16">{children}</div>
            <Footer />
          </WatchTransitionProvider>
        </ApiProvider>
      </body>
    </html>
  );
}
