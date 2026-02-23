"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/health", label: "Health" },
  { href: "/match", label: "Match" },
  { href: "/jobs", label: "Job Matches" },
  { href: "/config", label: "Config" },
  { href: "/sync", label: "Sync" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-2 border-b px-4 py-3">
      <Link
        href="/"
        className="mr-4 font-semibold text-foreground hover:underline"
      >
        API Tester
      </Link>
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
            pathname === href ? "bg-muted text-foreground" : "text-muted-foreground"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
