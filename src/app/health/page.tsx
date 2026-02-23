"use client";

import { useEffect, useState } from "react";
import { getHealth, isError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResponsePanel } from "@/components/response-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HealthPage() {
  const [result, setResult] = useState<
    Awaited<ReturnType<typeof getHealth>> | null
  >(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    const r = await getHealth();
    setResult(r);
    setLoading(false);
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const data = result && !isError(result) ? result.data : null;
  const error = result && isError(result) ? result.error : undefined;
  const latencyMs = result?.latencyMs ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Health</h1>
        <Button onClick={fetchHealth} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </Button>
      </div>

      {data && (
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Badge
              variant={
                String(data.elasticsearch).startsWith("ok") ? "success" : "destructive"
              }
            >
              Elasticsearch: {data.elasticsearch}
            </Badge>
            <Badge
              variant={
                String(data.database).startsWith("ok") ? "success" : "destructive"
              }
            >
              Database: {data.database}
            </Badge>
          </CardContent>
        </Card>
      )}

      <ResponsePanel
        data={data ?? (error ? undefined : null)}
        latencyMs={latencyMs}
        error={error}
      />
    </div>
  );
}
