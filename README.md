# aha-mcp

Model Context Protocol (MCP) server for accessing Aha! records through the MCP. This integration enables seamless interaction with Aha! features, requirements, and pages directly through the Model Context Protocol.

## Prerequisites

- Node.js v20 or higher
- npm (usually comes with Node.js)
- An Aha! account with API access

## Installation

### Using npx

```bash
npx -y aha-mcp@latest
```

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/aha-develop/aha-mcp.git
cd aha-mcp

# Install dependencies
npm install

# Run the server
npm run mcp-start
```

## Authentication Setup

1. Log in to your Aha! account at `<yourcompany>.aha.io`
2. Visit [secure.aha.io/settings/api_keys](https://secure.aha.io/settings/api_keys)
3. Click "Create new API key"
4. Copy the token immediately (it won't be shown again)

For more details about authentication and API usage, see the [Aha! API documentation](https://www.aha.io/api).

## Environment Variables

This MCP server requires the following environment variables:

- `AHA_API_TOKEN`: Your Aha! API token
- `AHA_DOMAIN`: Your Aha! domain (e.g., yourcompany if you access aha at yourcompany.aha.io)
- `AHA_PROJECT_ID` (optional): Default project ID for idea tools — used when no `projectId` is passed

## IDE Integration

For security reasons, we recommend using your preferred secure method for managing environment variables rather than storing API tokens directly in editor configurations. Each editor has different security models and capabilities for handling sensitive information.

Below are examples of how to configure various editors to use the aha-mcp server. You should adapt these examples to use your preferred secure method for providing the required environment variables.

### VSCode

The instructions below were copied from the instructions [found here](https://code.visualstudio.com/docs/copilot/chat/mcp-servers#_add-an-mcp-server).

Add this to your `.vscode/settings.json`, using your preferred method to securely provide the environment variables:

```json
{
  "mcp": {
    "servers": {
      "aha-mcp": {
        "command": "npx",
        "args": ["-y", "aha-mcp"]
        // Environment variables should be provided through your preferred secure method
      }
    }
  }
}
```

### Cursor

1. Go to Cursor Settings > MCP
2. Click + Add new Global MCP Server
3. Add a configuration similar to:

```json
{
  "mcpServers": {
    "aha-mcp": {
      "command": "npx",
      "args": ["-y", "aha-mcp"]
      // Environment variables should be provided through your preferred secure method
    }
  }
}
```

### Cline

Add a configuration to your `cline_mcp_settings.json` via Cline MCP Server settings:

```json
{
  "mcpServers": {
    "aha-mcp": {
      "command": "npx",
      "args": ["-y", "aha-mcp"]
      // Environment variables should be provided through your preferred secure method
    }
  }
}
```

### RooCode

Open the MCP settings by either:

- Clicking "Edit MCP Settings" in RooCode settings, or
- Using the "RooCode: Open MCP Config" command in VS Code's command palette

Then add:

```json
{
  "mcpServers": {
    "aha-mcp": {
      "command": "npx",
      "args": ["-y", "aha-mcp"]
      // Environment variables should be provided through your preferred secure method
    }
  }
}
```

### Claude Desktop

Add a configuration to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "aha-mcp": {
      "command": "npx",
      "args": ["-y", "aha-mcp"]
      // Environment variables should be provided through your preferred secure method
    }
  }
}
```

## Available MCP Tools

### 1. get_record

Retrieves an Aha! feature or requirement by reference number.

**Parameters:**

- `reference` (required): Reference number of the feature or requirement (e.g., "DEVELOP-123")

**Example:**

```json
{
  "reference": "DEVELOP-123"
}
```

**Response:**

```json
{
  "reference_num": "DEVELOP-123",
  "name": "Feature name",
  "description": "Feature description",
  "workflow_status": {
    "name": "In development",
    "id": "123456"
  }
}
```

### 2. get_page

Gets an Aha! page by reference number.

**Parameters:**

- `reference` (required): Reference number of the page (e.g., "ABC-N-213")
- `includeParent` (optional): Include parent page information. Defaults to false.

**Example:**

```json
{
  "reference": "ABC-N-213",
  "includeParent": true
}
```

**Response:**

```json
{
  "reference_num": "ABC-N-213",
  "name": "Page title",
  "body": "Page content",
  "parent": {
    "reference_num": "ABC-N-200",
    "name": "Parent page"
  }
}
```

### 3. search_documents

Searches for Aha! documents.

**Parameters:**

- `query` (required): Search query string
- `searchableType` (optional): Type of document to search for (e.g., "Page"). Defaults to "Page"

**Example:**

```json
{
  "query": "product roadmap",
  "searchableType": "Page"
}
```

**Response:**

```json
{
  "results": [
    {
      "reference_num": "ABC-N-123",
      "name": "Product Roadmap 2025",
      "type": "Page",
      "url": "https://company.aha.io/pages/ABC-N-123"
    }
  ],
  "total_results": 1
}
```

### 4. search_ideas

Searches for Aha! ideas with optional filters and pagination.

**Parameters:**

- `query` (optional): Search query string
- `workflowStatusId` (optional): Filter by status ID server-side — get IDs from `get_project_metadata`
- `workflowStatus` (optional): Filter by status name client-side (fallback; less reliable)
- `updatedSince` (optional): ISO 8601 timestamp — auto-paginates to find all updated ideas
- `projectId` (optional): Scope to a specific project (defaults to `AHA_PROJECT_ID`)
- `maxPages` (optional): Pagination cap (default 50, max 100)

### 5. get_idea

Gets full details for a single Aha! idea.

**Parameters:**

- `reference` (required): Idea reference number (e.g., `APP-I-123`)

### 6. update_idea

Updates built-in fields on an Aha! idea. For custom fields, use `set_idea_custom_fields`.

**Parameters:**

- `id` (required): Idea reference number (e.g., `APP-I-123`) or internal ID
- `fields` (required): Object with any of: `name`, `workflowStatus` (`{name}` or `{id}`), `score`, `assignedToUser` (`{email}` or `{id}`), `tags` (replaces entirely), `addIdeaCategories`, `removeIdeaCategories`

### 7. get_project_metadata

Gets workflow status IDs and category IDs for an Aha! project. Call this before filtering or updating ideas.

**Parameters:**

- `projectId` (optional): Defaults to `AHA_PROJECT_ID`

### 8. set_idea_custom_fields

Sets custom field values on an idea (impact, urgency, etc.).

**Parameters:**

- `id` (required): Idea reference number or internal ID
- `customFields` (required): Array of `{key, value}` pairs — get valid keys from `get_idea_portal_fields`

### 9. post_idea_comment

Posts a comment on an Aha! idea (HTML supported).

**Parameters:**

- `ideaId` (required): Idea reference number (e.g., `APP-I-123`)
- `body` (required): Comment body (HTML)

### 10. get_idea_portal_fields

Lists all custom field definitions for an ideas portal (keys, display names, types, valid options).

**Parameters:**

- `ideaRef` (optional): Any idea reference from the project — auto-detected if omitted

### 11. introspect_idea_type

Runs GraphQL introspection on an Aha! type for schema exploration.

**Parameters:**

- `typeName` (optional): GraphQL type name (default: `Idea`)

## Example Queries

- "Get feature DEVELOP-123"
- "Fetch the product roadmap page ABC-N-213"
- "Search for pages about launch planning"
- "Get requirement ADT-123-1"
- "Find all ideas in 'Under Review' status"
- "Show me ideas updated since last week"
- "Set the impact custom field on APP-I-456 to High"

## Multi-Step Workflow Examples

**Search ideas by status:**
```
1. get_project_metadata  →  find workflowStatus ID for "Under Review"
2. search_ideas({ workflowStatusId: "<id>" })
```

**Update idea status:**
```
1. get_project_metadata  →  confirm status name/ID
2. update_idea({ id: "APP-I-123", fields: { workflowStatus: { name: "Shipped" } } })
```

**Set custom fields:**
```
1. get_idea_portal_fields  →  find field keys and valid option values
2. set_idea_custom_fields({ id: "APP-I-123", customFields: [{ key: "impact", value: "High" }] })
```

See [`docs/WORKFLOWS.md`](docs/WORKFLOWS.md) for the full workflow reference.

## Configuration Options

| Variable          | Description                                      | Default  |
| ----------------- | ------------------------------------------------ | -------- |
| `AHA_API_TOKEN`   | Your Aha! API token                              | Required |
| `AHA_DOMAIN`      | Your Aha! domain subdomain (e.g., `yourcompany`) | Required |
| `AHA_PROJECT_ID`  | Default project ID for idea tools                | Optional |

## Troubleshooting

<details>
<summary>Common Issues</summary>

1. Authentication errors:

   - Verify your API token is correct and properly set in your environment
   - Ensure the token has the necessary permissions in Aha!
   - Confirm you're using the correct Aha! domain

2. Server won't start:

   - Ensure all dependencies are installed
   - Check the Node.js version is v20 or higher
   - Verify the TypeScript compilation succeeds
   - Confirm environment variables are properly set and accessible

3. Connection issues:

   - Check your network connection
   - Verify your Aha! domain is accessible
   - Ensure your API token has not expired

4. API Request failures:

   - Check the reference numbers are correct
   - Verify the searchable type is valid
   - Ensure you have permissions to access the requested resources

5. Environment variable issues:
   - Make sure environment variables are properly set and accessible to the MCP server
   - Check that your secure storage method is correctly configured
   - Verify that the environment variables are being passed to the MCP server process
   </details>
