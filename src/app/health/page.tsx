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
  const backendConnected = result != null && !isError(result);
  const esCheck = data?.checks?.elasticsearch;
  const dbCheck = data?.checks?.database;
  const esRawStatus = String(data?.elasticsearch ?? "");
  const esClusterStatus = (esCheck?.cluster_status ?? "").toLowerCase();
  const esStrictVariant =
    esRawStatus.startsWith("ok")
      ? esClusterStatus === "yellow"
        ? "warning"
        : esClusterStatus === "red"
          ? "destructive"
          : "success"
      : "destructive";
  const esStrictLabel =
    esRawStatus.startsWith("ok") && esClusterStatus
      ? `Elasticsearch: ${esRawStatus} (cluster ${esClusterStatus})`
      : `Elasticsearch: ${esRawStatus || "unknown"}`;

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
            <Badge variant={backendConnected ? "success" : "destructive"}>
              Backend API: {backendConnected ? "connected" : "disconnected"}
            </Badge>
            <Badge
              variant={esStrictVariant}
            >
              {esStrictLabel}
            </Badge>
            <Badge
              variant={
                String(data.database).startsWith("ok") ? "success" : "destructive"
              }
            >
              Database: {data.database}
            </Badge>
          </CardContent>
          <CardContent className="pt-0 text-xs text-muted-foreground space-y-1">
            {esCheck && (
              <p>
                ES check: cluster={esCheck.cluster_name ?? "?"} · status={esCheck.cluster_status ?? "?"}
                {" "}· nodes={esCheck.nodes ?? "?"} · jobs_index_exists={String(esCheck.jobs_index_exists)}
                {" "}· {esCheck.roundtrip_ms ?? "?"}ms
              </p>
            )}
            {dbCheck && (
              <p>
                DB check: select_1_ok={String(dbCheck.select_1_ok)} · db={dbCheck.db_name || "?"}
                {" "}· {dbCheck.roundtrip_ms ?? "?"}ms
              </p>
            )}
          </CardContent>
        </Card>
      )}
      {!data && result && (
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Badge variant="destructive">Backend API: disconnected</Badge>
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
