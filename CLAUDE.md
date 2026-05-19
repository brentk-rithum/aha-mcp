# Aha! MCP — Quick Reference

## Reference Number Formats

| Type        | Format        | Example       |
|-------------|---------------|---------------|
| Feature     | PREFIX-###    | DEVELOP-123   |
| Requirement | PREFIX-###-## | ADT-123-1     |
| Idea        | PREFIX-I-###  | APP-I-123     |
| Page/Note   | PREFIX-N-###  | ABC-N-213     |

## Tool Selection

| Goal | Tool |
|------|------|
| Get feature or requirement | `get_record` |
| Get wiki/notes page | `get_page` |
| Search wiki pages | `search_documents` |
| Search or list ideas | `search_ideas` |
| Get full idea detail | `get_idea` |
| Update name/status/score/assignee/tags/categories | `update_idea` |
| Set custom fields (impact, urgency, etc.) | `set_idea_custom_fields` |
| Post comment on idea | `post_idea_comment` |
| Get status IDs and category IDs | `get_project_metadata` |
| Get custom field keys and options | `get_idea_portal_fields` |
| Inspect GraphQL schema | `introspect_idea_type` |

## Critical Gotchas

- `update_idea` and `set_idea_custom_fields` accept `referenceNum` (e.g. `APP-I-123`) as `id`
- Prefer `workflowStatusId` in `search_ideas` (server-side); `workflowStatus` name is client-side only and may miss results
- Get status/category IDs from `get_project_metadata` before filtering or updating
- `tags` in `update_idea` **replaces** entirely — read existing tags via `get_idea` first
- Built-in fields → `update_idea`; custom fields → `set_idea_custom_fields`
- See [`docs/WORKFLOWS.md`](docs/WORKFLOWS.md) for multi-step patterns

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `AHA_API_TOKEN` | Yes | Bearer token for Aha! API |
| `AHA_DOMAIN` | Yes | Subdomain (e.g. `mycompany` for mycompany.aha.io) |
| `AHA_PROJECT_ID` | No | Default project scope for idea tools |

## Execution rules - mandatory

### Before writing any code
Ask clarifying questions until 95% confident in requirements. Do not write
a single line of code until the plan is confirmed. If requirements shift
mid-session, stop and re-confirm before continuing.

### Context discipline
Only read files directly relevant to the current task. Do not load entire
directories. Break large problems into focused steps. If context hits 60%,
run /compact with explicit retain args (e.g., /compact retain schema,
failing tests, API decisions). Switch tasks with /clear, not /compact.

### Todo lists and verification gates
Maintain a todo list for every multi-step task. Do not mark a step complete
until it is verified:
- UI changes: take a screenshot and confirm it matches the spec
- API/backend: hit the endpoint and show the response
- Do not advance to the next step until 95% confident the current one is done

### Ultrathink trigger
For architecture decisions, complex bugs, or after 2+ failed attempts at
the same problem - use ultrathink. Do not use it for routine tasks.

### Challenging outputs
If an output is just okay, push for a better version before moving on.
Once a better approach is found, update sdlc/lessons.md so it is not
forgotten.
