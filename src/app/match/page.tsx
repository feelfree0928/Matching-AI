"use client";

import { useState, useEffect } from "react";
import {
  postMatch,
  getCategories,
  getIndustries,
  getHierarchyLevels,
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

const NO_INDUSTRY = "__none__";
const ANY_HIERARCHY = "__any__";
const FALLBACK_INDUSTRIES: string[] = [
  "Automobilindustrie / Luftfahrt",
  "Banken / Finanzinstitute / Versicherungen",
  "Baugewerbe / Immobilien",
  "Beratung / Treuhand / Recht",
  "Bildungswesen",
  "Chemie / Pharma / Biotech / Medizintechnik",
  "Detail- / Grosshandel / Verkauf",
  "Dienstleistungen allgemein",
  "Energie- / Wasserwirtschaft",
  "Gastgewerbe / Hotellerie / Events",
  "Gesundheits- / Sozialwesen",
  "Gewerbe / Handwerk",
  "Industrie / Technik / Produktion",
  "Informatik / Telekommunikation",
  "Konsum- / Luxusgüterindustrie",
  "Kunst / Kultur",
  "Land- / Forstwirtschaft / Holz",
  "Lebensmittelindustrie",
  "Maschinen- / Anlagenbau",
  "Medien / Druckerei / Verlage",
  "Möbel- und Einrichtungsindustrie",
  "Mode und Textilien",
  "Öffentliche Verwaltung / Verbände",
  "Personalberatung",
  "Reinigung",
  "Sport",
  "Tourismus / Reisen / Freizeit",
  "Transport / Logistik / Verkehr",
  "Wissenschaft / Forschung",
  "Wohltätige Organisationen / Non-Profit",
];
const FALLBACK_HIERARCHY_LEVELS: string[] = [
  "Operative / Worker",
  "Specialist",
  "Middle Management",
  "Upper management",
  "C-Level",
  "Owner / Founder",
];

function normalizeOptions(values: string[] | undefined): string[] {
  if (!values?.length) return [];
  const deduped = new Set(values.map((v) => v.trim()).filter(Boolean));
  return Array.from(deduped);
}

const defaultRequest: JobMatchRequest = {
  title: "Senior Accountant",
  location_lat: 47.3769,
  location_lon: 8.5417,
  radius_km: 50,
  pensum_min: 0,
  pensum_max: 100,
  expected_hierarchy_level: undefined,
  max_results: undefined,
  required_languages: [],
  required_available_before: undefined,
  job_category_labels: undefined,
};

export default function MatchPage() {
  const [req, setReq] = useState<JobMatchRequest>(defaultRequest);
  const [result, setResult] = useState<
    Awaited<ReturnType<typeof postMatch>> | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [industries, setIndustries] = useState<string[]>([]);
  const [hierarchyLevels, setHierarchyLevels] = useState<string[]>([]);
  const [usingIndustryFallback, setUsingIndustryFallback] = useState(false);
  const [usingHierarchyFallback, setUsingHierarchyFallback] = useState(false);

  useEffect(() => {
    getCategories().then((r) => {
      if (!isError(r)) setCategories(r.data.categories ?? []);
      setCategoriesLoaded(true);
    });
    getIndustries().then((r) => {
      if (!isError(r)) {
        const options = normalizeOptions(r.data.industries);
        if (options.length > 0) {
          setIndustries(options);
          setUsingIndustryFallback(false);
        } else {
          setIndustries(FALLBACK_INDUSTRIES);
          setUsingIndustryFallback(true);
        }
        return;
      }
      setIndustries(FALLBACK_INDUSTRIES);
      setUsingIndustryFallback(true);
    });
    getHierarchyLevels().then((r) => {
      if (!isError(r)) {
        const options = normalizeOptions(r.data.hierarchy_levels);
        if (options.length > 0) {
          setHierarchyLevels(options);
          setUsingHierarchyFallback(false);
        } else {
          setHierarchyLevels(FALLBACK_HIERARCHY_LEVELS);
          setUsingHierarchyFallback(true);
        }
        return;
      }
      setHierarchyLevels(FALLBACK_HIERARCHY_LEVELS);
      setUsingHierarchyFallback(true);
    });
  }, []);

  const runMatch = async () => {
    setLoading(true);
    setResult(null);
    const payload = { ...req };
    if (payload.job_category_labels?.length === 0) {
      delete payload.job_category_labels;
    }
    if (!payload.industry) delete payload.industry;
    if (!payload.expected_hierarchy_level) delete payload.expected_hierarchy_level;
    if (!payload.skills_and_education?.trim()) delete payload.skills_and_education;
    const r = await postMatch(payload);
    setResult(r);
    setLoading(false);
  };

  const selectedCats = req.job_category_labels ?? [];
  const toggleCategory = (cat: string) => {
    setReq((p) => {
      const current = p.job_category_labels ?? [];
      const next = current.includes(cat)
        ? current.filter((c) => c !== cat)
        : [...current, cat];
      return { ...p, job_category_labels: next.length ? next : undefined };
    });
  };
  const clearCategories = () => {
    setReq((p) => ({ ...p, job_category_labels: undefined }));
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
            <Select
              value={req.industry ?? NO_INDUSTRY}
              onValueChange={(v) =>
                setReq((p) => ({ ...p, industry: v === NO_INDUSTRY ? undefined : v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_INDUSTRY}>
                  Any industry (no scoring effect)
                </SelectItem>
                {industries.map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Hard filter on the closed 30-label vocabulary. Selecting an industry
              returns <strong>only</strong> candidates with that industry in their
              history — enabling exact counts (e.g. &ldquo;C-Level AND Accounting&rdquo;).
            </p>
            {usingIndustryFallback && (
              <p className="text-xs text-amber-600">
                Using built-in fallback list because `/api/industries` is unavailable.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Hierarchy Level</Label>
            <Select
              value={req.expected_hierarchy_level ?? ANY_HIERARCHY}
              onValueChange={(v) =>
                setReq((p) => ({
                  ...p,
                  expected_hierarchy_level: v === ANY_HIERARCHY ? undefined : v,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select hierarchy level…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_HIERARCHY}>
                  Any hierarchy (no filter)
                </SelectItem>
                {hierarchyLevels.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Hard filter on the 6-level ladder. Selecting a level returns{" "}
              <strong>only</strong> candidates inferred to be at that exact level.
            </p>
            {usingHierarchyFallback && (
              <p className="text-xs text-amber-600">
                Using built-in fallback list because `/api/hierarchy-levels` is unavailable.
              </p>
            )}
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
            <Label>Skills &amp; Education</Label>
            <Textarea
              value={req.skills_and_education ?? ""}
              onChange={(e) =>
                setReq((p) => ({ ...p, skills_and_education: e.target.value || undefined }))
              }
              placeholder="IT skills, certifications, degrees… (one list, comma or newline separated)"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Searches both the candidate&rsquo;s skills and education text. Exact
              keywords (e.g. <code>SAP FI</code>) match precisely via BM25; related
              terms also match semantically.
            </p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Category filter (optional)</Label>
            <p className="text-xs text-muted-foreground">
              Leave empty to auto-detect from job title. Or select manually if the auto selection is wrong.
            </p>
            {!categoriesLoaded ? (
              <p className="text-sm text-muted-foreground">Loading categories…</p>
            ) : categories.length > 0 ? (
              <>
                <div className="max-h-40 overflow-y-auto rounded-md border p-2 space-y-1.5">
                  {categories.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-2 py-1"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCats.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="rounded"
                      />
                      <span className="text-sm">{cat}</span>
                    </label>
                  ))}
                </div>
                {selectedCats.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearCategories}
                  >
                    Clear ({selectedCats.length} selected)
                  </Button>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No categories available. Check backend DB connection.</p>
            )}
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
            <Label>Max results (blank = use config default)</Label>
            <Input
              type="number"
              placeholder="use config default"
              value={req.max_results ?? ""}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setReq((p) => ({ ...p, max_results: isNaN(v) ? undefined : v }));
              }}
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
            <p className="text-xs text-muted-foreground mt-1">
              Exact count for the selected hard filters (industry, hierarchy,
              category, location, languages). Damaged profiles (no usable
              experience) are excluded automatically.
            </p>
            {data.applied_category_labels && data.applied_category_labels.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Filtering by: {data.applied_category_labels.join(", ")}
                {" "}
                <span className="italic">— Wrong? Select categories manually above and run again.</span>
              </p>
            )}
            {data.applied_category_labels?.length === 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                No category filter applied (showing all candidates).
              </p>
            )}
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
        <div className="space-y-1">
          <p className="text-muted-foreground">{data.message}</p>
          {data.applied_category_labels && data.applied_category_labels.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Filter was: {data.applied_category_labels.join(", ")}. Try different categories or clear to show all.
            </p>
          )}
        </div>
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
