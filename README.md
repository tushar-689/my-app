# dMAT

dMAT Prep is a local-first Expo mobile app for practicing the dMAT Core reasoning modules and exploring a timed Core Practice Mock.

## Current status

**Playable Alpha / Investor Demo Candidate**

The mobile app currently includes onboarding, local practice sessions, a Core Practice Mock, results, progress views, profile/settings, dark mode, XP, levels, streaks, achievements, and local persistence.

This is not production-ready. Backend/cloud integration, authentication, account sync, notifications, payments, and server-backed data are not implemented. The app uses a light-only theme. Physical-device QA remains pending, and a known Android rendering issue in Figure Sequences is deferred.

## Core features

### Onboarding

- Three-slide first-launch onboarding
- Persisted completion state

### Practice

- Figure Sequences
- Mathematical Equations
- Latin Squares
- Deterministic procedural question generation
- Timed sessions with submit, skip, and timeout handling
- Results and local practice history

### Core Practice Mock

- 30 mixed Core questions
- 10-minute overall timer
- 10 questions per Core module
- Deterministic question selection
- Clearly labeled alpha, non-official format

### Progress

- Analytics derived from local practice history
- Streak and weekly activity
- Achievement evaluation
- Module performance summaries

### Gamification

- XP awarded once for completed sessions
- Deterministic levels and XP progress
- Combo calculation foundation
- Streaks and achievements derived from local activity

### Profile and settings

- Local editable name and email
- Persisted profile and settings
- Consistent light-only dMAT theme
- Intentional local informational screens for About, Terms, Privacy, and Help
- Authentication-dependent actions are clearly unavailable
- Local haptic and sound-effect preferences with graceful platform fallback
- Local demo ad placements and a clearly non-purchasable dMAT PREP+ preview

## Architecture

- Expo SDK 57, React Native, Expo Router, and strict TypeScript
- Generic question contracts and task-specific generators/validators/renderers
- Shared `AssessmentSession`, timer, scoring, and results infrastructure
- Core Mock orchestration over the three existing question engines
- AsyncStorage for onboarding, profile, settings, practice history, and gamification state
- Jest, Jest Expo, and React Native Testing Library tests
- Lightweight React Native feedback animations, local haptics, and Expo Audio feedback
- Demo ad components are isolated under `features/ads` for future provider replacement
- Asset policy and current inventory are documented in `design/assets/LICENSES.md`

## Development

```bash
cd mobile
npm install
npm start
```

Available validation commands:

```bash
npm run lint
npm run typecheck
npm run format:check
npm test
git diff --check
```

Use a supported Node.js/npm toolchain and an Expo development environment. No backend, Java, database, Docker, or cloud credentials are required for the current local prototype.

## Repository layout

```text
mobile/     Expo mobile application
docs/       Product and design documentation
backend/    Reserved for future backend work
infra/      Reserved for future infrastructure work
contracts/  Reserved for future shared contracts
```

## Known limitations

- The Core Practice Mock is an alpha practice experience, not an official exam reproduction.
- Sound and haptic feedback are local-device features and may silently degrade on unsupported devices.
- Lottie celebrations use one small original local asset; real advertising is not included and clearly labeled demo ad placements are used instead.
- Figure Sequences may render incorrectly on Android after transitions; this is deferred for later investigation.
- Backend integration, authentication, cloud sync, and production deployment are out of scope.
