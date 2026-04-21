/**
 * Typed fetch wrappers for the matching API. Uses /proxy to avoid CORS.
 */

const getBase = () =>
  typeof window !== "undefined"
    ? "/proxy"
    : process.env.NEXT_PUBLIC_API_BASE ?? "http://74.161.162.184:8000";

export interface LanguageRequirement {
  name: string;
  min_level?: string;
}

export interface JobMatchRequest {
  post_id?: number;
  title: string;
  description?: string;
  // Combined Skills + Education keyword field (hybrid BM25 + semantic search).
  skills_and_education?: string;
  // Closed-vocabulary industry label (one of /api/industries) or undefined.
  industry?: string;
  // Closed-vocabulary hierarchy level (one of /api/hierarchy-levels).
  expected_hierarchy_level?: string;
  location_lat: number;
  location_lon: number;
  radius_km?: number;
  pensum_min?: number;
  pensum_max?: number;
  required_languages?: LanguageRequirement[];
  required_available_before?: string | null;
  job_category_labels?: string[];
  max_results?: number;
  min_score?: number;
}

export interface ScoreBreakdown {
  total: number;
  raw_score?: number;
  title_score: number;
  industry_score: number;
  experience_score: number;
  skills_education_score: number;
  skills_education_keyword_score?: number;
  skills_education_semantic_score?: number;
  hierarchy_score: number;
  language_score?: number;
  total_formula?: string;
  score_calculation?: Array<{
    parameter: string;
    value: number;
    weight: number;
    contribution?: number;
  }>;
  score_display?: string;
  experience_detail?: {
    primary_years?: number;
    secondary_years?: number;
    primary_relevance?: number;
    exp_primary?: number;
    exp_secondary?: number;
  };
}

export interface WorkExperienceItem {
  raw_title: string;
  standardized_title: string;
  industry: string;
  start_year?: number | null;
  end_year?: number | null;
  years_in_role?: number | null;
  weighted_years?: number | null;
  // 0.0 means the role is outside the experience-score window (>15 years old)
  // and does not contribute to the experience dimension.
  recency_weight?: number | null;
}

export interface CandidateLanguage {
  lang: string;
  degree: string;
}

export interface CandidateMatch {
  post_id: number;
  score: ScoreBreakdown;
  rank?: number;
  rank_explanation?: string[];

  // Identity & contact
  candidate_name?: string;
  phone?: string;
  gender?: string;
  linkedin_url?: string;
  website_url?: string;
  cv_file?: string;

  // Profile text
  short_description?: string;
  job_expectations?: string;
  highest_degree?: string;
  ai_profile_description?: string;
  ai_experience_description?: string;
  ai_skills_description?: string;
  ai_text_skill_result?: string;

  // Experience & skills
  most_relevant_role: string;
  total_relevant_years: number;
  hierarchy_level: string;
  work_experiences?: WorkExperienceItem[];
  skills_text?: string;
  education_text?: string;
  most_experience_industries?: string[];
  top_industries: string[];
  // Normalized closed-vocabulary industries found across the candidate's history.
  industries?: string[];

  // Languages
  languages?: CandidateLanguage[];

  // Location
  location: string;
  zip_code?: string;
  work_radius_km?: number;
  work_radius_text?: string;

  // Availability & contract
  available_from?: string | null;
  pensum_desired: number;
  pensum_from?: number;
  pensum_duration?: string;
  on_contract_basis?: boolean;
  voluntary?: string;

  // Personal
  birth_year?: number | null;
  retired?: boolean;

  // Categories
  job_categories_primary?: string[];
  job_categories_secondary?: string[];

  // Profile meta
  profile_status?: string;
  registered_at?: string | null;
  expires_at?: string | null;
  featured?: boolean;
  post_date?: string | null;
}

export interface MatchResponse {
  matches: CandidateMatch[];
  message: string | null;
  total_above_threshold: number;
  applied_category_labels?: string[];
  applied_industry?: string | null;
  applied_hierarchy_level?: string | null;
}

export interface ConfigResponse {
  scoring_weights: Record<string, number>;
  min_score_raw: number;
  max_results: number;
}

export interface ConfigUpdate {
  scoring_weights?: Record<string, number>;
  min_score_raw?: number;
  max_results?: number;
}

export interface SyncResponse {
  ok: boolean;
  stdout?: string;
  stderr?: string;
  message?: string;
}

export interface HealthResponse {
  elasticsearch: string;
  database: string;
  checks?: {
    elasticsearch?: {
      cluster_name?: string;
      version?: string;
      cluster_status?: string;
      nodes?: number;
      active_shards_percent?: number;
      jobs_index_exists?: boolean;
      roundtrip_ms?: number;
      error_type?: string;
      error?: string;
    };
    database?: {
      select_1_ok?: boolean;
      db_name?: string;
      roundtrip_ms?: number;
      error_type?: string;
      error?: string;
    };
  };
}

export type ApiResult<T> = { data: T; latencyMs: number };
export type ApiError = { error: string; latencyMs: number };

async function fetchWithLatency<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResult<T> | ApiError> {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...options?.headers },
    });
    const text = await res.text();
    const latencyMs = Date.now() - start;
    if (!res.ok) {
      return { error: text || res.statusText, latencyMs };
    }
    const data = text ? (JSON.parse(text) as T) : ({} as T);
    return { data, latencyMs };
  } catch (e) {
    const latencyMs = Date.now() - start;
    return {
      error: e instanceof Error ? e.message : String(e),
      latencyMs,
    };
  }
}

export async function getHealth(): Promise<
  ApiResult<HealthResponse> | ApiError
> {
  return fetchWithLatency(`${getBase()}/api/health`);
}

export async function getConfig(): Promise<
  ApiResult<ConfigResponse> | ApiError
> {
  return fetchWithLatency(`${getBase()}/api/config`);
}

export async function patchConfig(
  body: ConfigUpdate
): Promise<ApiResult<ConfigResponse> | ApiError> {
  return fetchWithLatency(`${getBase()}/api/config`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function postMatch(
  body: JobMatchRequest
): Promise<ApiResult<MatchResponse> | ApiError> {
  return fetchWithLatency(`${getBase()}/api/match`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getJobMatches(
  postId: number
): Promise<ApiResult<MatchResponse> | ApiError> {
  return fetchWithLatency(`${getBase()}/api/jobs/${postId}/matches`);
}

export async function getCategories(): Promise<
  ApiResult<{ categories: string[] }> | ApiError
> {
  return fetchWithLatency(`${getBase()}/api/categories`);
}

export async function getIndustries(): Promise<
  ApiResult<{ industries: string[] }> | ApiError
> {
  return fetchWithLatency(`${getBase()}/api/industries`);
}

export async function getHierarchyLevels(): Promise<
  ApiResult<{ hierarchy_levels: string[] }> | ApiError
> {
  return fetchWithLatency(`${getBase()}/api/hierarchy-levels`);
}

export async function syncCandidates(): Promise<
  ApiResult<SyncResponse> | ApiError
> {
  return fetchWithLatency(`${getBase()}/api/index/candidates/sync`, {
    method: "POST",
  });
}

export async function syncJobs(): Promise<
  ApiResult<SyncResponse> | ApiError
> {
  return fetchWithLatency(`${getBase()}/api/index/jobs/sync`, {
    method: "POST",
  });
}

export function isError<T>(
  r: ApiResult<T> | ApiError
): r is ApiError {
  return "error" in r;
}
