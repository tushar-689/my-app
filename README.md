# Repository Foundation

This repository is the foundation for a production-quality mobile application and its future supporting services. Product-specific functionality has not yet been defined.

## Structure

```text
mobile/     Expo managed-workflow application
backend/    Planned Java/Spring Boot modular monolith
docs/       Architecture, ADR, API, product, and runbook documentation
infra/      Planned local and deployment configuration
contracts/  Planned shared contracts, including OpenAPI
```

## Technology direction

The mobile application uses Expo SDK 57, Expo Router, React Native, React, and strict TypeScript. The planned backend is a Java and Spring Boot modular monolith, with PostgreSQL as its system of record and REST APIs documented through OpenAPI.

## Local development

Install a supported Node.js/npm toolchain and the Expo development environment needed for the `mobile/` application. Java, PostgreSQL, Redis, Docker Compose, and EAS tooling are not required for the current foundation unless a later scoped task introduces the corresponding component.

Use the package scripts from `mobile/` to run the app during mobile development. Keep dependencies and generated files under review; do not commit local environment files or credentials.

## Workflow

1. Review the applicable `AGENTS.md` instructions before making changes.
2. Work within the relevant directory and keep changes small and cohesive.
3. Run validation appropriate to the files changed, using existing tooling.
4. Inspect the diff and do not commit or deploy unless explicitly authorized.

Architecture decisions, API contracts, product material, and operational documentation belong in `docs/`; shared API contracts belong in `contracts/` when introduced.

## Codex instructions

The root `AGENTS.md` defines repository-wide engineering and safety practices. More-specific `AGENTS.md` files, such as `mobile/AGENTS.md`, add instructions for their own directory and take precedence where they differ.

## Status

The mobile project scaffold is present. Backend services, local infrastructure, API contracts, CI/CD, authentication, testing suites, and production deployment are not established by this repository foundation.
