import Link from "next/link";
import { Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const LINK_GROUPS = [
  {
    heading: "Explore",
    links: [
      { href: "/", label: "Home" },
      { href: "/search", label: "Search" },
    ],
  },
  {
    heading: "Platform",
    links: [
      { href: "http://localhost", label: "MediaCMS" },
      { href: "/", label: "About" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border/40">
      <div className="mx-auto max-w-[1800px] px-4 py-12 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-brand drop-shadow-[0_0_12px_oklch(0.78_0.14_70/0.5)]" />
              <span className="bg-gradient-to-r from-foreground to-brand bg-clip-text text-base font-bold tracking-tight text-transparent">
                SAPANA
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A cinematic streaming experience built on a 3D globe — discover
              stories from every corner of the world.
            </p>
          </div>

          {LINK_GROUPS.map((group) => (
            <div key={group.heading}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/80">
                {group.heading}
              </h3>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-border/40" />

        <p className="text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()} Sapana. A 3D globe and streaming
          platform.
        </p>
      </div>
    </footer>
  );
}
