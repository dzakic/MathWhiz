
"use client";

import Link from "next/link";
import { Brain, Home, BarChart3, Loader2 } from "lucide-react"; // Added Loader2
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react"; // Added useState, useEffect

export function Header() {
  const pathname = usePathname();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/progress", label: "Progress", icon: BarChart3 },
  ];

  useEffect(() => {
    // Reset navigatingTo state when the pathname changes (navigation completes)
    if (navigatingTo) {
      setNavigatingTo(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // Only re-run when pathname changes

  const handleLinkClick = (href: string) => {
    if (pathname !== href) {
      setNavigatingTo(href);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2" onClick={() => handleLinkClick("/")}>
          <Brain className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-lg">
            Math Whiz
          </span>
        </Link>
        <nav className="flex flex-1 items-center space-x-2">
          {navItems.map((item) => {
            const isLoading = navigatingTo === item.href;
            return (
              <Button
                key={item.href}
                variant="ghost"
                asChild
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href && !isLoading // Don't apply active style if it's currently loading to that path from another
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
                disabled={isLoading}
              >
                <Link href={item.href} onClick={() => handleLinkClick(item.href)}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <item.icon className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? "Loading..." : item.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
