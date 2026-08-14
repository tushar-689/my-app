# Engineering Operating Manual

## Authority, scope, and approval

This repository will become a production-quality Expo mobile application with a Java/Spring Boot backend, local infrastructure, and durable documentation. This is the repository-wide manual for AI agents; read it before planning or modifying files. More-local `AGENTS.md` files add scoped instructions and take precedence on conflict.

**Explicit approval** means authorization from the repository maintainer/user in the current task or an accepted ADR.

**Scope rule:** apply requirements only when they are within the user-authorized scope. If satisfying a requirement needs a new dependency, toolchain, infrastructure, external-state change, or material scope expansion, stop and request approval. Do not bootstrap absent Docker, CI/CD, testing, documentation, or configuration work merely because this manual describes it.

## Repository map

```text
mobile/     Expo managed-workflow application
backend/    Future Java/Spring Boot modular monolith
docs/       Architecture, ADRs, API, product, and runbook documentation
infra/      Future local/deployment/operational configuration
contracts/  Future shared contracts, including OpenAPI
```

Keep product code, infrastructure, contracts, and documentation separate. Share contracts and schemas across Java and TypeScript; do not share runtime business logic.

## Repository defaults

The following architecture and tooling choices are repository defaults. Deviations require a documented ADR and explicit maintainer approval before implementation.

- Expo managed workflow, Expo Router, strict TypeScript, and feature/domain-oriented mobile code.
- Java + Spring Boot modular monolith initially; microservices are a significant later deviation, not permanently prohibited.
- PostgreSQL as the system of record; Redis only for documented, bounded, non-authoritative use cases.
- REST APIs under `/api/v1`, with OpenAPI as the contract of record.
- OAuth2/OIDC with Authorization Code + PKCE; secure platform storage for mobile credentials.
- Flyway migrations; JUnit 5/Spring Boot testing; Testcontainers for PostgreSQL/Redis integration tests.
- Docker Compose for local infrastructure, GitHub Actions for CI/CD, and EAS for mobile builds.

ADRs are required for significant, irreversible, or cross-cutting architecture decisions—not routine refactors. Record context, decision, alternatives, consequences, owner/date, and status in `docs/decisions/` when that documentation work is in scope.

## Hard safety prohibitions

Unless explicitly requested in the current task, an agent **must not**:

- Commit, push, force-push, create/delete branches, create/modify release tags, or rewrite history.
- Open, merge, close, or modify pull requests; modify GitHub repository or GitHub Actions permissions/settings; send external messages.
- Submit applications to app stores, deploy production infrastructure, or modify production data.
- Run `git reset --hard`, `git clean`, `git checkout -- <files>`, equivalent destructive commands, or destructive reset scripts.
- Execute `mobile/scripts/reset-project.js`; it is a destructive starter-template utility.
- Hardcode, print, commit, or expose secrets, tokens, credentials, personal data, or arbitrary `.env` contents.
- Automatically rotate, revoke, delete, or invalidate credentials/data during incident handling; escalate instead.
- Disable TLS, certificate validation, CORS protection, authentication, authorization, or other security controls to unblock work.

Before editing, inspect `git status`, preserve unrelated user changes, and never overwrite, revert, or format unrelated changes.

## Mobile

- `mobile/AGENTS.md` owns mobile/Expo SDK-specific instructions. The current project uses Expo SDK 57; read the applicable scoped `AGENTS.md` before modifying mobile code.
- Preserve Expo Router. Keep `src/app/` focused on route/layout composition; organize growing application logic by feature/domain.
- Keep platform differences explicit through Expo/React Native APIs and platform modules when needed.
- Choose and document an appropriate server-state strategy; do not treat a global client store as the default cache for remote data.
- Isolate experimental Expo APIs/configuration and regression-test critical use before depending on them.
- `EXPO_PUBLIC_*` values are public. Never put secrets in the mobile client.

## Backend, APIs, and data

- Organize backend modules around API, application, domain, and infrastructure responsibilities. Keep controllers thin, validate boundary DTOs, and never expose persistence entities directly.
- Apply authentication and authorization at backend service/resource boundaries. Use structured logging, correlation IDs, readiness/health checks, and metrics for production integrations.
- Define or update OpenAPI before changing externally consumed endpoints. Specify schemas, validation, status/error responses, auth, pagination/filtering, and idempotency where relevant. Do not invent undocumented APIs or semantics.
- Preserve compatibility under `/api/v1`; breaking changes require a versioning or approved compatibility plan. Keep mobile DTOs separate from persistence entities.
- PostgreSQL owns durable transactional state. Use ordered, immutable Flyway migrations; never edit an applied migration or manually alter shared/production databases. Assess migration lock/time risk and test on a clean database.
- Redis is permitted only with a documented purpose, namespace, owner, TTL, bound, invalidation/fallback strategy, and failure mode. It is never the sole durable store.

## Security, privacy, and configuration

- Threat-model externally exposed or sensitive features. Treat user input, deep links, external responses, and cache contents as untrusted.
- Use TLS for all non-local network traffic; no insecure transport fallback. Allowlist mobile OAuth redirect URIs and validate deep links.
- Design token/session revocation, logout, device-loss, and session-invalidation behavior with authentication changes.
- Apply least privilege, input validation, rate limits where exposed, and audit events for security-sensitive actions.
- Classify sensitive data and protect it in transit, at rest, and in backups. Never copy production data into development/test environments without explicit authorization and appropriate safeguards.
- Use approved secret stores for secrets. Keep environment-specific configuration and service base URLs at configuration boundaries, not in application source; public non-secret constants may be hardcoded when appropriate. Establish safe development defaults.
- Before creating environment files outside `mobile/`, verify root `.gitignore` protection. Do not modify ignore rules unless within task scope.
- Dependency changes require vulnerability scanning, license review, and an SBOM policy appropriate to the delivery process.

## Testing and validation

- Add behavior-focused tests with behavior changes. Keep test data synthetic; isolate and clean up tests and containers.
- Mobile: unit/hook tests, React Native Testing Library component tests, API contract/client tests, accessibility coverage for critical UI/flows, and E2E coverage for critical journeys.
- Backend: JUnit 5/Spring Boot tests, Testcontainers PostgreSQL/Redis integration tests, migration, authorization, validation, error-contract, and unhappy-path coverage.
- Add performance/load testing when scale requirements justify it, and resilience tests for relevant database, Redis, external-provider, and network failures.
- Test commands must never target production or shared environments without explicit approval. EAS preview/production releases require appropriate smoke tests.

**Relevant validation** means validation appropriate to the files and behavior changed, using already-installed or approved tooling where possible. Do not install validation tooling automatically. If required validation cannot run because tooling is absent, report the gap and risk rather than expanding scope.

## Language and infrastructure guidance

- Keep TypeScript strict; prefer `unknown` plus narrowing over `any`; do not use broad casts, `@ts-ignore`, or `@ts-nocheck` without an approved temporary exception and removal plan.
- Use a supported Java LTS and the repository build wrapper once established. Prefer constructor injection, explicit transaction boundaries, focused services, and architecture tests for module boundaries.
- For scoped Docker work, use pinned images, health checks, named local volumes, non-root application containers where feasible, multi-stage builds, and no secrets in images.
- For scoped CI/CD work, ensure clean-checkout reproducibility, lockfiles/build wrappers, relevant tests, migration/contract checks, security scans, and protected release gates.

## Dependencies, documentation, and Codex workflow

- Add/upgrade dependencies only for a documented need and after considering compatibility, maintenance, license, security, size/performance, and native impact. For Expo packages, follow the applicable SDK guidance. Do not install packages, regenerate lockfiles, or make broad upgrades without approval.
- Update documentation, ADRs, contracts, infrastructure, or generated files only when the current task requires them; do not create ADRs or alter unrelated documentation automatically.
- Inspect before modifying; plan before broad, cross-cutting, security-sensitive, destructive, or externally consequential work. Keep changes small, cohesive, and reviewable.
- Never silently change architecture, dependencies, public APIs, security policy, deployment configuration, or working functionality. Ask when a missing decision materially affects the outcome.

## Definition of Done

Do not claim completion when required validation fails. Work is complete only when the authorized behavior is implemented; relevant security/API/migration implications are addressed or explicitly deferred; and applicable validation passes or is clearly reported as unavailable.

The final report must include:

- Files changed.
- Important implementation decisions.
- Validation commands executed and their results.
- Known limitations, validation gaps, risks, and follow-up work.
