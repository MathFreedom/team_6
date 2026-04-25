import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-6">
        <div className="rounded-full bg-rose-100 p-3 text-rose-700">
          <AlertTriangle className="size-5" />
        </div>
        <div>
          <h2 className="font-[var(--font-display)] text-xl font-semibold">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}

