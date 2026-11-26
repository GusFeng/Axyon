# Engineering delivery foundation

Program: AXYON architectural transformation. Package F01.2 (L5 delivery controls). Scope: isolated, credential-free independent CI; no production runtime, data or authorization changes.

Acceptance: locked npm install; build, typecheck, tests, dependency-boundary checks; regenerate all four catalog artifacts and reject drift; build the production container. Workflow has read-only repository permissions, pinned third-party actions, no production secrets, no deployment steps, bounded runtime and concurrency. A passing run on the proposed revision is required before integration. Main protection and required-check settings are separate account controls; this change does not claim they are configured.

Rollback: revert the workflow and documentation commit or abandon its branch. No schema or runtime changes.

Baseline: the deployed Node implementation and the historical Rust implementation are separate sources. The generated module inventory omits the registered performance module (15 versus 16). Restore generated artifact consistency before accepting the gate. Do not conflate historical name mapping with API integration coverage. Treat the legacy runtime and its stored data as independent until active identity and ownership are verified.

Status: VALIDATING. Do not certify phase F01 or deploy based solely on this workflow's existence.
