"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bolt, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useJourneyStore } from "@/lib/store/journey-store";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const resetJourney = useJourneyStore((state) => state.resetJourney);

  return (
    <header className="sticky top-0 z-40 py-4">
      <div className="glass flex items-center justify-between rounded-full border border-border/80 px-4 py-3 shadow-sm">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Bolt className="size-5" />
          </div>
          <div>
            <div className="font-[var(--font-display)] text-lg font-semibold">WattSwitch</div>
            <div className="text-xs text-muted-foreground">Agent d'optimisation électrique</div>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Badge variant="accent" className="hidden sm:inline-flex">
            Démo hackathon 2026
          </Badge>
          {pathname !== "/" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                resetJourney();
                router.push("/");
              }}
            >
              <RotateCcw className="size-4" />
              Recommencer
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

