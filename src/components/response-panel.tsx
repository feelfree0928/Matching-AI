"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ResponsePanelProps {
  data: unknown;
  latencyMs: number;
  error?: string;
  className?: string;
}

export function ResponsePanel({
  data,
  latencyMs,
  error,
  className,
}: ResponsePanelProps) {
  const variant =
    latencyMs <= 500 ? "success" : latencyMs <= 2000 ? "warning" : "destructive";
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Badge variant={variant}>{latencyMs} ms</Badge>
        {error && (
          <Badge variant="destructive">Error</Badge>
        )}
      </div>
      <pre className="max-h-96 overflow-auto rounded-md border bg-muted/50 p-4 text-xs">
        {error
          ? error
          : typeof data === "string"
            ? data
            : data != null
              ? JSON.stringify(data, null, 2)
              : "(no data)"}
      </pre>
    </div>
  );
}
