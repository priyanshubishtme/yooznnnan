# Yojana Sahayak: Implementation Status

Tracking implementation progress across the 10-phase roadmap based on Technical Blueprint V2 (INNOVISTA Problem Statement 03).
Preserving full product scope with zero feature deletion.

---

## Roadmap Overview & Status

| Phase | Description | Original Blueprint Phases | Status | Gate Checklist |
|---|---|---|---|---|
| **Phase 1** | **Foundation and Design System** | Phases 0 & 1 | **COMPLETED** | [x] Backend starts, [x] Frontend starts, [x] DB migrates from empty, [x] No secrets committed, [x] All public, citizen & admin routes navigable |
| **Phase 2** | **Source Registry, Compliance Gate & Scheduler** | Phases 2 & 3 | **COMPLETED** | [x] Prohibited/pending source cannot run automatically, [x] Scheduler runs once, [x] Jobs idempotent, [x] Failures observable |
| **Phase 3** | **Discovery, Fetching & Admin Review Console** | Phases 4 & 5 | **COMPLETED** | [x] New/changed/unchanged classified correctly on fixtures, [x] No candidate public/searchable before approval |
| **Phase 4** | **PDF Ingestion & Coordinate Extraction** | Phase 6 | **COMPLETED** | [x] Every chunk keeps page and boxes, [x] Spot-checks pass, [x] One single shared ingestion path |
| **Phase 5** | **Structured Schemes & Eligibility Rule Review** | Phase 7 | **COMPLETED** | [x] Every active rule has verified quote & page, [x] Source change disables rules until re-approved, [x] 13 initial scheme records |
| **Phase 6** | **Hybrid Retrieval & Groq RAG Chat** | Phases 8 & 9 | *Pending* | [ ] Only current verified versions retrieved, [ ] Zero hallucinated citation IDs, [ ] Unsupported questions refused, [ ] Final answer validated |
| **Phase 7** | **Deterministic Eligibility & Ranking** | Phase 10 | *Pending* | [ ] 25 profiles match expected outcomes, [ ] Zero needs_review rules produce output, [ ] Three-valued logic & explainability |
| **Phase 8** | **Citizen Application, PDF Evidence Viewer & 3D Experience** | Phase 11 | *Pending* | [ ] End-to-end journeys pass on mobile/desktop, [ ] Source chips open exact PDF highlight boxes, [ ] 3D landing page responsive |
| **Phase 9** | **PWA, Offline, Voice, My Schemes & Notifications** | Phases 12 & 13 | *Pending* | [ ] Saved schemes open offline, [ ] Chat/eligibility network-only, [ ] Voice text fallback, [ ] Verified email unsubscribe works |
| **Phase 10** | **Evaluation, Security, Deployment & Demo** | Phase 14 | *Pending* | [ ] Full test suites pass, [ ] Security & dependency review, [ ] Rate limits active, [ ] Production deployment scripts verified |

---

## Phase 5 Detail Checklist (Structured Schemes & Eligibility Rule Review) — Passed

- [x] **13 Initial Scheme Records & Initial Modes (`registry/schemes.yaml`)**:
  - All 13 initial schemes seeded with bilingual descriptions, level, ministry, category, and initial modes (`rules_and_rag`, `rag_and_rules`, `rag_only`).
  - Core schemes with human-verified rules (`SCHEME-PM-KISAN`, `SCHEME-PM-JAY`, `SCHEME-PMAY-G`, `SCHEME-UK-OLD-AGE`) marked `rules_enabled=True`.
  - Remaining verified schemes configured as `rag_only` awaiting human rule review, preserving strict trust separation.
- [x] **Eligibility Rule Tree Schema & Validation (`backend/app/rules/schema.py`)**:
  - Deterministic condition trees with `all` (AND), `any` (OR), and explicit `exceptions` (disqualification filters).
  - Rich operators: `equals`, `not_equals`, `greater_than_or_equal`, `less_than_or_equal`, `between_inclusive` (with `min`/`max` validation), `in_list`, `is_true`, `is_false`.
  - Mandatory evidence provenance models (`RuleSourceRef`): target `document_version_id`, 1-indexed `page_number`, and verbatim `quote`.
  - Official external verification flags (`official_verification_required`) for conditions checked by government authority records.
- [x] **Rule Service & Automated Invalidation Engine (`backend/app/rules/service.py`)**:
  - `generate_logic_expression`: Generates human-readable Boolean logic formulas from AST condition trees.
  - `create_rule`: Validates scheme, rule code uniqueness, target document version, and records dependency edges.
  - `review_rule`: Human gatekeeper enforcing that active rules must have verbatim quote, page reference, and point to a valid, non-superseded document version.
  - `invalidate_dependent_rules`: Triggered whenever a document version changes or is superseded; immediately transitions all dependent rules from `active` to `needs_review`, records an automated audit trail, and disables `scheme.rules_enabled` if no active rules remain.
- [x] **Seeded Human-Verified Core Rules (`backend/app/rules/seed_rules.py`)**:
  - 7 verified active rules seeded across PM-KISAN, PM-JAY, PMAY-G, and Uttarakhand Old Age Pension with exact gazette quotes and page numbers linked to verified document versions.
- [x] **Admin Eligibility Rules API (`backend/app/api/v1/rules.py`)**:
  - `GET /api/v1/admin/rules`: Filterable by scheme and status (`active`, `needs_review`, `draft`, `retired`), with pagination.
  - `GET /api/v1/admin/rules/summary`: Live telemetry counts across rule statuses and scheme rule-readiness.
  - `GET /api/v1/admin/rules/{rule_id}`: Full condition tree JSON, logic expression, dependency version, and review history.
  - `POST /api/v1/admin/rules`: Draft new rules with verified source citations.
  - `PUT /api/v1/admin/rules/{rule_id}`: Update rule criteria, auto-incrementing version and resetting status to `needs_review`.
  - `POST /api/v1/admin/rules/{rule_id}/review`: Human review workflow (`approve`, `request_changes`, `retire`).
  - `POST /api/v1/admin/rules/simulate-source-change`: Diagnostic endpoint for simulating source updates and verifying instant dependency invalidation.
- [x] **Interactive Admin Frontend Console (`apps/web/src/pages/admin/AdminRulesPage.tsx`)**:
  - Telemetry summary cards showing Total Rules, Active Rules, Needs Review alert counter, and Rule-Enabled schemes.
  - Status filter tabs (`All`, `Needs Review`, `Active`, `Draft`, `Retired`) and Scheme selector dropdown.
  - Rule cards with logic formula chips, verified verbatim gazette quote box, and dependency pills.
  - Inspect & Review Modal: Displays condition tree JSON, logic expression, document version, review audit history, and decision submission form.
  - "Simulate Source Update" button on cards to test invalidation gate live in the browser.
  - Draft New Rule modal with condition builder and mandatory evidence fields.
- [x] **Phase 5 Gate Verification**:
  - Automated Pytest suite: 27/27 tests passing across all suites (`test_rules_and_invalidation.py`, `test_pdf_ingestion.py`, `test_discovery_and_review.py`, `test_compliance_and_scheduler.py`, `test_health.py`).
  - Browser subagent completed end-to-end testing: navigated to `/admin/rules`, simulated source gazette change, verified automatic `needs_review` transition, inspected rule provenance, submitted human re-approval with notes, and restored rule to `active`. All 3 gate criteria satisfied.

## Phase 4 Detail Checklist (PDF Ingestion & Coordinate Extraction) — Passed

- [x] **Point-Accurate Coordinate Extractor (`backend/app/ingest/extractor.py`)**:
  - Built with PyMuPDF (`pymupdf`). Extracts page geometry (`width`, `height`, `rotation`), digital text layer, and word-level bounding boxes.
  - Merges words into line-level bounding boxes with exact PDF points `[x0, y0, x1, y1]` (72 points/inch relative to page origin `[0, 0]`).
  - Detects OCR requirement flag when pages are purely image scans without digital font glyphs.
- [x] **Strict Page-Bounded Chunker (`backend/app/ingest/chunker.py`)**:
  - Enforces Blueprint Section 7.2: Chunks **NEVER span across page boundaries** to guarantee zero-ambiguity PDF citation opening.
  - Targets 250-400 tokens per chunk (~150-300 words), detects section titles/headers, and generates deterministic chunk IDs (`chk-{version_id}-p{page:03d}-{idx:02d}`).
  - Maps every constituent line bounding box directly into `ChunkBoxDTO` coordinates with text snippets.
- [x] **Diagnostic Coordinate Visualizer & Spot-Check Renderer (`backend/app/ingest/diagnostics.py`)**:
  - Renders pages to 150 DPI PNG images and computes coordinate scaling factor (`pixels / points`).
  - Overlays semi-transparent saffron/gold highlights (`fill=(250, 204, 21, 70)`) and solid saffron borders (`outline=(217, 119, 6, 220)`) directly over stored bounding boxes.
  - Produces verifiable spot-check artifacts saved to `data/debug/{version_id}_p{page}_annotated.png` for human QA.
- [x] **Single Shared Ingestion Pipeline (`backend/app/ingest/service.py`)**:
  - Enforces Phase 4 Gate Requirement 3: Scraper-discovered documents, manual PDF uploads, and seed files all flow through the exact same `pdf_ingestion_service.ingest_document_version(db, version_id)`.
  - Atomically records `Page`, `Chunk`, and `ChunkBox` rows and records an immutable `AuditEvent` (`document_version_ingested`).
- [x] **Admin Documents & Ingestion API (`backend/app/api/v1/documents.py`)**:
  - `GET /api/v1/admin/documents`: Lists documents and versions with chunk and page counts.
  - `POST /api/v1/admin/documents/{version_id}/ingest`: Triggers on-demand coordinate extraction and chunking.
  - `POST /api/v1/admin/documents/upload`: Multipart PDF upload route feeding directly into the shared pipeline.
  - `GET /api/v1/admin/documents/{version_id}/pages`: Returns page geometry, dimensions, rotation, word count, and OCR status.
  - `GET /api/v1/admin/documents/{version_id}/chunks`: Returns chunks with token counts and constituent bounding boxes.
  - `GET /api/v1/admin/documents/{version_id}/pages/{page}/debug-image`: Serves annotated spot-check image.
- [x] **Interactive Admin Frontend Console (`apps/web/src/pages/admin/AdminDocumentsPage.tsx`)**:
  - Document table with live status badges (`ingested`, `verified`, `pending_review`), page counts, chunk counts, and SHA-256 fingerprints.
  - Ingestion trigger button with real-time feedback toast.
  - Modal Coordinate & Chunk Inspector with 3 tabs:
    - *Extracted Page-Bounded Chunks*: Live chunk list with token counts and `[x0, y0, x1, y1]` point coordinate pills.
    - *Diagnostic Coordinate Spot-Check*: High-res page visualizer displaying rendered PDF with saffron highlight boxes overlaid.
    - *Extracted Pages*: Page dimensions, word count, and digital text layer status.
  - Manual PDF upload dialog with scheme selector, title, type, and dropzone.
- [x] **Phase 4 Gate Verification**:
  - Pytest suite: 22/22 tests passing across all suites (`test_pdf_ingestion.py`, `test_discovery_and_review.py`, `test_compliance_and_scheduler.py`, `test_health.py`).
  - Browser subagent completed end-to-end testing: loaded documents table, executed live ingestion, inspected page-bounded chunks and bounding boxes, verified diagnostic spot-check image overlay, and checked manual upload modal. All 3 gate criteria satisfied.

## Phase 3 Detail Checklist (Discovery, Fetching & Admin Review Console) — Passed

- [x] **Content-Addressable Storage Service (`backend/app/discovery/storage.py`)**:
  - Raw downloaded binaries and PDFs persisted immutably keyed by SHA-256 fingerprint (`data/fetched/{hash}.bin`, `data/pdfs/{hash}.pdf`).
  - Extracted text snippets persisted for fast diffing and inspection without re-parsing.
- [x] **Diff Engine & Change Classification (`backend/app/discovery/diff.py`)**:
  - Line-by-line unified diffing via Python `difflib` with additions/deletions statistics and similarity ratio.
  - Generates machine-assisted review summaries clearly labelled: *"Machine-generated diff summary as review aid only; human inspection required."*
  - Classifies resources deterministically: `new_resource`, `unchanged`, `changed_content`, `changed_binary`, and `duplicate`.
  - Unchanged resources update observation timestamps without polluting the review queue with duplicates.
- [x] **Admin Review Queue API (`backend/app/api/v1/review.py`)**:
  - `GET /api/v1/admin/review-queue`: Filterable by status (`pending_review`, `approved`, `rejected`), source, and classification.
  - `GET /api/v1/admin/review-queue/{id}`: Detailed provenance, text snippet preview, unified diff against prior version, and impacted eligibility rules preview.
  - `POST /api/v1/admin/review-queue/{id}/approve`: Creates logical `Document` and immutable `DocumentVersion` in verified status; increments version number.
  - **Rule Invalidation Mandate (Blueprint Section 5.3)**: Approving a new document version automatically marks all active dependent rules linked via `RuleDocumentDependency` to `needs_review` and marks prior versions as `superseded_pending_review`.
  - `POST /api/v1/admin/review-queue/{id}/reject`: Records rejection reasons and audit logs.
  - `POST /api/v1/admin/review-queue/{id}/assign-scheme`: Dynamically links candidates to schemes.
- [x] **Public Search & Catalog Isolation Gate**:
  - Public scheme catalogue and detail endpoints strictly filter on `Document.status == 'verified'` and `DocumentVersion.status == 'verified'`.
  - Candidates in `pending_review` or `rejected` are completely isolated and never exposed to citizens.
- [x] **Interactive Admin Review Console (`AdminReviewQueuePage.tsx`)**:
  - Status tabs (`Pending Review`, `Approved & Verified`, `Rejected`, `All`).
  - Candidate cards with classification badges, source tags, and SHA-256 hashes.
  - Modal diff inspector with line-by-line changes and rule invalidation warnings.
  - Approval modal with scheme selection, official document title, document type, and notes.
  - Rejection dialog with required reason.
- [x] **Phase 3 Gate Verification**:
  - Pytest suite (17/17 passing) validating classification rules, unified diffs, approval flow, rule invalidation, and public isolation.
  - Browser subagent verified candidate inspection, approval, tab filtering, and public catalog isolation. All gate criteria satisfied.

---

## Phase 2 Detail Checklist (Source Registry, Compliance Gate & Scheduler) — Passed

- [x] **Source Registry & Seeding**:
  - `registry/sources.yaml` seeded with 5 official portals: `SRC-MIN-AGRI`, `SRC-UK-SOCIAL-WELFARE`, `SRC-INDIA-GOV`, `SRC-DBT-BHARAT`, and `SRC-MYSCHEME-DIR`.
  - Comprehensive source models in SQLAlchemy tracking jurisdiction, family, fetch mode, permission status, automation status, cron schedule, and audit logs.
- [x] **Strict Compliance Gate (Blueprint Section 3.3 & 3.5)**:
  - `ComplianceGate` enforces human policy approval before any source can run automatically or manually.
  - Pending and prohibited sources strictly return HTTP 403 `COMPLIANCE_GATE_BLOCKED`.
  - myScheme restricted to manual-only / disabled (`written_authorization_required`). Automation cannot be enabled absent a verified written authorization reference.
  - Human compliance review endpoint `POST /api/v1/admin/sources/{source_id}/review` records reviewer identity, decisions, notes, and optional live `robots.txt` inspection.
- [x] **Source Adapter Interface & Registry**:
  - `SourceAdapter` protocol defining `discover`, `fetch`, `parse`, and `normalize`.
  - Deterministic fixture adapter for PM-KISAN and UK Old Age Pension.
  - Ministry adapter with safe HTML/PDF parsing and exponential backoff.
  - Strict myScheme compliance adapter blocking automated crawls with `PolicyViolationError`.
- [x] **Dedicated Single-Instance Scheduler (Blueprint Section 16.2)**:
  - APScheduler 3.x manager running in dedicated single-instance mode with PID file locking (`SchedulerProcessLock`). Stale locks from terminated processes automatically reclaimed.
  - Per-source locking (`PerSourceLockManager`) prevents overlapping discovery runs and rejects concurrent execution with HTTP 409 `SOURCE_JOB_ACTIVE`.
  - Automatic cron reconciliation syncing enabled and approved sources with the scheduler.
  - Pause (`/api/v1/admin/scheduler/pause`) and Resume (`/api/v1/admin/scheduler/resume`) controls with live heartbeat telemetry.
- [x] **Manual Run Now & Idempotent Audited Discovery**:
  - `POST /api/v1/admin/sources/{source_id}/discover` triggers on-demand discovery.
  - Creates tracked `DiscoveryRun`, `ResourceObservation`, `FetchAttempt`, and `ResourceCandidate` records.
  - SHA-256 binary hash deduplication ensures idempotent runs without duplicate candidates.
  - Failures are observable in database logs, job telemetry, and admin UI.
- [x] **Interactive Admin Frontend**:
  - `AdminSourcesPage`: Live source list with badges, compliance block callouts, policy review dialog, enable/disable toggles, and Run Now execution.
  - `AdminDiscoveryPage`: Live scheduler telemetry cards, active cron jobs list, pause/resume controls, and recent discovery run table with failure inspection modal.
- [x] **Phase 2 Gate Verification**:
  - Automated Pytest suite with 11 tests passing.
  - Automated browser subagent verification executing policy review, enabling source, Run Now discovery, and scheduler pause/resume. All 4 gate criteria satisfied.

---

## Phase 1 Detail Checklist (Foundation and Design System) — Passed

- [x] **Git Repository Initialized**: Root git repository created with `.gitignore` blocking secrets, binaries, databases, and dependencies.
- [x] **Configuration & Secret Conventions**: `.env.example` created with all configuration keys defined.
- [x] **Repository Directory Layout**: `apps/web`, `backend/app`, `data`, `registry`, `docs` organized as specified in Blueprint Section 2.3.
- [x] **Initial Registry Data**: Seed sources (`registry/sources.yaml`) and seed schemes (`registry/schemes.yaml`).
- [x] **Shared API Schemas & Envelopes**: Standard response envelope `{"ok": true, "data": ..., "meta": {"request_id": "..."}}` and error envelope.
- [x] **Database Models & Alembic Migration**: All core tables defined in SQLAlchemy (schemes, sources, documents, versions, chunks, rules, etc.) with initial clean migration `0001_initial_schema`.
- [x] **Backend Health Endpoint**: `GET /health` and `GET /api/v1/health` providing readiness, database connectivity, environment, and version info.
- [x] **Frontend Application Setup**: Vite + React + TypeScript in `apps/web/` with Lucide icons, responsive navigation, and design tokens.
- [x] **Design Tokens & Light/Dark Theme**: Cohesive color palette, typography (Inter + Noto Sans Devanagari), smooth transitions, glassmorphic accents.
- [x] **Bilingual Support (Hindi / English)**: Language switcher with localized strings for core navigation, states, and route shells.
- [x] **Complete Route Shell**:
  - **Public**: `/`, `/how-it-works`, `/schemes`, `/schemes/:schemeId`
  - **Citizen App**: `/app`, `/app/chat`, `/app/discover`, `/app/eligibility`, `/app/recommendations`, `/app/schemes/:schemeId`, `/app/saved`, `/app/profile`, `/app/settings`
  - **Admin Console**: `/admin`, `/admin/sources`, `/admin/discovery`, `/admin/review-queue`, `/admin/documents`, `/admin/rules`, `/admin/audit`
- [x] **States Implementation**: Loading skeletons, empty states, error boundaries, and offline indicators.
- [x] **Gate Verification**: Backend runs and responds to health check; frontend starts without errors and all routes are navigable on mobile and desktop. Verified with automated browser testing.

---
*Last Updated:* Phase 2 Completed Successfully

