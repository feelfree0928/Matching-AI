"use client";

import { useState } from "react";
import { syncCandidates, syncJobs, isError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ResponsePanel } from "@/components/response-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SyncPage() {
  const [candidatesResult, setCandidatesResult] = useState<
    Awaited<ReturnType<typeof syncCandidates>> | null
  >(null);
  const [jobsResult, setJobsResult] = useState<
    Awaited<ReturnType<typeof syncJobs>> | null
  >(null);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(false);

  const runCandidatesSync = async () => {
    setCandidatesLoading(true);
    setCandidatesResult(null);
    const r = await syncCandidates();
    setCandidatesResult(r);
    setCandidatesLoading(false);
  };

  const runJobsSync = async () => {
    setJobsLoading(true);
    setJobsResult(null);
    const r = await syncJobs();
    setJobsResult(r);
    setJobsLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Sync</h1>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Candidates sync (POST /api/index/candidates/sync)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runCandidatesSync} disabled={candidatesLoading}>
              {candidatesLoading ? "Running…" : "Trigger Sync"}
            </Button>
            {candidatesResult && (
              <>
                {!isError(candidatesResult) && candidatesResult.data?.ok !== undefined && (
                  <p className="text-sm">
                    ok: {String(candidatesResult.data.ok)}
                    {candidatesResult.data.stdout && (
                      <pre className="mt-2 overflow-auto rounded border bg-muted/50 p-2 text-xs">
                        {candidatesResult.data.stdout}
                      </pre>
                    )}
                    {candidatesResult.data.stderr && (
                      <pre className="mt-2 overflow-auto rounded border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">
                        {candidatesResult.data.stderr}
                      </pre>
                    )}
                  </p>
                )}
                <ResponsePanel
                  data={
                    !isError(candidatesResult) ? candidatesResult.data : null
                  }
                  latencyMs={candidatesResult.latencyMs}
                  error={isError(candidatesResult) ? candidatesResult.error : undefined}
                />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jobs sync (POST /api/index/jobs/sync)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runJobsSync} disabled={jobsLoading}>
              {jobsLoading ? "Running…" : "Trigger Sync"}
            </Button>
            {jobsResult && (
              <>
                {!isError(jobsResult) && jobsResult.data?.message && (
                  <p className="text-sm text-muted-foreground">
                    {jobsResult.data.message}
                  </p>
                )}
                <ResponsePanel
                  data={!isError(jobsResult) ? jobsResult.data : null}
                  latencyMs={jobsResult.latencyMs}
                  error={isError(jobsResult) ? jobsResult.error : undefined}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
