# Setup: Add a feedback recorder to a project

Use this path when the user has no recording yet and wants to start capturing product feedback with a session recorder.

A session recorder is a browser-based capture tool that records the screen, microphone audio, console output, network requests, and DOM events into a single feedback bundle (a `.zip` containing `session.json`, `events.json`, `recording.webm`, and `voice.webm`). The bundle is what this skill consumes downstream. Any recorder that emits this bundle shape works — pick one that fits the team's stack (an in-app recorder package, a browser extension, or a small custom MediaRecorder + event-listener harness wired into the web app).

## What to tell the user

1. Choose a session recorder that emits the bundle shape above. Treat its own README/docs as the source of truth for the current install command — it may change.
2. The general shape of integration:
   - Add the recorder script or package to the project's web app.
   - Wire a "Record feedback" affordance somewhere accessible during real use (a bug report button, a dev-only floating recorder, or a keyboard shortcut).
   - Confirm a sample session ends with a downloadable feedback `.zip` bundle.
3. Once a bundle exists, the user runs this skill again with the bundle path. The skill will pick the **quick bug report** or **extensive analysis** path automatically based on length and content.

## Recommended capture habits

Surface these to the user during setup so the recordings they share later are easy to analyze:

- Speak the issue out loud while reproducing it. The transcript is the single highest-signal artifact.
- Click the affected UI even when it does nothing — failed clicks are the strongest signal in event extraction.
- Keep recordings focused. Many short clips beat one long one when issues are unrelated.
- Note when a step is intentional vs. accidental ("oops, that wasn't what I meant"). The analyzer cannot infer intent.

## After install

When the user returns with their first bundle, route to `references/quick-bug-report.md` or `references/extensive-analysis.md` per the SKILL.md routing rules. Do not run the analyzer in the setup path — there is nothing to analyze yet.
