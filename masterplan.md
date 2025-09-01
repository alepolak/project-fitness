Next.js + React + TypeScript (strict) + Ajv + shadcn/ui — Mobile-first Fitness Log (Local-only)
0) Product goals (in plain language)

You track body numbers: body weight, body fat, body muscle.

You see a daily exercise plan written clearly (no abbreviations), with photos or short animations for each exercise.

You log workouts with exact sets, repetitions, weight, rest time, and perceived effort (written in words).

You can add, update, and remove items from the plan.

You keep monthly baseline tests and see progress over time.

You can switch units between imperial and metric anytime.

All data is JSON and is stored locally on your device (no cloud).

Interface uses clear wording for beginners (no jargon unless it is explained in the glossary).

1) Tech stack decisions

Next.js (App Router) with client components (explicit "use client" at the top of pages/components).

React 18 + TypeScript “strict”: true.

shadcn/ui for components; keep the design modern, high-contrast, friendly on small screens.

Ajv for JSON validation at save/load time and before rendering.

IndexedDB (via a small wrapper) as the primary store; Local Storage only for tiny flags (e.g., theme, unit preference, last backup timestamp).

Service Worker (optional PWA) for offline caching of images/gifs you add; still local-only.

No external network calls by default; the app should work with radio off.

2) Information architecture (screens and main flows)

Bottom navigation (mobile-first):

Home – today’s plan, quick actions, “start workout” button, quick log of weight.

Plan – the full program calendar (three simple levels: months → weeks → days). Edit plan here.

Log – chronological workout logs and filters (by exercise, by week, by tag).

Baseline – monthly baseline tests with one clear “Start baseline” flow.

Glossary – easy search for terms; each item has text + photo/gif.

Settings – units, theme, privacy note, data export/import.

Global:

Floating action button (plus icon) for “Add body metric” and “Quick workout note”.

Toast notifications (short and clear).

Dialog modals for edits and confirmations.

Sheet (slide-up) for quick pickers on mobile.

3) Data model (JSON contracts, described in plain language)

(All entities include id (string), created_at (ISO string), updated_at (ISO string), and version (integer) for migrations.)

3.1 Settings

unit_system (string): "imperial" or "metric".

theme (string): "system" | "light" | "dark".

language (string): "en" (future-friendly).

data_version (integer): for migrations.

privacy_acknowledged (boolean): user saw local-only notice.

3.2 Body metric entry (one row per day or per reading)

date (ISO date string).

body_weight (number) and weight_unit (“lb” or “kg”).

body_fat_percent (number) optional.

body_muscle_percent (number) optional.

notes (string) optional.

Validation rules:

Weight > 0 and < 600 lb (or < 300 kg).

Percent fields between 0 and 100.

3.3 Exercise catalog item

name (string): clear name, e.g., “Seated Shoulder Press with Dumbbells”.

aliases (string[]).

movement_pattern (string): e.g., “hinge”, “squat”, “press”, “pull”, “carry”, “core”.

primary_muscles (string[]): human words, not abbreviations (e.g., “front of thigh”, “back of thigh”, “buttocks”, “upper back”, “shoulders”, “chest”, “core”).

equipment (string[]): e.g., “dumbbells”, “machine”, “bodyweight”, “treadmill”.

step_by_step_instructions (string[]): short sentences users can follow.

safety_notes (string[]): tailored cues (for your back and left quadriceps sensitivity).

media (array of media items):

type (“photo” or “gif”),

source (local blob reference or cached URL),

alt_text (string).

beginner_friendly_name (string) for display.

Validation rules:

At least one instruction step.

Media optional but recommended.

3.4 Program plan (the master plan you view and edit)

title (string): e.g., “Base → Build → Peak”.

phases (array): each phase has:

name (string): “Base”, “Build”, or “Peak”.

weeks (array of weeks): each week has:

index (number): week number within phase.

days (array): each day has:

date (ISO string) optional (auto-linked when scheduled).

sessions (array of sessions): for example “Strength Day A”, “Intervals Day”, “Zone 2 Walk”.

Each session includes:

session_type (string): “strength”, “intervals”, “steady walk”, “soccer match”, etc.

title (string) friendly title users see.

exercises (array of exercise prescriptions). Each exercise prescription has:

exercise_id (string) links to catalog.

clear_description (string): a full sentence such as
“Seated Shoulder Press with Dumbbells: 3 series of 10 repetitions with 10 pounds per dumbbell. Rest 90 seconds after each series.”

sets (array): each set has:

target_repetitions (number or range),

target_weight_value (number) and target_weight_unit (“lb” or “kg”) optional,

rest_seconds (number) optional,

tempo_text (string) optional: plain words, e.g., “lower slowly for three seconds, pause for one second, push up smoothly”.

notes_for_user (string) optional.

cardio_block optional for treadmill intervals:

warm_up_minutes (number),

work_intervals (array of { hard_seconds, easy_seconds, target_heart_rate_range_bpm }),

cool_down_minutes (number),

safety_notes (string).

Validation rules:

No empty sessions.

Every exercise prescription must have either a set list or a cardio block.

3.5 Workout log entry (what you actually did)

date_time_start (ISO string).

session_plan_ref (optional reference to plan session).

entries (array):

For strength:

exercise_id (string),

performed_sets (array of sets): each set has

repetitions_done (number),

weight_value (number) + weight_unit (“lb” or “kg”) optional,

rest_seconds_observed (number) optional,

perceived_effort_text (string): e.g., “moderately hard”.

pain_back_0_to_10 (number) optional,

pain_quadriceps_0_to_10 (number) optional.

For cardio:

mode (string): “treadmill walk”, “treadmill run”, “soccer match”.

segments (array): each segment with

label (“warm up”, “hard minute 1”, “easy minute 1”),

duration_seconds,

speed_mph_or_kph,

incline_percent optional,

average_heart_rate_bpm optional,

max_heart_rate_bpm optional.

session_notes (string) optional.

3.6 Baseline test entry

month (string “YYYY-MM”).

Rockport 1-mile:

time_mm_ss (string),

finish_heart_rate_bpm (number).

12-minute distance:

distance (number) + distance_unit (“miles” or “kilometers”),

average_heart_rate_bpm (number) optional.

longest_continuous_jog_minutes (number) optional.

best_one_minute_heart_rate_drop_bpm (number) optional.

notes (string) optional.

3.7 Glossary item

term (string): e.g., “Romanian Deadlift”.

plain_definition (string): no jargon.

why_it_matters (string): benefit explained simply.

how_to_do_it_safely (string[]): step list in simple words.

media (photos/gifs) same shape as in catalog.

related_terms (string[]).

4) JSON validation (Ajv)

Maintain one schema per entity (settings, metric entry, exercise, plan, log entry, baseline, glossary).

Create a central validator that:

Validates on import, on save, and before rendering critical screens.

On failure, shows a helpful error in plain language (“The body weight must be greater than zero. Please check your entry.”).

Store a data_version and run migrations (e.g., Version 1 → 2 adds tempo_text).

5) Storage model (local-only)

IndexedDB “fitness_db” with object stores:

settings (single record),

metrics (body metrics),

catalog (exercises),

plan (single active plan; allow multiple named plans later),

logs (workout logs),

baseline (monthly entries),

glossary (local dictionary),

media (Blob store for photos/gifs).

Local Storage keys:

unit_system,

last_backup_iso,

simple UI flags (first-time tips dismissed).

Backups and restore

“Export data” writes a single JSON file with all stores (media converted to data URLs only if user opts in).

“Import data” validates with Ajv, then writes to IndexedDB.

Prompt monthly: “Create a backup now?” with one-tap export.

6) Unit conversion and display rules

Settings choose imperial or metric.

Conversion:

Pounds ↔ kilograms (1 lb = 0.45359237 kg).

Miles ↔ kilometers (1 mile = 1.60934 km).

Rounding:

Body weight: 0.1 lb or 0.05 kg.

Gym loads: round to nearest available dumbbell step (5 lb) or nearest kilogram.

Distances: two decimals for miles, one decimal for kilometers.

Display always spells things out:

“3 series of 10 repetitions with 10 pounds per dumbbell. Rest 90 seconds between series.”

7) Writing style (beginner-first)

Avoid abbreviations in the interface.

Replace common shorthand:

“sets” → “series” (keep both in small helper text once).

“reps” → “repetitions”.

“RPE” → “perceived effort” (range: “very easy”, “easy”, “moderately hard”, “hard”, “very hard”).

Every exercise card shows:

one friendly sentence about what you should feel (e.g., “You should feel the back of your thighs working; your lower back should feel stable and quiet.”),

one short safety reminder.

8) shadcn/ui component plan (by screen)

Use: Button, Card, Input, Label, Form, Select, Slider, Dialog, Sheet, Tabs, Table, Badge, Tooltip, Toast, Toggle, ToggleGroup, Collapsible/Accordion, ScrollArea, Progress, Skeleton, Avatar, AspectRatio.

Home

Card “Today’s plan”.

Button “Start workout” → opens the next scheduled session.

Card “Quick body number” (weight input + unit).

Progress mini badges (weekly sessions completed).

Toast “Saved”.

Plan

Tabs for phases (Base, Build, Peak).

Table (week view) → rows are days, cells show sessions.

Dialog for creating and editing sessions.

Select for choosing an exercise from catalog.

Accordion inside a session to expand exercise prescriptions.

“Use a friendly description” preview area.

Log

Table of past sessions (date, session type, main outcomes).

Filters at top: by exercise, by month.

Dialog to view session details; Sheet to edit.

Baseline

Card for each test (Rockport, 12-minute).

Form entries with clear validation messages.

Chart (optional in a later milestone) using a simple canvas or SVG: trend of distance and heart rate.

Glossary

Search Input at top.

List of terms with Avatar or AspectRatio media previews.

Dialog to open a term with steps, safety, and media carousel.

Settings

Select unit system.

Button “Export all data”.

Button “Import data”.

Toggle “Show longer explanations by default”.

Local-only notice in a Card with a clear explanation.

9) Media handling (photos/gifs)

Add images from:

Local file picker → store Blob in media store; reference by media_id.

Remote links (optional) → fetch once and store locally; fall back to placeholder if fetch fails.

AspectRatio for consistent previews; lazy-load images; show Skeleton during load.

Each media record includes alt_text in plain words.

10) Workout flow (end-to-end)

Start workout from Home → opens today’s session.

Session screen shows each exercise as a Card:

Big friendly title,

Photo/gif,

Clear, long description of what to do,

Series list with editable inputs for performed repetitions and weight,

Rest timer (simple countdown after tapping “Save set”).

After finishing, user taps “Finish session”:

Summary dialog with totals,

Notes box (“How did it feel? Any back or quadriceps discomfort?”),

Save → creates a Workout log entry (Ajv validated).

Home shows a checkmark for today.

Cardio workout flow

Intervals are shown as a sequence:

Warm up block,

Repeating hard/easy blocks,

Cool down.

Each block has a sentence, e.g.,
“Walk fast for one minute at two percent incline. Your heart rate may reach one hundred sixty-five beats per minute by the third hard minute.”

Optional quick inputs for heart rate and treadmill settings.

11) Baseline test flow (monthly)

“Start baseline” asks the two tests:

Rockport 1-mile: time and end heart rate.

12-minute distance: distance and unit.

Guidance page explains how to perform each test safely.

Result is saved with the month; trends shown in simple text now, charts later.

12) Editing the plan (safe, simple)

From Plan view, tap a day → see sessions.

Tap a session to Edit:

Choose session type (strength, intervals, steady walk, soccer match).

Add exercises from your catalog with a Select search.

For each exercise, edit a friendly sentence that the app also generates for you from the structured fields (you can keep or override the sentence).

Add series rows with repetitions, weight targets, and suggested rest.

Reorder exercises by drag handle.

Save → Ajv validates; errors read like help, not code.

13) Accessibility and clarity

Minimum touch target size 44 × 44 px.

Large base font size (16–18 px), good color contrast.

Every icon has a Label or Tooltip with plain words.

All abbreviations shown only inside small “info” chips with full meanings (e.g., “repetitions (also called reps)”).

14) The “friendly sentence” generator (rules)

When an exercise has sets, show:

Pattern:
“{Exercise name}: {number of series} series of {repetitions} repetitions{, with {weight} {unit} if applicable}. Rest {rest seconds} seconds between series.”

If repetitions vary (ranges), say:
“8 to 12 repetitions” (not “8–12”).

If tempo is important, add:
“Lower slowly for three seconds, pause for one second, and lift smoothly.”

When intervals, show:

“Warm up for {minutes} minutes with an easy walk.”

“Do {count} rounds: {hard seconds} seconds of fast pace followed by {easy seconds} seconds of easy pace.”

“Cool down for {minutes} minutes, then walk until your heart rate is at or below one hundred ten beats per minute.”

15) Migration strategy (future-proof JSON)

Every exported file includes data_version.

On import, run migrations in order:

Example migration categories:

Add new optional fields with defaults,

Rename fields (keep a small mapping),

Normalize units (convert all saved pounds to kilograms if user switched to metric—store the chosen unit with the value).

If a migration fails, keep original backup and show a clear message with a one-tap restore.

16) Error handling and confirmations

Before destructive actions (delete plan item, delete log entry), show a Dialog:

Title: “Delete this item?”

Body: “This will remove it from your plan. Your logs will remain.”

Buttons: “Cancel”, “Delete”.

On validation errors, scroll to the first field and show a short, friendly sentence below it.

17) Privacy and local-only guardrails

First run shows Local-only notice:

“All your data stays on this device. There are no accounts and no servers.”

“Remember to export a backup regularly.”

No external analytics. Optional local counters:

Number of workouts completed,

Average weekly sessions,

Time since last baseline.

18) Modern 2025 design choices

Typography: larger line-height, clear hierarchy; titles 18–22 px on mobile.

Motion: gentle slide/scale for dialogs and sheets; keep motion duration short (150–200 ms).

Color: neutral base with one accent color; strong focus ring for accessibility.

Cards with soft depth (shadow 2–4); rounded corners (10–12 px).

Empty states with friendly illustrations and one sentence of guidance.

19) Build plan (milestones)

Milestone 1 — Foundation (1–2 days)

Next.js setup (App Router), TypeScript strict, shadcn/ui install and tokens, IndexedDB wrapper, Ajv wiring, bottom nav, Settings (units), Local-only notice.

Milestone 2 — Catalog + Glossary (2–3 days)

Exercise catalog CRUD with media vault.

Glossary CRUD with search and media.

Starter content for the exercises you will use first (10–15 items).

Milestone 3 — Plan (3–4 days)

Phase/Week/Day structure.

Session editor (strength + intervals).

Friendly sentence preview.

Milestone 4 — Logging (3–4 days)

Start workout flow.

Strength set capture and rest timer.

Intervals stepper with optional heart rate fields.

Log list with filters.

Milestone 5 — Body metrics + Baseline (2–3 days)

Quick weight card on Home.

Metrics history list and simple trend text.

Baseline tests screen and monthly entries.

Milestone 6 — Backup/Restore + Polishing (2–3 days)

Export/Import JSON with Ajv validation.

Error states, loading skeletons, toasts.

Accessibility pass and copy review (beginner clarity).

(Optional) Milestone 7 — PWA & media caching (2–3 days)

20) Acceptance criteria (what “done” means)

All user data (settings, metrics, catalog, plan, logs, baseline, glossary, media) is stored locally and can be exported and imported as JSON.

Unit switch: changing units updates displays consistently and safely (stored values keep their unit metadata).

Plan:

You can create a week with a strength session and an intervals session.

Each exercise shows a photo or gif and a friendly sentence with full details.

Log:

You can record real sets with repetitions and weight for strength.

You can record interval segments with heart rate fields.

You can find past sessions by exercise name.

Baseline:

You can input Rockport and 12-minute results for the current month.

The app displays whether this month improved versus the last month in plain text.

Glossary:

Typing “Romanian” finds “Romanian Deadlift” with a simple definition and safety steps.

Clarity:

No unexplained abbreviations in the interface.

Every validation message is helpful and human.

21) Content guidelines for your specific needs (back and left quadriceps)

Every hinge exercise card (e.g., Romanian Deadlift) includes a red safety line:

“Keep your back neutral. Stop the movement if your lower back discomfort goes above two out of ten.”

Every quadriceps exercise card (e.g., goblet squat, leg extension) includes:

“Move slowly and do not bounce at the bottom. Work in a discomfort range no higher than two out of ten.”

Interval sessions show a line:

“Increase speed over the first ten to fifteen seconds. Do not jump straight to a fast pace.”

22) Example “friendly sentences” (how the app should read)

Seated Shoulder Press with Dumbbells:
“Seated Shoulder Press with Dumbbells: do three series of ten repetitions with ten pounds in each dumbbell. Rest ninety seconds after each series. Keep your elbows below shoulder height at the start and press straight up without leaning back.”

Romanian Deadlift with Dumbbells:
“Romanian Deadlift with Dumbbells: do three series of ten repetitions with twenty pounds in each dumbbell. Lower the weights slowly for three seconds while you push your hips back. Keep your back neutral. You should feel the back of your thighs working.”

Treadmill Intervals (Base):
“Warm up for eight minutes with an easy walk. Then do eight rounds. Each round is sixty seconds at a fast pace followed by sixty seconds at an easy pace. Finish with a five-minute cool down. Walk until your heart rate is at or below one hundred ten beats per minute.”

23) Data governance checklist (local-only)

No third-party fonts that require network calls (bundle locally).

No analytics scripts.

Service worker (if added) caches only same-origin assets and user media.

Clear “Reset app” button that wipes IndexedDB after a confirmation.

24) What to prepare before building

A short list (10–15) of exercises you will actually use at the start with photos/gifs.

The first four weeks of your program written in the structured way described (you can keep the names you already use; the app will render them in full sentences).

Your initial glossary entries for terms you often forget or mix up.