"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Globe, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type FormEvent,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/?browse=all", label: "Browse" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(pathname === "/search");
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathname === "/search") {
      setSearchOpen(true);
      setQuery(searchParams.get("q") ?? "");
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!searchOpen) return;
    const trimmed = query.trim();
    const t = setTimeout(() => {
      if (trimmed.length === 0) {
        if (pathname === "/search") router.replace("/search");
        return;
      }
      const next = `/search?q=${encodeURIComponent(trimmed)}`;
      if (pathname === "/search") {
        router.replace(next);
      } else {
        router.push(next);
      }
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, searchOpen]);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setQuery("");
    if (pathname === "/search") router.push("/");
  }, [pathname, router]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length === 0) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || pathname !== "/"
          ? "bg-background/85 backdrop-blur-xl border-b border-border/40"
          : "bg-gradient-to-b from-background/80 via-background/40 to-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-[1800px] items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <Globe className="h-6 w-6 text-brand drop-shadow-[0_0_12px_oklch(0.78_0.14_70/0.6)]" />
            </motion.div>
            <span className="bg-gradient-to-r from-foreground via-foreground to-brand bg-clip-text text-xl font-bold tracking-tight text-transparent">
              SAPANA
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href.split("?")[0];
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-md bg-white/5"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait" initial={false}>
            {searchOpen ? (
              <motion.form
                key="search-form"
                onSubmit={onSubmit}
                initial={{ width: 40, opacity: 0 }}
                animate={{ width: "min(320px, 60vw)", opacity: 1 }}
                exit={{ width: 40, opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                className="relative flex items-center"
              >
                <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") closeSearch();
                  }}
                  placeholder="Search videos, creators..."
                  className="h-9 w-full rounded-full border border-border/60 bg-background/70 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none backdrop-blur-xl transition-colors focus:border-brand/60 focus:ring-2 focus:ring-brand/20"
                />
                <button
                  type="button"
                  onClick={closeSearch}
                  className="absolute right-2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.form>
            ) : (
              <motion.button
                key="search-button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                onClick={openSearch}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/40 text-muted-foreground backdrop-blur-xl transition-all hover:border-brand/40 hover:text-foreground"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </header>
  );
}
