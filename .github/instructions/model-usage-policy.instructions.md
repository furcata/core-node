# Model Usage Policy

## Non-negotiable rule
- Never claim local models were not used due to missing specification.

## Instruction precedence

## Primary optimization objective
1. Lowest cost
2. Fastest completion
3. Sufficient quality to pass acceptance criteria

## Paid-model allowance (explicit)

## Mandatory pre-task routing step (required)


## Default model routing
**Orchestration (default: PAID model)**

**Execution routing (dynamic: PAID or LOCAL)**


## Local-model task coverage (when to use)


## Orchestration approval gate (required)


## Plan adherence and anti-divergence rule

## Task decomposition policy (cost control)
- Use sequential execution only for true dependencies.

## Time-budget and anti-blocking policy

## Escalation policy (strict)
Escalate to paid model when any condition is true:
2. Two local attempts failed on the same blocking subtask.
3. Cross-repo/architecture reasoning exceeds local reliability.



## Prompting requirements for local child sessions
Every child kickoff must include:

## Main-session tracking & reporting (required)


## Required output format after each completed task

- Task ID
- Repo/Branch
- Commit Title
- Commit SHA
- Model (s) Used
- Start Time
- End Time
- Duration
- Est. Human Time
- Actual/Estimated Cost (USD)
- Notes

Also provide rolling totals:
- Total child tasks completed
- Total elapsed runtime
- Total estimated human time saved
- Total cost (USD), split by local vs paid

## Mandatory prompt-quality retrospective

## Cost governance rules

## Orchestrator behavior

## Approved local endpoint



## Session lifecycle and remote trace elimination

## Pending work tracking with issues
