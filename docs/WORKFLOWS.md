# Aha! MCP — Multi-Step Workflows

## A: Search ideas by status name

Status filtering requires the numeric ID, not the display name.

```
1. get_project_metadata()
   → find workflowStatus ID for "Under Review"

2. search_ideas({ workflowStatusId: "<id>" })
   → returns matching ideas
```

## B: Update an idea's workflow status

```
1. get_project_metadata()
   → find status ID or confirm display name

2. update_idea({ id: "APP-I-123", fields: { workflowStatus: { name: "Shipped" } } })
   → accepts { name } or { id }
```

## C: Set custom field values

```
1. get_idea_portal_fields({ ideaRef: "APP-I-123" })
   → find valid field keys and option values

2. set_idea_custom_fields({
     id: "APP-I-123",
     customFields: [{ key: "impact", value: "High" }]
   })
```

## D: Add a category to an idea

```
1. get_project_metadata()
   → find category ID for "Mobile"

2. update_idea({
     id: "APP-I-123",
     fields: { addIdeaCategories: [{ id: "<category_id>" }] }
   })
```

## E: Triage recently updated ideas

```
1. search_ideas({ updatedSince: "2026-05-01T00:00:00Z" })
   → auto-paginates; add workflowStatusId to scope

2. For each idea needing action:
   update_idea(...)          → change status/score/assignee
   set_idea_custom_fields(...) → set custom fields

3. post_idea_comment({ ideaId: "APP-I-123", body: "<p>Reviewed.</p>" })
   → notify submitter; body accepts HTML
```

## F: Add a tag without losing existing tags

```
1. get_idea({ reference: "APP-I-123" })
   → read current tags array

2. update_idea({
     id: "APP-I-123",
     fields: { tags: [...existingTags, "new-tag"] }
   })
   → tags field replaces entirely
```
