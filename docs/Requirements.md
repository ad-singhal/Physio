> **Document ID:** `[Web]` | **Version:** 1.0 | **Last Updated:** 2026-04-13
> 

> **Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Supabase, Vercel
> 

> **Architecture:** Server Components for data loading, Client Components (`"use client"`) for all interactions
> 

---

## 1. App Overview

The PhysioConnect Physio Web App is a professional dashboard used exclusively by licensed physiotherapists. It is a private, login-gated web application — not publicly accessible. Physios use it to manage their patient caseload, review patient onboarding data submitted via the iOS app, build and publish personalised recovery programs, track patient progress, and communicate with patients via in-app messaging. All data is read from and written to the same Supabase project used by the iOS patient app, with strict Row Level Security (RLS) policies ensuring physios only see their own patients.

**Primary User:** Licensed physiotherapists who are registered and verified on the PhysioConnect platform.

---

## 2. Main Goals

1. Give physiotherapists a clear, efficient workspace to manage their patients and caseload.
2. Allow physios to review patient symptom data and consultation notes before and after calls.
3. Enable physios to build structured, multi-week recovery programs and publish them to patients.
4. Provide a real-time view of each patient’s progress, pain scores, and session completion.
5. Support direct messaging with patients during their active programs.
6. Make onboarding and account verification straightforward for new physios joining the platform.

---

## 3. User Stories

| ID | User Story |
| --- | --- |
| US-W-001 | As a physio, I want to register and submit my credentials so that I can be verified and access the platform. |
| US-W-002 | As a physio, I want to log in securely so that I can access my dashboard. |
| US-W-003 | As a physio, I want to see a summary of my day on my home dashboard so that I know what needs my attention. |
| US-W-004 | As a physio, I want to see a list of all my patients so that I can manage my caseload efficiently. |
| US-W-005 | As a physio, I want to view a patient’s onboarding questionnaire answers so that I am fully prepared before our consultation call. |
| US-W-006 | As a physio, I want to mark a consultation as complete and add post-call notes so that the patient’s record is up to date. |
| US-W-007 | As a physio, I want to build a structured recovery program for a patient so that I can deliver their treatment plan inside the app. |
| US-W-008 | As a physio, I want to add exercises to a program from a shared content library so that I don’t have to create content from scratch. |
| US-W-009 | As a physio, I want to set a price and duration for each program so that patients can make an informed purchase decision. |
| US-W-010 | As a physio, I want to publish a program to a patient so that they can see and purchase it in the iOS app. |
| US-W-011 | As a physio, I want to view a patient’s pain score trends and session completion over time so that I can monitor their recovery. |
| US-W-012 | As a physio, I want to message patients directly so that I can provide ongoing guidance during their program. |
| US-W-013 | As a physio, I want to manage my availability calendar so that patients can book valid consultation slots. |
| US-W-014 | As a physio, I want to update my profile, bio, and specialties so that patients see accurate information during matching. |
| US-W-015 | As a physio, I want to receive browser notifications for new messages and patient activity so that I can respond promptly. |

---

## 4. Features

### Authentication & Access

| ID | Feature | What It Does | When It Appears | Error Handling |
| --- | --- | --- | --- | --- |
| F-W-001 | **Physio Registration** | Multi-step sign-up: name, email, password, license number, specialties, location, bio, credential document upload. Account set to `pending_verification` until reviewed by admin. | First visit, unauthenticated. | Inline field validation. If document upload fails, allow retry without re-filling the form. Show “Application submitted” confirmation screen. |
| F-W-002 | **Physio Login** | Email/password login via Supabase Auth. Checks `verification_status` on success. If `pending` or `rejected`, blocks access and shows status screen. | Every visit, unauthenticated. | Specific error for wrong credentials. Status-specific message if account not verified. |
| F-W-003 | **Verification Status Screen** | Informs physio their application is under review or rejected (with reason). Allows resubmission if rejected. | After login if `verification_status !== verified`. | If status fetch fails, show cached status with last updated timestamp. |

### Dashboard

| ID | Feature | What It Does | When It Appears | Error Handling |
| --- | --- | --- | --- | --- |
| F-W-004 | **Home Dashboard** | Overview cards: today’s consultations, patients with new activity, programs awaiting creation, unread message count. | Root page after login. | If any card data fails, show individual card error states — do not fail the whole page. |

### Patient Management

| ID | Feature | What It Does | When It Appears | Error Handling |
| --- | --- | --- | --- | --- |
| F-W-005 | **Patient List** | Full list of assigned patients. Columns: name, program status, last session date, pain trend icon, unread messages badge. Searchable and filterable. | Patients page. | If list fails, show empty state with retry button. |
| F-W-006 | **Patient Profile View** | Full patient record: onboarding answers, consultation history, active/past programs, progress charts, message thread, “Create Program” button. | Tap any patient row on F-W-005. | If patient data fails partially, show loaded sections and error placeholders for failed sections. |
| F-W-007 | **Consultation Record** | View scheduled consultation details. Mark as complete. Add post-call notes visible to patient in iOS app. | Inside patient profile, consultation card. | If save fails, keep notes in unsaved draft state with visible warning. Auto-retry on reconnect. |

### Program Builder

| ID | Feature | What It Does | When It Appears | Error Handling |
| --- | --- | --- | --- | --- |
| F-W-008 | **Program Builder** | Interactive multi-week program creation. Sets title, description, target condition, price, duration (weeks). Full `"use client"` Client Component. | Tap “Create Program” inside patient’s profile. | Auto-saves draft every 30 seconds. If publish fails, keep in draft. Never lose physio’s work. |
| F-W-009 | **Week & Day Planner** | Visual grid showing weeks and days. Add/remove days, reorder via drag-and-drop, open each day to add exercises. | Inside F-W-008. | If drag-and-drop fails, fallback to up/down reorder buttons. |
| F-W-010 | **Exercise Picker** | Searchable, filterable slide-over panel (by body region, difficulty). Physio selects exercises from shared library. Selected exercises appear with editable reps/sets/rest fields. | Tap “Add Exercise” on any day inside F-W-009. | If library fails, show retry. Physio can type a custom exercise name as fallback. |
| F-W-011 | **Program Publish** | “Publish to Patient” button. Changes status from `draft` to `published` in Supabase. Patient sees it immediately in iOS app. | Inside F-W-008, after program is built. | Confirm dialog before publish. If publish fails, show error and keep in draft. |

### Progress Monitoring

| ID | Feature | What It Does | When It Appears | Error Handling |
| --- | --- | --- | --- | --- |
| F-W-012 | **Patient Progress Dashboard** | Charts: pain score over time (line), sessions completed per week (bar), exercise completion rate (%). Physio can add written notes visible to patient. | Inside patient profile, Progress tab. | If chart data fails, show last synced data with timestamp. Show “No data yet” if patient has not logged anything. |

### Messaging

| ID | Feature | What It Does | When It Appears | Error Handling |
| --- | --- | --- | --- | --- |
| F-W-013 | **Messaging Inbox** | List of all patient message threads. Shows patient name, last message preview, timestamp, unread badge. | Messages page. | If inbox fails, show retry. |
| F-W-014 | **Message Thread** | Full chat thread with a patient. Real-time via Supabase Realtime. Text input and send button. | Tap a thread in F-W-013, or from patient profile. | If send fails, keep message in draft with retry. Mark as “Sending…” until confirmed. |

### Availability & Scheduling

| ID | Feature | What It Does | When It Appears | Error Handling |
| --- | --- | --- | --- | --- |
| F-W-015 | **Availability Calendar** | Weekly calendar view. Physio clicks time slots to mark available or blocked. Available slots surface in iOS booking screen (S-012). | Availability page. | If save fails, revert slot visually and show error toast. Never show a slot as available if the write failed. |

### Profile & Settings

| ID | Feature | What It Does | When It Appears | Error Handling |
| --- | --- | --- | --- | --- |
| F-W-016 | **Physio Profile Editor** | Edit profile photo, display name, bio, specialties (multi-select), location, years of experience. Saved to Supabase `physiotherapists` table. | Profile & Settings page. | Show unsaved changes warning if user navigates away. If save fails, show error toast. |
| F-W-017 | **Notification Preferences** | Toggle browser notifications for: new messages, patient session completions, new bookings. | Settings tab inside Profile page. | If permission denied, show instructions to enable in browser settings. |

---

## 5. Screens / Pages

### Auth Pages (No Sidebar)

| ID | Page | What’s On It | How You Get There |
| --- | --- | --- | --- |
| S-W-001 | **Landing / Login** | PhysioConnect logo, login form (email + password), “Apply to Join” link, forgot password link. | Root URL `/` when unauthenticated. |
| S-W-002 | **Forgot Password** | Email field, “Send Reset Link” button. Via Supabase Auth. | Link on S-W-001. |
| S-W-003 | **Registration — Step 1: Account** | Name, email, password fields. | Tap “Apply to Join” on S-W-001. |
| S-W-004 | **Registration — Step 2: Professional Info** | License number, specialties (multi-select), years of experience, location, bio. | Step 2 of registration flow. |
| S-W-005 | **Registration — Step 3: Documents** | Upload credential documents (PDF or image). Preview uploaded file. Submit application button. | Step 3 of registration flow. |
| S-W-006 | **Verification Pending / Rejected** | Status message, expected timeline if pending, rejection reason + resubmit button if rejected. | After login if account not verified. |

### Main App Pages (With Sidebar Navigation)

| ID | Page | What’s On It | Route | Rendering |
| --- | --- | --- | --- | --- |
| S-W-007 | **Dashboard (Home)** | Summary cards: today’s consultations, patients needing attention, programs to create, unread messages. Recent activity feed. | `/dashboard` | Server Component + Client Components (live counts). |
| S-W-008 | **Patient List** | Searchable, filterable table of all patients. Status badges. Pain trend icons. Unread message badges. | `/patients` | Server Component (initial list) + Client Component (search/filter). |
| S-W-009 | **Patient Profile** | Tabbed layout: Overview, Onboarding Answers, Program, Progress, Messages. “Create Program” button. Consultation record card. | `/patients/[id]` | Server Component (data) + Client Components (charts, messaging, program builder launch). |
| S-W-010 | **Program Builder** | Full-page interactive editor. Week/day grid left, exercise picker panel right. Price, title, description fields at top. Publish button. | `/patients/[id]/program/new` or `/programs/[id]/edit` | Full `"use client"` Client Component page. |
| S-W-011 | **Messages Inbox** | Two-panel: thread list left, active thread right. | `/messages` | Client Component — Supabase Realtime. |
| S-W-012 | **Availability Calendar** | Weekly grid. Clickable time slots. Toggle available/blocked. | `/availability` | Client Component — interactive calendar. |
| S-W-013 | **Profile & Settings** | Two tabs: Profile (edit bio, photo, specialties) and Settings (notification preferences, password change, log out). | `/settings` | Client Component — forms. |

### Layout Components (Persistent)

| ID | Component | What’s On It |
| --- | --- | --- |
| S-W-014 | **Sidebar Navigation** | Logo, nav links (Dashboard, Patients, Messages, Availability, Settings), unread message badge, physio avatar + name, log out. Collapsible on smaller screens. |
| S-W-015 | **Top Bar** | Page title, breadcrumb, notification bell, physio avatar shortcut. |

---

## 6. Data

*This web app shares the same Supabase project as `[iOS]`. Tables below are additions to the shared schema. Refer to `[iOS]` D-001 through D-012 for shared tables.*

| ID | Data Item | Description | Supabase Table |
| --- | --- | --- | --- |
| D-W-001 | **Physiotherapist Profile** | Physio ID (linked to Supabase Auth), full name, email, license number, verification status (`pending` / `verified` / `rejected`), rejection reason, specialties (array), bio, location, years of experience, profile photo URL. | `physiotherapists` |
| D-W-002 | **Credential Documents** | Physio ID, file URL (Supabase Storage), document type, upload date, reviewed flag. | `physio_documents` |
| D-W-003 | **Availability Slots** | Physio ID, date, start time, end time, status (`available` / `booked` / `blocked`). Referenced by `[iOS]` S-012 booking screen. | `availability_slots` |
| D-W-004 | **Consultation Notes** | Consultation ID, post-call notes text, created at, updated at. Written by physio. Readable by patient in `[iOS]` S-018. | `consultation_notes` |
| D-W-005 | **Program Draft State** | Program ID, last auto-saved JSON snapshot of program builder state, last saved at. Used to recover unsaved work. | `program_drafts` |

*Shared tables used from `[iOS]` schema: `users` (D-001), `onboarding_responses` (D-002), `matches` (D-003), `consultations` (D-004), `programs` (D-005), `program_days` (D-006), `exercises` (D-007), `session_logs` (D-008), `messages` (D-009).*

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
| **File Uploads** | Credential documents and profile photos to Supabase Storage. Signed URLs for credential docs (private). Public CDN URLs for profile photos and exercise media. |
| **Server vs. Client Components** | Data-loading pages use Server Components (no loading spinners on first render). All interactive features use Client Components. |
| **State Management** | TanStack Query (React Query) for server state. Zustand for local UI state (program builder, sidebar). |
| **Charts** | Recharts — React-based, works well as Client Component with Tailwind. |
| **Drag and Drop** | `@dnd-kit/core` for Program Builder day/exercise reordering. Accessible and touch-friendly. |
| **Forms** | React Hook Form + Zod for all form validation. |
| **Dark Mode** | Supported via Tailwind `dark:` variant and shadcn/ui built-in theme. Toggle in settings. |
| **Accessibility** | shadcn/ui built on Radix UI — keyboard navigation and ARIA labels included. All custom components follow WCAG 2.1 AA. |
| **Mobile Responsiveness** | Desktop-first. Usable on tablet. Sidebar collapses to hamburger menu on small screens. |
| **Admin Verification** | Admin reviews new physio applications via Supabase Studio at MVP. Manually sets `verification_status = verified` and triggers confirmation email via Supabase Edge Function. |

---

## 8. Build Steps

| ID | Step | What to Build | References |
| --- | --- | --- | --- |
| B-W-001 | **Project Setup** | `create-next-app` with TypeScript, Tailwind CSS, App Router. Install: shadcn/ui, Supabase JS (`@supabase/ssr`), TanStack Query, Zustand, React Hook Form, Zod, Recharts, `@dnd-kit/core`. Create Vercel project. Add environment variables. | Section 7. |
| B-W-002 | **Supabase Schema Extensions** | Create new tables in shared Supabase project: `physiotherapists` (D-W-001), `physio_documents` (D-W-002), `availability_slots` (D-W-003), `consultation_notes` (D-W-004), `program_drafts` (D-W-005). Write RLS policies for all physio tables. Generate TypeScript types from Supabase schema. | D-W-001 to D-W-005, Section 7 (RLS). `[Shared]` |
| B-W-003 | **Auth Flow** | Build S-W-001, S-W-002. Supabase Auth login with `@supabase/ssr` middleware to protect all `/dashboard` routes. On login, check `verification_status` and route accordingly. Build S-W-006. | F-W-001, F-W-002, F-W-003, US-W-001, US-W-002. |
| B-W-004 | **Registration Flow** | Build S-W-003, S-W-004, S-W-005. Multi-step form with React Hook Form + Zod. Document upload to Supabase Storage. On submit, write to `physiotherapists` and `physio_documents`. Set status to `pending_verification`. | F-W-001, D-W-001, D-W-002, US-W-001. |
| B-W-005 | **App Shell & Navigation** | Build S-W-014 (sidebar) and S-W-015 (top bar). Authenticated layout wrapper in `app/(dashboard)/layout.tsx`. Sidebar links, physio avatar, unread message badge, collapsible behaviour. | S-W-014, S-W-015. |
| B-W-006 | **Dashboard Home** | Build S-W-007. Server Component fetches summary counts. Client Component cards with live unread message count via Supabase Realtime. Recent activity feed. | F-W-004, US-W-003. |
| B-W-007 | **Patient List Page** | Build S-W-008. Server Component for initial patient list. Client Component for search, filter, status badge rendering. Pain trend icon logic. | F-W-005, D-W-001, US-W-004. |
| B-W-008 | **Patient Profile Page** | Build S-W-009. Tabbed layout — Overview, Onboarding Answers, Program, Progress, Messages. Server Component for data load. Each tab as its own Client Component. Consultation record card with “Mark Complete” and notes. | F-W-006, F-W-007, D-002, D-004, D-W-004, US-W-005, US-W-006. |
| B-W-009 | **Exercise Library Picker** | Build F-W-010 as a reusable slide-over panel component. Fetches from shared `exercises` table (D-007). Search and filter by body region. Selectable with rep/set/rest override fields. | F-W-010, D-007, US-W-008. |
| B-W-010 | **Program Builder** | Build S-W-010. Full Client Component page. Week/day grid with `@dnd-kit` drag-and-drop. Exercise Picker panel (B-W-009). Price, title, description fields. Auto-save to `program_drafts` every 30 seconds. | F-W-008, F-W-009, F-W-010, F-W-011, D-005, D-006, D-W-005, US-W-007 to US-W-009. |
| B-W-011 | **Program Publish Flow** | Add “Publish to Patient” button in Program Builder. Confirm dialog. On confirm, update `programs.status = published` in Supabase. Patient sees it in iOS app immediately. | F-W-011, D-005, US-W-010. |
| B-W-012 | **Progress Charts** | Build Progress tab inside S-W-009. Recharts line chart (pain scores) and bar chart (sessions per week) from `session_logs` (D-008). Physio notes input field — saves to `consultation_notes`. | F-W-012, D-008, D-W-004, US-W-011. |
| B-W-013 | **Messaging** | Build S-W-011. Two-panel layout. Thread list from `messages` table. Active thread with Supabase Realtime subscription. Text input + send. Unread badge updates live. | F-W-013, F-W-014, D-009, US-W-012. |
| B-W-014 | **Availability Calendar** | Build S-W-012. Weekly grid UI with Tailwind. Click to toggle slot status. Writes to `availability_slots` (D-W-003). These slots are read by the iOS booking screen. | F-W-015, D-W-003, US-W-013. |
| B-W-015 | **Profile & Settings** | Build S-W-013. Profile tab — edit fields, photo upload to Supabase Storage. Settings tab — notification toggles, password change via Supabase Auth. | F-W-016, F-W-017, D-W-001, US-W-014, US-W-015. |
| B-W-016 | **End-to-End QA & Polish** | Full flow: register → verification pending → verified → log in → see patients → open patient profile → review onboarding → mark consultation complete → build program → publish → view patient progress → message patient → update availability. Dark mode, accessibility, tablet layout, RLS policy verification. | All above. |