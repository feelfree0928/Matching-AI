"use client";

import { cn } from "@/lib/utils";

export interface ScoreBreakdownBar {
  total: number;
  title_score: number;
  industry_score: number;
  experience_score: number;
  skills_score: number;
  seniority_score: number;
  education_score: number;
  language_score?: number;
}

const DIMS = [
  { key: "title_score", label: "Title", color: "bg-blue-500" },
  { key: "industry_score", label: "Ind", color: "bg-emerald-500" },
  { key: "experience_score", label: "Exp", color: "bg-amber-500" },
  { key: "skills_score", label: "Skills", color: "bg-violet-500" },
  { key: "seniority_score", label: "Sen", color: "bg-rose-500" },
  { key: "education_score", label: "Edu", color: "bg-cyan-500" },
  { key: "language_score", label: "Lang", color: "bg-teal-500" },
] as const;

export function ScoreBar({ score }: { score: ScoreBreakdownBar }) {
  const total =
    (score.title_score ?? 0) +
    (score.industry_score ?? 0) +
    (score.experience_score ?? 0) +
    (score.skills_score ?? 0) +
    (score.seniority_score ?? 0) +
    (score.education_score ?? 0) +
    (score.language_score ?? 0);
  const scale = total > 0 ? 100 / total : 0;
  return (
    <div className="flex h-6 w-full min-w-[120px] overflow-hidden rounded-md border bg-muted/30">
      {DIMS.map(({ key, color }) => {
        const value = score[key as keyof ScoreBreakdownBar] ?? 0;
        const pct = Math.max(0, Math.min(100, value * scale));
        return (
          <div
            key={key}
            className={cn("transition-all", color)}
            style={{ width: `${pct}%` }}
            title={`${key}: ${value.toFixed(1)}`}
          />
        );
      })}
    </div>
  );
}
