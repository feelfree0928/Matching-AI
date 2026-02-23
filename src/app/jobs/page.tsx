"use client";

import { useState } from "react";
import { getJobMatches, isError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CandidateCard } from "@/components/candidate-card";
import { ResponsePanel } from "@/components/response-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function JobsPage() {
  const [postId, setPostId] = useState("");
  const [result, setResult] = useState<
    Awaited<ReturnType<typeof getJobMatches>> | null
  >(null);
  const [loading, setLoading] = useState(false);

  const fetchMatches = async () => {
    const id = parseInt(postId, 10);
    if (Number.isNaN(id) || id < 1) {
      setResult({ error: "Enter a valid post_id (positive integer)", latencyMs: 0 });
      return;
    }
    setLoading(true);
    setResult(null);
    const r = await getJobMatches(id);
    setResult(r);
    setLoading(false);
  };

  const data = result && !isError(result) ? result.data : null;
  const error = result && isError(result) ? result.error : undefined;
  const latencyMs = result?.latencyMs ?? 0;
  const is404 = typeof error === "string" && (error.includes("404") || error.includes("not found"));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Job Matches (GET /api/jobs/:post_id/matches)</h1>

      <Card>
        <CardHeader>
          <CardTitle>Indexed job</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="space-y-2">
            <Label>Job post_id</Label>
            <Input
              type="number"
              min={1}
              value={postId}
              onChange={(e) => setPostId(e.target.value)}
              placeholder="e.g. 123"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={fetchMatches} disabled={loading}>
              {loading ? "Loading…" : "Fetch Matches"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {is404 && (
        <Alert variant="destructive">
          <AlertTitle>Job not found</AlertTitle>
          <AlertDescription>
            No job with post_id {postId} in Elasticsearch. Index jobs first or use a valid ID.
          </AlertDescription>
        </Alert>
      )}

      {data?.matches && data.matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Matches ({data.total_above_threshold} above threshold)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.matches.map((m, i) => (
                <CandidateCard key={m.post_id} candidate={m} rank={i + 1} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data?.message && data.matches.length === 0 && !is404 && (
        <p className="text-muted-foreground">{data.message}</p>
      )}

      {(data || error) && (
        <ResponsePanel
          data={data ?? null}
          latencyMs={latencyMs}
          error={error}
        />
      )}
    </div>
  );
}
