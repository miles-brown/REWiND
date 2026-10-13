# Strict Repository & Workspace Isolation Rule

This rule governs all AI agents, subagents, and automated assistants operating within the REWiND repository.

---

## Mandatory Workspace Boundaries

1. **Strictly Single-Repository Scope**:
   - The agent must operate exclusively within the bounds of `/Users/milesbrown/Github/REWiND` (`~/Github/REWiND`).
   - The canonical repository is `https://github.com/miles-brown/REWiND.git` (remote: `origin`).

2. **Absolute Prohibition on External Repository Access**:
   - The agent is **STRICTLY PROHIBITED** from reading, checking, inspecting, executing, opening, involving, including, or referencing any other project, folder, or repository in the user's filesystem or GitHub directory (including, without limitation, `TS-Now` or any other sibling folder under `~/Github/`).
   - Do NOT check open tabs from external directories, do not search outside `~/Github/REWiND`, and do not suggest or mention other projects.

3. **Zero Cross-Project Contamination**:
   - Never mention or reference external repository names in conversational messages, commit messages, PR descriptions, test cases, code comments, or documentation.
   - All evidentiary schemas, features, and workflows must be strictly self-contained within REWiND.
