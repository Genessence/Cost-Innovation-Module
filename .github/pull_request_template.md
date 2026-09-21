<!--
  Genessence standard PR template. Every section is MANDATORY.
  The "Test cases" section is validated by CI (pr-check-test-cases) — a PR to
  main/develop will fail its checks if Test cases is empty or still contains the
  placeholder rows below. Fill it in properly.
-->

## Summary
<!-- 2-4 sentences: what this PR does and why. -->

## Linked ticket
<!-- Jira/Linear/GitHub issue link. Use "Closes #123" to auto-close. -->

## Features changed
<!-- Bullet list of user-facing features / modules touched. -->
-

## Test cases
<!--
  MANDATORY. At least one fully filled row. Delete the placeholder comments.
  QA fills the "QA (pass/fail)" column during review.
-->
| # | Steps | Expected result | QA (pass/fail) |
|---|-------|-----------------|----------------|
| 1 | <!-- steps --> | <!-- expected --> | <!-- pass/fail --> |

## What the CTO should verify
<!-- The 1-3 highest-risk things I (the CTO) should personally confirm before approving. -->
-

## Screenshots
<!-- Before/after screenshots or a short screen recording for any UI change. N/A if none. -->

## DB / env changes
<!-- New migrations, schema changes, new env vars / secrets, feature flags. Write "None" if none. -->
None

## Rollback plan
<!-- Exact steps to revert this change safely in production (revert commit? toggle flag? restore DB?). -->
