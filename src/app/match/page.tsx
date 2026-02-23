"use client";

import { useState } from "react";
import {
  postMatch,
  isError,
  type JobMatchRequest,
  type LanguageRequirement,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CandidateCard } from "@/components/candidate-card";
import { ResponsePanel } from "@/components/response-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SENIORITY_OPTIONS = [
  "junior",
  "mid",
  "senior",
  "manager",
  "director",
  "executive",
];

const defaultRequest: JobMatchRequest = {
  title: "Senior Accountant",
  location_lat: 47.3769,
  location_lon: 8.5417,
  radius_km: 50,
  pensum_min: 0,
  pensum_max: 100,
  expected_seniority_level: "senior",
  max_results: 20,
  required_languages: [],
  required_available_before: undefined,
};

export default function MatchPage() {
  const [req, setReq] = useState<JobMatchRequest>(defaultRequest);
  const [result, setResult] = useState<
    Awaited<ReturnType<typeof postMatch>> | null
  >(null);
  const [loading, setLoading] = useState(false);

  const runMatch = async () => {
    setLoading(true);
    setResult(null);
    const r = await postMatch(req);
    setResult(r);
    setLoading(false);
  };

  const data = result && !isError(result) ? result.data : null;
  const error = result && isError(result) ? result.error : undefined;
  const latencyMs = result?.latencyMs ?? 0;

  const addLanguage = () => {
    setReq((prev) => ({
      ...prev,
      required_languages: [
        ...(prev.required_languages ?? []),
        { name: "German", min_level: "B2" },
      ],
    }));
  };

  const removeLanguage = (i: number) => {
    setReq((prev) => ({
      ...prev,
      required_languages: prev.required_languages?.filter((_, j) => j !== i) ?? [],
    }));
  };

  const updateLang = (i: number, field: keyof LanguageRequirement, value: string) => {
    setReq((prev) => {
      const langs = [...(prev.required_languages ?? [])];
      if (!langs[i]) return prev;
      langs[i] = { ...langs[i], [field]: value };
      return { ...prev, required_languages: langs };
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Match (POST /api/match)</h1>

      <Card>
        <CardHeader>
          <CardTitle>Job</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={req.title}
              onChange={(e) => setReq((p) => ({ ...p, title: e.target.value }))}
              placeholder="Job title"
            />
          </div>
          <div className="space-y-2">
            <Label>Industry</Label>
            <Input
              value={req.industry ?? ""}
              onChange={(e) => setReq((p) => ({ ...p, industry: e.target.value || undefined }))}
              placeholder="Industry"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={req.description ?? ""}
              onChange={(e) => setReq((p) => ({ ...p, description: e.target.value || undefined }))}
              placeholder="Job description"
              rows={2}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Required skills</Label>
            <Textarea
              value={req.required_skills ?? ""}
              onChange={(e) => setReq((p) => ({ ...p, required_skills: e.target.value || undefined }))}
              placeholder="Skills (comma or newline)"
              rows={2}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Required education</Label>
            <Textarea
              value={req.required_education ?? ""}
              onChange={(e) => setReq((p) => ({ ...p, required_education: e.target.value || undefined }))}
              placeholder="Education"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Expected seniority</Label>
            <Select
              value={req.expected_seniority_level ?? "senior"}
              onValueChange={(v) =>
                setReq((p) => ({ ...p, expected_seniority_level: v }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SENIORITY_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Location lat</Label>
            <Input
              type="number"
              step="any"
              value={req.location_lat}
              onChange={(e) =>
                setReq((p) => ({ ...p, location_lat: parseFloat(e.target.value) || 0 }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Location lon</Label>
            <Input
              type="number"
              step="any"
              value={req.location_lon}
              onChange={(e) =>
                setReq((p) => ({ ...p, location_lon: parseFloat(e.target.value) || 0 }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Radius (km)</Label>
            <Input
              type="number"
              value={req.radius_km ?? 50}
              onChange={(e) =>
                setReq((p) => ({ ...p, radius_km: parseInt(e.target.value, 10) || 50 }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Pensum min</Label>
            <Input
              type="number"
              value={req.pensum_min ?? 0}
              onChange={(e) =>
                setReq((p) => ({ ...p, pensum_min: parseInt(e.target.value, 10) || 0 }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Pensum max</Label>
            <Input
              type="number"
              value={req.pensum_max ?? 100}
              onChange={(e) =>
                setReq((p) => ({ ...p, pensum_max: parseInt(e.target.value, 10) || 100 }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Available before (optional)</Label>
            <Input
              type="date"
              value={req.required_available_before ?? ""}
              onChange={(e) =>
                setReq((p) => ({
                  ...p,
                  required_available_before: e.target.value || undefined,
                }))
              }
              placeholder="yyyy-MM-dd"
            />
          </div>
          <div className="space-y-2">
            <Label>Max results</Label>
            <Input
              type="number"
              value={req.max_results ?? 20}
              onChange={(e) =>
                setReq((p) => ({ ...p, max_results: parseInt(e.target.value, 10) || 20 }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Min score (optional)</Label>
            <Input
              type="number"
              step="any"
              value={req.min_score ?? ""}
              onChange={(e) =>
                setReq((p) => ({
                  ...p,
                  min_score: e.target.value ? parseFloat(e.target.value) : undefined,
                }))
              }
              placeholder="Leave empty for default"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <div className="flex items-center justify-between">
              <Label>Languages</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLanguage}>
                Add
              </Button>
            </div>
            {(req.required_languages ?? []).map((lang, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Language name"
                  value={lang.name}
                  onChange={(e) => updateLang(i, "name", e.target.value)}
                />
                <Input
                  placeholder="Min level (B2, C1, native)"
                  value={lang.min_level ?? ""}
                  onChange={(e) => updateLang(i, "min_level", e.target.value)}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeLanguage(i)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={runMatch} disabled={loading}>
        {loading ? "Running…" : "Run Match"}
      </Button>

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

      {data?.message && data.matches.length === 0 && (
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
