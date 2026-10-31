/**
 * Data contracts and UI types for Yojana Sahayak frontend.
 */

export type Language = 'hi' | 'en';
export type Theme = 'dark' | 'light';

export interface SchemeItem {
  scheme_id: string;
  code: string;
  name_en: string;
  name_hi: string;
  short_name?: string;
  level: string;
  ministry_or_dept?: string;
  category: string;
  description_en: string;
  description_hi: string;
  initial_mode: string;
  rule_scope: string;
  rag_enabled: boolean;
  rules_enabled: boolean;
  official_portal_url?: string;
  benefits_summary_en?: string;
  benefits_summary_hi?: string;
}

export interface SourceRecord {
  source_id: string;
  name: string;
  base_url: string;
  source_family: string;
  jurisdiction: string;
  language_hints?: string[];
  source_role?: string;
  adapter_key: string;
  fetch_mode?: string;
  allowed_content_types?: string[];
  permission_status: string;
  automation_status: string;
  written_authorization_reference?: string;
  robots_checked_at?: string;
  terms_checked_at?: string;
  can_run_automatically?: boolean;
  compliance_block_reason?: string;
  notes?: string;
  schedule_cron: string;
  enabled: boolean;
  last_success_at?: string;
  last_error_at?: string;
  last_error_code?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  evidence_badge?: 'STRONG' | 'PARTIAL' | 'INSUFFICIENT';
  citations?: CitationReference[];
  timestamp: string;
}

export interface CitationReference {
  chunk_id: string;
  document_version_id: string;
  page_number: number;
  document_title: string;
  quote_snippet: string;
}

export interface QuestionnaireAnswer {
  question_id: string;
  value: string | number | boolean;
  status: 'answered' | 'not_sure' | 'skipped';
}

export interface CitizenProfile {
  age?: number;
  state?: string;
  occupation?: string;
  education_level?: string;
  annual_income_band?: string;
  gender?: string;
  social_category?: string;
  is_differently_abled?: boolean;
}

export interface EligibilityResult {
  scheme_id: string;
  scheme_name: string;
  status: 'Eligible' | 'Likely Eligible' | 'Need More Information' | 'Not Eligible';
  matched_rules: string[];
  unmet_rules: string[];
  missing_information: string[];
  reason: string;
}

export interface DiscoveryJob {
  id: string;
  source_id: string;
  trigger_type: 'scheduled' | 'manual';
  status: 'queued' | 'running' | 'completed' | 'completed_with_warnings' | 'failed';
  pages_discovered: number;
  pages_fetched: number;
  candidates_created: number;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
}

export interface ResourceCandidate {
  id: string;
  source_id: string;
  canonical_url: string;
  original_url: string;
  content_type: string;
  binary_sha256: string;
  title?: string;
  issuer?: string;
  detected_date?: string;
  classification: 'new_resource' | 'changed_binary' | 'changed_content' | 'duplicate';
  review_status: 'pending_review' | 'approved' | 'rejected' | 'duplicate';
  review_notes?: string;
  assigned_scheme_id?: string;
  created_at: string;
}

export interface AuditRecord {
  id: string;
  actor: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details?: Record<string, any>;
  created_at: string;
}
