# dMAT Prep — Prototype v1 Product Specification

Authoritative product specification for the prototype. The goal is a working, visually polished prototype delivered quickly. Priorities are core UX, visual fidelity, smooth interactions, functional practice flow, local persistence, minimal dependencies, and fast iteration.

## Product

**Name:** dMAT Prep  
**Positioning:** Mobile-native dMAT preparation for users preparing for the dMAT exam and aiming to study in Germany.  
**Promise:** “Prep smart. Score better. Get to Germany.”

The experience should feel modern, playful, intelligent, focused, premium but approachable, handwritten/editorial, and visually distinctive. The supplied dMAT design is the primary visual reference.

## Prototype screens

1. Onboarding 1
2. Onboarding 2
3. Onboarding 3
4. Home
5. Practice
6. Question
7. Results
8. Analytics
9. Streak
10. Achievements
11. Profile
12. Settings

Use the existing Expo Router architecture. Keep route files thin and place UI/behavior in feature screens and components.

Primary bottom navigation is exactly: Home, Practice, Exam, Progress, Profile.

Progress is the parent navigation area for Analytics, Streak, and Achievements. Analytics is the default Progress screen.

## Onboarding

Three slides, with first-launch completion persisted locally:

- **Dreaming of Germany?** — “We’ll help you take one step closer.”
- **Beat the timer. Crack dMAT.** — “Real exam feel. Real progress.”
- **Everything you need.** — “Smart prep. All in one place.”

Use the supplied hand-drawn visual style.

## Core flows

### Home

Show a personalized greeting, daily goal, streak, overall progress, a start-practice CTA, and the five-tab navigation. Values may be deterministic local mock data, but interactions must work.

### Practice

Show Core Module / Special Module tabs and cards for Figure Sequences, Connected Figures, Row & Column Logic, Matrix Reasoning, and Rules & Relations. Each card shows an icon, progress, and attempted/target count. Only Figure Sequences requires a functional engine; other modules may be marked coming soon.

### Question

This is the core experience. Show a deadline-based timer, bookmark action, question number/total, progress, a visual question, visual answer options, and next/submit. Do not use text-only placeholder questions.

### Figure Sequences

Implement a deterministic, seedable procedural visual-pattern question system. Store patterns as structured data (shape, position, rotation, fill, size, movement, etc.) and render them with React Native SVG primitives. Implement a small believable set of movement/rotation/pattern rules and keep the renderer extensible.

Use a reusable question shell for timer, counter, progress, bookmark, and submit/next. Use task-specific answer renderers; v1 requires a MatrixPatternPicker / FigureSequence renderer.

### Timer

Use `deadlineTimestamp = start + duration` and calculate remaining time from `deadlineTimestamp - Date.now()`. Rendering ticks must not be the source of truth. A timed-out question is recorded as skipped; background handling must not grant free time.

### Results

Show circular score, percentage, correct, incorrect, skipped, comparison with previous performance, and a view-analysis CTA. Persist completed sessions locally.

### Progress features

- **Analytics:** Week / Month / All Time, accuracy trend, and topic mastery. Local calculated or mock historical data is acceptable.
- **Streak:** current streak, weekly activity, longest streak, and total practice time. Use local dates and persistence; no server reconciliation.
- **Achievements:** All / Unlocked / Locked and cards for First Mock, Figure Master, Speedster, and Consistent. Unlocking uses centralized rules.
- **Profile:** avatar, name, email, dMAT level, XP, percentile/rank display, mock history, bookmarks, and notes. Rank/percentile may be mock-derived.
- **Settings:** Edit Profile, Change Password, Email Preferences, Dark Mode, Sound Effects, Haptic Feedback, Language, About dMAT, Terms & Conditions, Privacy Policy, and Help & Support. Locally feasible settings must work locally. Change Password is a prototype placeholder only because v1 uses a local-only user; do not implement password authentication.

## Authentication and data

Do not implement production authentication. Use a local prototype user profile.

Persist onboarding completion, profile, settings, progress, sessions, streak, achievements, and bookmarks locally. Do not introduce a backend for prototype persistence. Use deterministic local mock data; question generation must be reproducible from seed/data.

## Visual and platform requirements

### Design reference

`docs/design/dmat-reference.webp` is the visual source of truth for the prototype UI. It is reference material only and must not be loaded as a runtime application asset.

Treat the supplied reference as the visual source of truth. Key characteristics are a warm off-white background, black typography, handwritten/drawn illustrations, green primary accent, purple and yellow/orange secondary accents, rounded cards, bold friendly typography, subtle borders, playful icons, whitespace, compact mobile-first layouts, and a premium editorial feel.

Create reusable primitives for cards, buttons, progress bars, badges, tabs, typography, icons, and question options. Avoid generic Material-style UI and customize components where needed.

Target Android phones first while remaining iOS-compatible. Avoid unnecessary platform-specific behavior.

## Deferred to v1.1 / out of scope

Firebase, Firestore, Cloud Functions, Remote Config, FCM, Analytics/Crashlytics, AdMob, IAP/payment verification, subscriptions, push notifications, production/server authentication, production security hardening, advanced CI/CD, production infrastructure/deployment, comprehensive E2E or performance/load/resilience testing, elaborate observability, leaderboard backend, real percentile calculation, production content management, and exam integrity/proctoring.

## Definition of done

A new user can launch, complete onboarding, reach Home, navigate the five tabs, open Practice, start Figure Sequences, answer multiple visual questions, use the timer, receive calculated Results, and see Progress, Streak/activity, Achievements, Profile, and local Settings update. The app survives restart, closely matches the supplied design, and passes:

- `npm run lint`
- `npm run typecheck`
- `npm run format:check`
- `npm test`

## Implementation order

1. Design system/theme primitives
2. Onboarding
3. Navigation shell
4. Home
5. Practice
6. Figure Sequence generator
7. Question UI
8. Timer
9. Results
10. Local progress/session persistence
11. Analytics
12. Streak
13. Achievements
14. Profile
15. Settings
16. Visual polish
17. Final prototype validation
