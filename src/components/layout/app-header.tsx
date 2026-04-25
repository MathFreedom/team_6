"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bolt, ChevronLeft, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useJourneyStore } from "@/lib/store/journey-store";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const resetJourney = useJourneyStore((state) => state.resetJourney);
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-40 py-3">
      <div className="glass flex items-center justify-between gap-3 rounded-[28px] border border-border/80 px-3 py-3 shadow-sm sm:px-4">
        <div className="flex items-center gap-3">
          {!isHome ? (
            <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Back">
              <ChevronLeft className="size-5" />
            </Button>
          ) : null}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Bolt className="size-5" />
            </div>
            <div>
              <div className="font-[var(--font-display)] text-lg font-semibold">Nova</div>
              <div className="text-xs text-muted-foreground">Mobile AI agent · energy</div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="accent" className="hidden sm:inline-flex">
            Beta · Electricity
          </Badge>
          {isHome ? (
            <Link href="/connect">
              <Button size="sm" variant="accent">
                Get started
              </Button>
            </Link>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                resetJourney();
                router.push("/");
              }}
            >
              <RotateCcw className="size-4" />
              <span className="hidden sm:inline">Restart</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
