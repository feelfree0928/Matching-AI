"use client";

import { useEffect, useState } from "react";
import {
  getConfig,
  patchConfig,
  isError,
  type ConfigResponse,
  type ConfigUpdate,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResponsePanel } from "@/components/response-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DEFAULT_WEIGHTS: Record<string, number> = {
  title: 0.15,
  industry: 0.12,
  experience: 0.25,
  skills_education: 0.4,
  hierarchy: 0.06,
  language: 0.02,
};
const DEFAULT_MIN_SCORE_RAW = 1.55;
const DEFAULT_MAX_RESULTS = 20;

export default function ConfigPage() {
  const [config, setConfig] = useState<ConfigResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastResult, setLastResult] = useState<
    Awaited<ReturnType<typeof getConfig>> | Awaited<ReturnType<typeof patchConfig>> | null
  >(null);
  const [weights, setWeights] = useState<Record<string, number>>(DEFAULT_WEIGHTS);
  const [minScoreRaw, setMinScoreRaw] = useState(DEFAULT_MIN_SCORE_RAW);
  const [maxResults, setMaxResults] = useState(DEFAULT_MAX_RESULTS);

  const loadConfig = async () => {
    setLoading(true);
    setLastResult(null);
    const r = await getConfig();
    setLastResult(r);
    setLoading(false);
    if (r && !isError(r)) {
      setConfig(r.data);
      setWeights(r.data.scoring_weights ?? DEFAULT_WEIGHTS);
      setMinScoreRaw(r.data.min_score_raw ?? DEFAULT_MIN_SCORE_RAW);
      setMaxResults(r.data.max_results ?? DEFAULT_MAX_RESULTS);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setLastResult(null);
    const r = await patchConfig({
      scoring_weights: weights,
      min_score_raw: minScoreRaw,
      max_results: maxResults,
    });
    setLastResult(r);
    setSaving(false);
    if (r && !isError(r)) setConfig(r.data);
  };

  const handleReset = async () => {
    setWeights({ ...DEFAULT_WEIGHTS });
    setMinScoreRaw(DEFAULT_MIN_SCORE_RAW);
    setMaxResults(DEFAULT_MAX_RESULTS);
    setSaving(true);
    setLastResult(null);
    const r = await patchConfig({
      scoring_weights: DEFAULT_WEIGHTS,
      min_score_raw: DEFAULT_MIN_SCORE_RAW,
      max_results: DEFAULT_MAX_RESULTS,
    });
    setLastResult(r);
    setSaving(false);
    if (r && !isError(r)) setConfig(r.data);
  };

  const weightKeys = Object.keys(weights);
  const displayData = lastResult && !isError(lastResult) ? lastResult.data : config;
  const error = lastResult && isError(lastResult) ? lastResult.error : undefined;
  const latencyMs = lastResult?.latencyMs ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Config (GET + PATCH /api/config)</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadConfig} disabled={loading}>
            {loading ? "Loading…" : "Reload"}
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scoring weights</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {weightKeys.map((key) => (
            <div key={key} className="space-y-2">
              <Label>{key}</Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                max={1}
                value={weights[key] ?? 0}
                onChange={(e) =>
                  setWeights((p) => ({
                    ...p,
                    [key]: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Threshold & results</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>min_score_raw</Label>
            <Input
              type="number"
              step="0.01"
              value={minScoreRaw}
              onChange={(e) =>
                setMinScoreRaw(parseFloat(e.target.value) || DEFAULT_MIN_SCORE_RAW)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>max_results</Label>
            <Input
              type="number"
              min={1}
              value={maxResults}
              onChange={(e) =>
                setMaxResults(parseInt(e.target.value, 10) || DEFAULT_MAX_RESULTS)
              }
            />
          </div>
        </CardContent>
      </Card>

      {(displayData || error) && (
        <ResponsePanel
          data={displayData ?? null}
          latencyMs={latencyMs}
          error={error}
        />
      )}
    </div>
  );
}
