"use client";

import type { CandidateMatch } from "@/lib/api";
import { ScoreBar } from "@/components/score-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CandidateCardProps {
  candidate: CandidateMatch;
  rank: number;
}

function rankBadgeVariant(rank: number): "default" | "secondary" | "outline" {
  if (rank === 1) return "default";
  if (rank === 2) return "secondary";
  return "outline";
}

export function CandidateCard({ candidate, rank }: CandidateCardProps) {
  const displayRank = candidate.rank ?? rank;
  const exp = candidate.work_experiences ?? [];
  const languages = candidate.languages ?? [];
  const explanation = candidate.rank_explanation ?? [];
  const primaryCats = candidate.job_categories_primary ?? [];
  const secondaryCats = candidate.job_categories_secondary ?? [];

  const name = candidate.candidate_name?.trim() || "";
  const age =
    candidate.birth_year && candidate.birth_year > 1900
      ? new Date().getFullYear() - candidate.birth_year
      : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        {/* ── Header row ─────────────────────────────────────────── */}
        <div className="flex flex-wrap items-start gap-2">
          <Badge variant={rankBadgeVariant(displayRank)}>#{displayRank}</Badge>
          <Badge variant="outline">Score: {candidate.score.total.toFixed(1)}</Badge>
          {candidate.featured && <Badge variant="secondary">Featured</Badge>}
          {candidate.retired && <Badge variant="outline">Retired</Badge>}
          {candidate.on_contract_basis && <Badge variant="outline">Contract</Badge>}
        </div>

        {/* ── Identity ───────────────────────────────────────────── */}
        <div className="mt-1">
          {name ? (
            <h3 className="text-base font-semibold">{name}</h3>
          ) : (
            <h3 className="text-sm text-muted-foreground">post_id {candidate.post_id}</h3>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">
            post_id {candidate.post_id}
            {candidate.seniority_level ? ` · ${candidate.seniority_level}` : ""}
            {candidate.gender ? ` · ${candidate.gender}` : ""}
            {age ? ` · Age ~${age}` : ""}
            {candidate.location ? ` · ${candidate.location}` : ""}
            {candidate.zip_code ? ` (${candidate.zip_code})` : ""}
          </p>
        </div>

        {/* ── Score breakdown ────────────────────────────────────── */}
        {candidate.score.score_display ? (
          <p className="text-sm text-muted-foreground mt-1 break-words" title={candidate.score.total_formula}>
            {candidate.score.score_display}
          </p>
        ) : null}
        <ScoreBar score={candidate.score} />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Short bio ──────────────────────────────────────────── */}
        {candidate.short_description && (
          <section>
            <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground tracking-wide">
              Profile Summary
            </h4>
            <p className="text-sm whitespace-pre-wrap">{candidate.short_description}</p>
          </section>
        )}

        {/* ── AI Profile Description ─────────────────────────────── */}
        {candidate.ai_profile_description && (
          <section>
            <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground tracking-wide">
              AI Profile
            </h4>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
              {candidate.ai_profile_description}
            </p>
          </section>
        )}

        <Separator />

        {/* ── Career History ─────────────────────────────────────── */}
        {exp.length > 0 && (
          <section>
            <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground tracking-wide">
              Career History
            </h4>
            <ul className="space-y-1 text-sm">
              {exp.map((e, i) => {
                const yrs = e.years_in_role ?? e.weighted_years;
                const range =
                  e.start_year != null && e.end_year != null
                    ? `${e.start_year}–${e.end_year}`
                    : e.start_year != null
                      ? `from ${e.start_year}`
                      : "";
                return (
                  <li key={i} className="flex flex-wrap gap-x-2">
                    <span className="font-medium">{e.raw_title || e.standardized_title || "—"}</span>
                    {e.standardized_title &&
                      e.standardized_title !== "NONE" &&
                      e.standardized_title !== e.raw_title && (
                        <span className="text-muted-foreground text-xs">[{e.standardized_title}]</span>
                      )}
                    {range && <span className="text-muted-foreground text-xs">({range})</span>}
                    {yrs != null && <span className="text-muted-foreground text-xs">{yrs} yrs</span>}
                    {e.industry && <span className="text-muted-foreground text-xs">· {e.industry}</span>}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* ── AI Experience Description ──────────────────────────── */}
        {candidate.ai_experience_description && (
          <section>
            <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground tracking-wide">
              AI Experience Summary
            </h4>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
              {candidate.ai_experience_description}
            </p>
          </section>
        )}

        {/* ── Skills ─────────────────────────────────────────────── */}
        {(candidate.skills_text || candidate.ai_skills_description || candidate.ai_text_skill_result) && (
          <section>
            <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground tracking-wide">
              Skills & Competencies
            </h4>
            {candidate.skills_text && (
              <p className="text-sm whitespace-pre-wrap">{candidate.skills_text}</p>
            )}
            {candidate.ai_skills_description && !candidate.skills_text && (
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                {candidate.ai_skills_description}
              </p>
            )}
            {candidate.ai_text_skill_result && (
              <p className="text-xs text-muted-foreground mt-1">{candidate.ai_text_skill_result}</p>
            )}
          </section>
        )}

        {/* ── Education ──────────────────────────────────────────── */}
        {(candidate.education_text || candidate.highest_degree) && (
          <section>
            <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground tracking-wide">
              Education & Certifications
            </h4>
            {candidate.highest_degree && (
              <p className="text-xs font-medium text-muted-foreground mb-0.5">
                Highest degree: {candidate.highest_degree}
              </p>
            )}
            {candidate.education_text && (
              <p className="text-sm whitespace-pre-wrap">{candidate.education_text}</p>
            )}
          </section>
        )}

        {/* ── Job Expectations ───────────────────────────────────── */}
        {candidate.job_expectations && (
          <section>
            <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground tracking-wide">
              What They&apos;re Looking For
            </h4>
            <p className="text-sm whitespace-pre-wrap">{candidate.job_expectations}</p>
          </section>
        )}

        <Separator />

        {/* ── Languages ──────────────────────────────────────────── */}
        {languages.length > 0 && (
          <section>
            <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground tracking-wide">
              Languages
            </h4>
            <div className="flex flex-wrap gap-1">
              {languages.map((l, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {l.lang}{l.degree ? ` · ${l.degree}` : ""}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* ── Work Preferences ───────────────────────────────────── */}
        <section className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div>
            <span className="text-xs text-muted-foreground">Pensum: </span>
            {candidate.pensum_from != null && candidate.pensum_from > 0
              ? `${candidate.pensum_from}–${candidate.pensum_desired}%`
              : `${candidate.pensum_desired}%`}
            {candidate.pensum_duration ? ` (${candidate.pensum_duration})` : ""}
          </div>
          {candidate.work_radius_km != null && (
            <div>
              <span className="text-xs text-muted-foreground">Radius: </span>
              {candidate.work_radius_text || `${candidate.work_radius_km} km`}
            </div>
          )}
          {candidate.available_from && (
            <div>
              <span className="text-xs text-muted-foreground">Available from: </span>
              {candidate.available_from}
            </div>
          )}
          {candidate.voluntary && (
            <div>
              <span className="text-xs text-muted-foreground">Voluntary: </span>
              {candidate.voluntary}
            </div>
          )}
        </section>

        {/* ── Industries ─────────────────────────────────────────── */}
        {((candidate.most_experience_industries ?? []).length > 0 ||
          candidate.top_industries.length > 0) && (
          <section>
            <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground tracking-wide">
              Industries
            </h4>
            <div className="flex flex-wrap gap-1">
              {(
                candidate.most_experience_industries?.length
                  ? candidate.most_experience_industries
                  : candidate.top_industries
              ).map((ind, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {ind}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* ── Categories ─────────────────────────────────────────── */}
        {(primaryCats.length > 0 || secondaryCats.length > 0) && (
          <section>
            <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground tracking-wide">
              Job Categories
            </h4>
            <div className="flex flex-wrap gap-1">
              {primaryCats.map((c, i) => (
                <Badge key={`p-${i}`} variant="default" className="text-xs">
                  {c}
                </Badge>
              ))}
              {secondaryCats.map((c, i) => (
                <Badge key={`s-${i}`} variant="outline" className="text-xs">
                  {c}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* ── Contact & Links ────────────────────────────────────── */}
        {(candidate.phone || candidate.linkedin_url || candidate.website_url) && (
          <section>
            <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground tracking-wide">
              Contact
            </h4>
            <div className="flex flex-wrap gap-3 text-sm">
              {candidate.phone && (
                <span>
                  <span className="text-xs text-muted-foreground">Phone: </span>
                  {candidate.phone}
                </span>
              )}
              {candidate.linkedin_url && (
                <a
                  href={candidate.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-xs"
                >
                  LinkedIn ↗
                </a>
              )}
              {candidate.website_url && (
                <a
                  href={candidate.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-xs"
                >
                  Website ↗
                </a>
              )}
            </div>
          </section>
        )}

        {/* ── Profile Meta ───────────────────────────────────────── */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground border-t pt-2">
          {candidate.profile_status && (
            <span>Status: {candidate.profile_status}</span>
          )}
          {candidate.registered_at && (
            <span>Registered: {candidate.registered_at}</span>
          )}
          {candidate.expires_at && (
            <span>Expires: {candidate.expires_at}</span>
          )}
          {candidate.post_date && (
            <span>Posted: {candidate.post_date.slice(0, 10)}</span>
          )}
        </div>

        {/* ── Why ranked #N ──────────────────────────────────────── */}
        {explanation.length > 0 && (
          <section className="rounded-md border bg-muted/30 p-3">
            <h4 className="mb-2 text-sm font-medium">Why ranked #{displayRank}</h4>
            <ul className="list-inside list-disc space-y-0.5 text-sm">
              {explanation.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
