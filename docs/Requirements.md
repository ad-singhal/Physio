> **Document ID:** `[Web]` | **Version:** 1.1 | **Last Updated:** 2026-04-24
> 

> **Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Supabase, Vercel
> 

> **Architecture:** Server Components for data loading, Client Components (`"use client"`) for all interactions
> 

---

## 1. App Overview

The PhysioConnect Physio Web App is a professional dashboard used exclusively by licensed physiotherapists. It is a private, login-gated web application — not publicly accessible. Physios use it to manage their patient caseload, review patient onboarding data submitted via the iOS app, build and publish personalised recovery programmes, track patient progress, and communicate with patients via in-app messaging. All data is read from and written to the same Supabase project used by the iOS patient app, with strict Row Level Security (RLS) policies ensuring physios only see their own patients.

**Primary User:** Licensed physiotherapists who are registered and verified on the PhysioConnect platform.

---

## 2. Main Goals

1. Give physiotherapists a clear, efficient workspace to manage their patients and caseload.
2. Allow physios to review patient symptom data and consultation notes before and after calls.
3. Enable physios to build structured, multi-week recovery programmes and publish them to patients.
4. Provide a real-time view of each patient's progress, pain scores, and session completion.
5. Support direct messaging with patients during their active programmes.
6. Make onboarding and account verification straightforward for new physios joining the platform.

---

## 3. User Stories

| ID | User Story |
| --- | --- |
| US-W-001 | As a physio, I want to register and submit my credentials so that I can be verified and access the platform. |
| US-W-002 | As a physio, I want to log in securely so that I can access my dashboard. |
| US-W-003 | As a physio, I want to see a summary of my day on my home dashboard so that I know what needs my attention. |
| US-W-004 | As a physio, I want to see a list of all my patients so that I can manage my caseload efficiently. |
| US-W-005 | As a physio, I want to view a patient's onboarding questionnaire answers so that I am fully prepared before our consultation call. |
| US-W-006 | As a physio, I want to mark a consultation as complete and add post-call notes so that the patient's record is up to date. |
| US-W-007 | As a physio, I want to build a structured recovery programme for a patient so that I can deliver their treatment plan inside the app. |
| US-W-008 | As a physio, I want to add exercises to a programme from a shared content library so that I don't have to create content from scratch. |
| US-W-009 | As a physio, I want to set a fee and duration for each programme so that patients can make an informed enrolment decision. |
| US-W-010 | As a physio, I want to publish a programme to a patient so that they can see and enrol in it via the iOS app. |
| US-W-011 | As a physio, I want to view a patient's pain score trends and session completion over time so that I can monitor their recovery. |
| US-W-012 | As a physio, I want to message patients directly so that I can provide ongoing guidance during their programme. |
| US-W-013 | As a physio, I want to manage my availability calendar so that patients can book valid consultation slots. |
| US-W-014 | As a physio, I want to update my profile, specialisations, and credentials so that patients see accurate information during matching. |
| US-W-015 | As a physio, I want to receive browser notifications for new messages and patient activity so that I can respond promptly. |

---

## 4. Features

### Authentication & Access

| ID | Feature | What It Does | When It Appears | Error Handling |
| --- | --- | --- | --- | --- |
| F-W-001 | **Physio Registration** | Multi-step sign-up collecting: account details, professional info (specialisations, modalities, modes, conditions treated, IAP membership, affiliation), and credential documents (BPT, MPT, state council registration, additional certifications). Account set to `pending_verification` until reviewed by admin. | First visit, unauthenticated. | Inline field validation at each step. If document upload fails, allow retry without re-filling the form. Each step auto-saves progress locally. Show "Application submitted" confirmation screen on final submit. |
| F-W-002 | **Physio Login** | Email/password login via Supabase Auth. Checks `verification_status` on success. If `pending`, `rejected`, or `needs_info` — blocks access and shows status screen with relevant message. | Every visit, unauthenticated. | Specific error for wrong credentials. Status-specific message if account not verified. |
| F-W-003 | **Verification Status Screen** | Informs physio of current application status. If `pending`: shows expected review timeline. If `rejected`: shows reason and resubmit button. If `needs_info`: shows which fields require update and allows targeted resubmission. | After login if `verification_status !== verified`. | If status fetch fails, show cached status with last updated timestamp. |

### Dashboard

| ID | Feature | What It Does | When It Appears | Error Handling |
| --- | --- | --- | --- | --- |
| F-W-004 | **Home Dashboard** | Overview cards: today's consultations, patients with new activity, programmes awaiting creation, unread message count. | Root page after login. | If any card data fails, show individual card error states — do not fail the whole page. |

### Patient Management

| ID | Feature | What It Does | When It Appears | Error Handling |
| --- | --- | --- | --- | --- |
| F-W-005 | **Patient List** | Full list of assigned patients. Columns: name, programme status, last session date, pain trend icon, unread messages badge. Searchable and filterable by status (active / awaiting programme / completed). | Patients page. | If list fails, show empty state with retry button. |
| F-W-006 | **Patient Profile View** | Full patient record: onboarding answers (general info + health/pain profile), consultation history, active/past programmes, progress charts, message thread, "Create Programme" button. | Tap any patient row on F-W-005. | If patient data fails partially, show loaded sections and error placeholders for failed sections. |
| F-W-007 | **Consultation Record** | View scheduled consultation details. Mark as complete. Add post-call notes visible to patient in iOS app (S-023). | Inside patient profile, consultation card. | If save fails, keep notes in unsaved draft state with visible warning. Auto-retry on reconnect. |

### Programme Builder

| ID | Feature | What It Does | When It Appears | Error Handling |
| --- | --- | --- | --- | --- |
| F-W-008 | **Programme Builder** | Interactive multi-week programme creation. Sets title, description, target condition, subscription tiers (fee, call frequency, features per tier), duration (weeks). Full `"use client"` Client Component. | Tap "Create Programme" inside patient's profile. | Auto-saves draft every 30 seconds. If publish fails, keep in draft. Never lose physio's work. |
| F-W-009 | **Week & Day Planner** | Visual grid showing weeks and days. Add/remove days, reorder via drag-and-drop, open each day to add exercises. | Inside F-W-008. | If drag-and-drop fails, fallback to up/down reorder buttons. |
| F-W-010 | **Exercise Picker** | Searchable, filterable slide-over panel (by body region, difficulty). Physio selects exercises from shared library. Selected exercises appear with editable reps/sets/rest fields. | Tap "Add Exercise" on any day inside F-W-009. | If library fails, show retry. Physio can type a custom exercise name as fallback. |
| F-W-011 | **Programme Publish** | "Publish to Patient" button. Changes status from `draft` to `published` in Supabase, sets `published_at` timestamp. Patient is notified immediately via push notification and sees programme in iOS app (S-018). | Inside F-W-008, after programme is built. | Confirm dialog before publish. If publish fails, show error and keep in draft. |

### Progress Monitoring

| ID | Feature | What It Does | When It Appears | Error Handling |
| --- | --- | --- | --- | --- |
| F-W-012 | **Patient Progress Dashboard** | Charts: pain score over time (line), sessions completed per week (bar), exercise completion rate (%). Physio can add written notes visible to patient in S-023. | Inside patient profile, Progress tab. | If chart data fails, show last synced data with timestamp. Show "No data yet" if patient has not logged anything. |

### Messaging

| ID | Feature | What It Does | When It Appears | Error Handling |
| --- | --- | --- | --- | --- |
| F-W-013 | **Messaging Inbox** | List of all patient message threads. Shows patient name, last message preview, timestamp, unread badge. Sorted by most recent activity. | Messages page. | If inbox fails, show retry. |
| F-W-014 | **Message Thread** | Full chat thread with a patient. Real-time via Supabase Realtime. Text input and send button. | Tap a thread in F-W-013, or from patient profile. | If send fails, keep message in draft with retry. Mark as "Sending…" until confirmed. |

### Availability & Scheduling

| ID | Feature | What It Does | When It Appears | Error Handling |
| --- | --- | --- | --- | --- |
| F-W-015 | **Availability Calendar** | Weekly calendar view. Physio clicks time slots to mark available or blocked. Available slots surface in iOS booking screen (S-017). | Availability page. | If save fails, revert slot visually and show error toast. Never show a slot as available if the write failed. |

### Profile & Settings

| ID | Feature | What It Does | When It Appears | Error Handling |
| --- | --- | --- | --- | --- |
| F-W-016 | **Physio Profile Editor** | Edit all profile fields: photo, name, bio, specialisations, modalities, consultation modes, conditions treated, affiliation, IAP membership, languages, location. Changes to credentials or state council number trigger admin re-verification. Saved across `physiotherapists`, `physio_credentials`, `physio_certifications`, `physio_conditions_treated` tables. | Profile & Settings page. | Show unsaved changes warning if user navigates away. If save fails, show error toast and keep form populated. |
| F-W-017 | **Notification Preferences** | Toggle browser notifications for: new messages, patient session completions, new bookings. | Settings tab inside Profile page. | If permission denied, show instructions to enable in browser settings. |

---

## 5. Screens / Pages

### Auth Pages (No Sidebar)

| ID | Page | What's On It | How You Get There |
| --- | --- | --- | --- |
| S-W-001 | **Landing / Login** | PhysioConnect logo, login form (email + password), "Apply to Join" link, forgot password link. | Root URL `/` when unauthenticated. |
| S-W-002 | **Forgot Password** | Email field, "Send Reset Link" button. Via Supabase Auth. | Link on S-W-001. |
| S-W-003 | **Registration — Step 1: Account** | Full name, email, password fields. | Tap "Apply to Join" on S-W-001. |
| S-W-004 | **Registration — Step 2: Professional Info** | Specialisations (multi-select: orthopedic / neuro / sports / cardio / pediatrics). Modalities (multi-select). Consultation modes (online / in-person / home visit). Years of experience. Experience tier (auto-derived). Conditions treated (add one by one: condition name + volume bucket + optional notes). IAP membership toggle. Affiliation name. State council registration state + number. Languages spoken. Location (city + postcode). Bio. | Step 2 of registration flow. |
| S-W-005 | **Registration — Step 3: Credentials & Documents** | BPT: university + year + certificate upload (required). MPT: specialisation + university + year + certificate upload (optional). Additional certifications: add one by one (name + issuer + year + optional document upload). All uploads go to Supabase Storage `physio-documents` bucket. Submit application button. | Step 3 of registration flow. |
| S-W-006 | **Verification Pending / Rejected / Needs Info** | Status-specific message. If pending: expected timeline. If rejected: reason + resubmit button. If needs_info: specific fields flagged for update + targeted resubmit. | After login if account not verified. |

### Main App Pages (With Sidebar Navigation)

| ID | Page | What's On It | Route | Rendering |
| --- | --- | --- | --- | --- |
| S-W-007 | **Dashboard (Home)** | Summary cards: today's consultations, patients needing attention, programmes to create, unread messages. Recent activity feed. | `/dashboard` | Server Component + Client Components (live counts). |
| S-W-008 | **Patient List** | Searchable, filterable table of all patients. Status badges. Pain trend icons. Unread message badges. | `/patients` | Server Component (initial list) + Client Component (search/filter). |
| S-W-009 | **Patient Profile** | Tabbed layout: Overview, Onboarding Answers (general info + health/pain profile), Programme, Progress, Messages. "Create Programme" button. Consultation record card. | `/patients/[id]` | Server Component (data) + Client Components (charts, messaging, programme builder launch). |
| S-W-010 | **Programme Builder** | Full-page interactive editor. Week/day grid left, exercise picker panel right. Title, description, target condition, subscription tier builder at top. Publish button. | `/patients/[id]/programme/new` or `/programmes/[id]/edit` | Full `"use client"` Client Component page. |
| S-W-011 | **Messages Inbox** | Two-panel: thread list left, active thread right. | `/messages` | Client Component — Supabase Realtime. |
| S-W-012 | **Availability Calendar** | Weekly grid. Clickable time slots. Toggle available/blocked. | `/availability` | Client Component — interactive calendar. |
| S-W-013 | **Profile & Settings** | Two tabs: Profile (all editable profile fields including credentials, specialisations, modalities, conditions treated) and Settings (notification preferences, password change, log out). | `/settings` | Client Component — forms. |

### Layout Components (Persistent)

| ID | Component | What's On It |
| --- | --- | --- |
| S-W-014 | **Sidebar Navigation** | Logo, nav links (Dashboard, Patients, Messages, Availability, Settings), unread message badge, physio avatar + name, log out. Collapsible on smaller screens. |
| S-W-015 | **Top Bar** | Page title, breadcrumb, notification bell, physio avatar shortcut. |

---

## 6. Data

*This web app shares the same Supabase project as `[iOS]`. Tables below are additions to the shared schema. Refer to `[iOS]` D-001 through D-013 for shared tables.*

### D-W-001 — `physiotherapists` table

Main physio profile record. One row per physio.

| Column | Type | Description |
| --- | --- | --- |
| `id` | uuid | Linked to Supabase Auth `auth.users`. |
| `email` | text | From Supabase Auth. |
| `full_name` | text | Display name. |
| `profile_photo_url` | text | Public CDN URL from Supabase Storage. |
| `bio` | text | Short professional bio. |
| `location_city` | text | City of primary practice. |
| `location_postcode` | text | Postcode for proximity matching. |
| `lat` | float | Latitude for proximity scoring. |
| `lng` | float | Longitude for proximity scoring. |
| `languages` | text[] | Languages spoken. Used in matching (actively filtered in later release). |
| `rating` | float | Average patient rating. Populated once sufficient data exists. |
| `years_experience` | int | Total years of clinical practice. |
| `experience_tier` | text | `junior` (0–3 yrs) / `mid` (4–8 yrs) / `senior` (9+ yrs). Auto-derived from `years_experience`. |
| `specialisations` | text[] | One or more of: `orthopedic`, `neuro`, `sports`, `cardio`, `pediatrics`. |
| `modalities` | text[] | Treatment modalities: `manual_therapy`, `dry_needling`, `exercise_therapy`, `electrotherapy`, `hydrotherapy`, etc. |
| `modes` | text[] | Consultation modes offered: `online`, `in_person`, `home_visit`. |
| `affiliation_name` | text | Name of affiliated hospital or clinic. Nullable. |
| `affiliation_verified` | bool | Whether affiliation confirmed by admin. Default false. |
| `iap_member` | bool | Member of Indian Association of Physiotherapists. |
| `verification_status` | text | `pending` / `verified` / `rejected` / `needs_info`. |
| `rejection_reason` | text | Populated if `verification_status = rejected` or `needs_info`. Nullable. |
| `last_verified_at` | timestamp | When profile was last reviewed and verified by admin. Nullable. |
| `created_at` | timestamp | Account creation date. |

### D-W-002 — `physio_credentials` table

Structured academic and council registration credentials. One row per physio.

| Column | Type | Description |
| --- | --- | --- |
| `id` | uuid | Primary key. |
| `physio_id` | uuid | FK → `physiotherapists.id`. |
| `bpt_university` | text | University where BPT was completed. |
| `bpt_year` | int | Year of BPT completion. |
| `bpt_doc_url` | text | Supabase Storage URL — private, signed URL access. |
| `mpt_specialisation` | text | MPT specialisation (e.g. orthopaedics, neurology). Nullable. |
| `mpt_university` | text | University where MPT was completed. Nullable. |
| `mpt_year` | int | Year of MPT completion. Nullable. |
| `mpt_doc_url` | text | Supabase Storage URL for MPT certificate. Nullable. |
| `state_council_state` | text | State of physiotherapy council registration. |
| `state_council_number` | text | Council registration number. |
| `state_council_verified_at` | timestamp | When state council registration was verified by admin. Nullable until verified. |

### D-W-003 — `physio_certifications` table

Additional certifications. Many rows per physio.

| Column | Type | Description |
| --- | --- | --- |
| `id` | uuid | Primary key. |
| `physio_id` | uuid | FK → `physiotherapists.id`. |
| `name` | text | Certification name (e.g. "McKenzie Method", "DNS", "Mulligan"). |
| `issuer` | text | Issuing body or institution. |
| `year` | int | Year obtained. |
| `doc_url` | text | Supabase Storage URL for certificate. Nullable. |

### D-W-004 — `physio_conditions_treated` table

Conditions a physio has experience treating. Many rows per physio.

| Column | Type | Description |
| --- | --- | --- |
| `id` | uuid | Primary key. |
| `physio_id` | uuid | FK → `physiotherapists.id`. |
| `condition` | text | Condition name (e.g. "ACL tear", "frozen shoulder", "sciatica", "plantar fasciitis"). |
| `volume_bucket` | text | Approximate caseload experience: `low` (1–5/yr) / `medium` (6–20/yr) / `high` (20+/yr). |
| `notes` | text | Optional free-text context. Nullable. |

### D-W-005 — `availability_slots` table

Physio available and blocked time slots. Referenced by `[iOS]` S-017 booking screen.

| Column | Type | Description |
| --- | --- | --- |
| `id` | uuid | Primary key. |
| `physio_id` | uuid | FK → `physiotherapists.id`. |
| `date` | date | Slot date. |
| `start_time` | time | Slot start time. |
| `end_time` | time | Slot end time. |
| `status` | text | `available` / `booked` / `blocked`. |

### D-W-006 — `consultation_notes` table

Post-call notes written by physio. Readable by patient in `[iOS]` S-023.

| Column | Type | Description |
| --- | --- | --- |
| `id` | uuid | Primary key. |
| `consultation_id` | uuid | FK → shared `consultations` table. |
| `notes` | text | Post-call notes text. |
| `created_at` | timestamp | — |
| `updated_at` | timestamp | — |

### D-W-007 — `program_drafts` table

Auto-saved programme builder state. Used to recover unsaved work.

| Column | Type | Description |
| --- | --- | --- |
| `id` | uuid | Primary key. |
| `program_id` | uuid | FK → shared `programs` table. |
| `draft_state` | jsonb | Full JSON snapshot of programme builder UI state. |
| `last_saved_at` | timestamp | — |

*Shared tables used from `[iOS]` schema: `users` (D-001), `onboarding_responses` (D-002), `matches` (D-003), `consultations` (D-004), `programs` (D-005), `program_days` (D-006), `exercises` (D-007), `session_logs` (D-008), `messages` (D-009), `payment_plans` (D-013).*

---

## 7. Extra Details

| Topic | Detail |
| --- | --- |
| **Framework** | Next.js 14 with App Router. TypeScript throughout. |
| **Styling** | Tailwind CSS. Component library: shadcn/ui (Radix UI primitives). |
| **Deployment** | Vercel. Supabase URL, anon key, service role key in Vercel environment variables. |
| **Auth** | Supabase Auth — shared system with iOS. Physios have `role = physio` claim in JWT. |
| **Row Level Security (RLS)** | Critical. Physios can only read/write rows where `physio_id = auth.uid()`. All tables must have RLS enabled. |
| **Realtime** | Supabase Realtime for messaging (F-W-014) and dashboard live counts (F-W-004). |
| **File Uploads** | All credential documents go to private `physio-documents` Supabase Storage bucket — accessed via signed URLs only. Sub-paths: `physio-documents/bpt/`, `physio-documents/mpt/`, `physio-documents/certifications/`. Profile photos go to public `profile-photos` bucket. |
| **Server vs. Client Components** | Data-loading pages use Server Components (no loading spinners on first render). All interactive features use Client Components. |
| **State Management** | TanStack Query (React Query) for server state. Zustand for local UI state (programme builder, sidebar). |
| **Charts** | Recharts — React-based, works well as Client Component with Tailwind. |
| **Drag and Drop** | `@dnd-kit/core` for Programme Builder day/exercise reordering. Accessible and touch-friendly. |
| **Forms** | React Hook Form + Zod for all form validation. Multi-step registration form saves progress locally at each step. |
| **Dark Mode** | Supported via Tailwind `dark:` variant and shadcn/ui built-in theme. Toggle in settings. |
| **Accessibility** | shadcn/ui built on Radix UI — keyboard navigation and ARIA labels included. All custom components follow WCAG 2.1 AA. |
| **Mobile Responsiveness** | Desktop-first. Usable on tablet. Sidebar collapses to hamburger menu on small screens. |
| **Admin Verification** | Admin reviews new physio applications via Supabase Studio at MVP. Sets `verification_status` to `verified`, `rejected`, or `needs_info`. Triggers confirmation email via Supabase Edge Function. Re-verification triggered when physio updates credentials or state council number. |

---

## 8. Build Steps

| ID | Step | What to Build | References |
| --- | --- | --- | --- |
| B-W-001 | **Project Setup** | `create-next-app` with TypeScript, Tailwind CSS, App Router. Install: shadcn/ui, Supabase JS (`@supabase/ssr`), TanStack Query, Zustand, React Hook Form, Zod, Recharts, `@dnd-kit/core`. Create Vercel project. Add environment variables. | Section 7. |
| B-W-002 | **Supabase Schema** | Create all physio-side tables: `physiotherapists` (D-W-001), `physio_credentials` (D-W-002), `physio_certifications` (D-W-003), `physio_conditions_treated` (D-W-004), `availability_slots` (D-W-005), `consultation_notes` (D-W-006), `program_drafts` (D-W-007). Create Supabase Storage sub-paths under `physio-documents` bucket. Write RLS policies for all tables. Generate TypeScript types. | D-W-001 to D-W-007, Section 7 (RLS), `[Shared]`. |
| B-W-003 | **Auth Flow** | Build S-W-001, S-W-002. Supabase Auth login with `@supabase/ssr` middleware to protect all `/dashboard` routes. On login, check `verification_status` and route accordingly. Build S-W-006 with status-specific states (pending / rejected / needs_info). | F-W-002, F-W-003, US-W-001, US-W-002. |
| B-W-004 | **Registration Flow** | Build S-W-003, S-W-004, S-W-005. Multi-step form with React Hook Form + Zod. Step 2 captures all professional info including specialisations, modalities, modes, conditions treated, IAP membership, affiliation, state council details. Step 3 captures BPT, optional MPT, and additional certifications with file uploads to Supabase Storage. On submit, write to `physiotherapists`, `physio_credentials`, `physio_certifications`, `physio_conditions_treated`. Set `verification_status = pending`. | F-W-001, D-W-001 to D-W-004, US-W-001. |
| B-W-005 | **App Shell & Navigation** | Build S-W-014 (sidebar) and S-W-015 (top bar). Authenticated layout wrapper in `app/(dashboard)/layout.tsx`. Sidebar links, physio avatar, unread message badge, collapsible behaviour. | S-W-014, S-W-015. |
| B-W-006 | **Dashboard Home** | Build S-W-007. Server Component fetches summary counts. Client Component cards with live unread message count via Supabase Realtime. Recent activity feed. | F-W-004, US-W-003. |
| B-W-007 | **Patient List Page** | Build S-W-008. Server Component for initial patient list. Client Component for search, filter, status badge rendering, pain trend icon logic. | F-W-005, US-W-004. |
| B-W-008 | **Patient Profile Page** | Build S-W-009. Tabbed layout — Overview, Onboarding Answers, Programme, Progress, Messages. Server Component for data load. Each tab as its own Client Component. Consultation record card with "Mark Complete" and post-call notes (writes to D-W-006). | F-W-006, F-W-007, D-002, D-004, D-W-006, US-W-005, US-W-006. |
| B-W-009 | **Exercise Library Picker** | Build F-W-010 as a reusable slide-over panel component. Fetches from shared `exercises` table (D-007). Search and filter by body region. Selectable with rep/set/rest override fields. | F-W-010, D-007, US-W-008. |
| B-W-010 | **Programme Builder** | Build S-W-010. Full Client Component page. Week/day grid with `@dnd-kit` drag-and-drop. Exercise Picker panel (B-W-009). Title, description, target condition, subscription tier builder (name, fee, call frequency, features per tier). Auto-save draft to `program_drafts` (D-W-007) every 30 seconds. | F-W-008, F-W-009, F-W-010, D-005, D-006, D-013, D-W-007, US-W-007 to US-W-009. |
| B-W-011 | **Programme Publish Flow** | Add "Publish to Patient" button in Programme Builder. Confirm dialog. On confirm, update `programs.status = published` and set `published_at`. Patient notified immediately via push notification and sees programme in iOS app S-018. | F-W-011, D-005, US-W-010. |
| B-W-012 | **Progress Charts** | Build Progress tab inside S-W-009. Recharts line chart (pain scores from D-008) and bar chart (sessions per week). Physio notes input — saves to `consultation_notes` (D-W-006), visible to patient in iOS S-023. | F-W-012, D-008, D-W-006, US-W-011. |
| B-W-013 | **Messaging** | Build S-W-011. Two-panel layout. Thread list from `messages` table. Active thread with Supabase Realtime subscription. Text input + send. Unread badge updates live. | F-W-013, F-W-014, D-009, US-W-012. |
| B-W-014 | **Availability Calendar** | Build S-W-012. Weekly grid UI with Tailwind. Click to toggle slot status. Writes to `availability_slots` (D-W-005). Slots read by iOS booking screen S-017. | F-W-015, D-W-005, US-W-013. |
| B-W-015 | **Profile & Settings** | Build S-W-013. Profile tab — full editable profile form across all tables (D-W-001 to D-W-004). Photo upload to Supabase Storage. Credential changes trigger admin re-verification flag. Settings tab — notification toggles, password change. | F-W-016, F-W-017, D-W-001 to D-W-004, US-W-014, US-W-015. |
| B-W-016 | **End-to-End QA & Polish** | Full flow: register (all 3 steps) → verification pending → verified → log in → see patients → open patient profile → review onboarding answers → mark consultation complete → build programme with tiers → publish → view patient progress → message patient → update availability → edit profile. Dark mode, accessibility, tablet layout, RLS policy verification. | All above. |