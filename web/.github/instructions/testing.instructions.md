---

## applyTo: "tests/**/\*.ts,tests/**/_.tsx,src/mocks/\*\*/_.ts,playwright.config.ts"

description: "Use when adding or editing tests, Playwright cases, MSW handlers, mock data, or test configuration. Keywords: test, e2e, playwright, mock, msw, coverage."

# Testing Instructions

## Purpose

Keep tests fast, deterministic, and aligned with core business flows.

## Do

- Prioritize core flows first (auth, users CRUD, permission gates).
- Keep assertions user-visible and behavior-focused.
- Reuse existing helper patterns in tests before adding new helpers.
- Keep mock handlers and mock data synchronized with API schemas.
- Prefer focused test runs over full-suite runs during iteration.

## Do Not

- Do not add brittle selectors tied to unstable DOM internals.
- Do not expand fixture data without a clear scenario need.
- Do not duplicate scenarios already covered by existing tests.

## Validation

- Run focused tests first, then broader checks if needed.
- Run: `vp check --no-fmt`
