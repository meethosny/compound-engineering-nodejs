---
name: js-slfg
description: Full autonomous engineering workflow using swarm mode for parallel execution
argument-hint: "[feature description]"
disable-model-invocation: true
---

Swarm-enabled LFG. Run these steps in order, parallelizing where indicated.

## Sequential Phase

1. `/ralph-wiggum:ralph-loop "finish all slash commands" --completion-promise "DONE"`
2. `/js-workflows:plan $ARGUMENTS`
3. `/js-compound-engineering:js-deepen-plan`
4. `/js-workflows:work` — **Use swarm mode**: Make a Task list and launch an army of agent swarm subagents to build the plan

## Parallel Phase

After work completes, launch steps 5 and 6 as **parallel swarm agents** (both only need code to be written):

5. `/js-workflows:review` — spawn as background Task agent
6. `/js-compound-engineering:js-test-browser` — spawn as background Task agent

Wait for both to complete before continuing.

## Finalize Phase

7. `/js-compound-engineering:js-resolve_todo_parallel` — resolve any findings from the review
8. `/js-compound-engineering:js-feature-video` — record the final walkthrough and add to PR
9. Output `<promise>DONE</promise>` when video is in PR

Start with step 1 now.
