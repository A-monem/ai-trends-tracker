# MCP Server Setup Guide

This guide will help you install and configure MCP (Model Context Protocol) servers for the AI Trends Tracker project.

## What are MCP Servers?

MCP servers extend Claude Code's capabilities by providing access to external tools and data sources:
- **PostgreSQL MCP**: Query your database directly from Claude
- **GitHub MCP**: Create issues, review PRs, manage project
- **Custom MCP servers**: Build your own tools (e.g., Reddit API)

---

## Prerequisites

Before installing MCP servers:

1. **Start PostgreSQL**
   ```bash
   cd /Users/abdelmoneimnafea/Documents/Personal/Projects/ai-trends-tracker
   docker-compose up -d postgres
   ```

   This will start PostgreSQL on `localhost:5432`

2. **Verify PostgreSQL is running**
   ```bash
   psql postgresql://postgres:postgres@localhost:5432/ai_trends -c "SELECT 1;"
   ```

   You should see:
   ```
    ?column?
   ----------
            1
   ```

---

## Installing MCP Servers

### 1. PostgreSQL MCP Server

**Install:**
```bash
claude mcp add \
  --transport stdio \
  db \
  -- npx -y @modelcontextprotocol/server-postgres \
  postgresql://postgres:postgres@localhost:5432/ai_trends
```

**What this does:**
- Adds a PostgreSQL server named `db`
- Uses the `stdio` transport protocol
- Connects to your local PostgreSQL database
- Runs via `npx` (no global install needed)

**Test it:**
Start a new Claude Code session and try:
```
Show me the database schema for ai_trends
```

Or:
```
Query the database to count how many trends we have
```

**Expected response:**
Claude will execute the query and show you results from your database.

---

### 2. GitHub MCP Server (Optional)

**Install:**
```bash
claude mcp add \
  --transport http \
  github \
  https://api.githubcopilot.com/mcp/
```

**Authenticate:**
```bash
# In Claude Code, type:
/mcp
# Then select "Authenticate" for GitHub
```

**Test it:**
```
List all GitHub issues for this project
```

Or:
```
Create a GitHub issue titled "Add trending topics feature"
```

---

### 3. Verify Installation

**List installed MCP servers:**
```bash
claude mcp list
```

You should see:
```
db (stdio) - @modelcontextprotocol/server-postgres
github (http) - https://api.githubcopilot.com/mcp/
```

**Check logs:**
```bash
claude mcp logs db
```

---

## Using MCP Servers

### PostgreSQL Queries

Once installed, you can query your database directly from Claude:

**Examples:**
```
Query the database to show all sources where is_active = true

Show me the 10 most recent trends from the database

Count how many trends were scraped today

Show me trends that don't have AI summaries yet

Find duplicate URLs in the trends table
```

**Complex queries:**
```
Query the database to show:
- Top 5 categories by trend count
- Average trends per source
- Success rate of scrapers (last_success_at vs last_fetched_at)
```

### GitHub Operations

**Examples:**
```
Create a GitHub issue for implementing the weekly digest feature

List all open PRs for this repository

Review the latest PR and suggest improvements

Create a new branch called "feature/reddit-scraper"
```

---

## Building a Custom MCP Server (Advanced)

You can build custom MCP servers for any API or tool. Here's how to create a Reddit MCP server:

### Step 1: Create the Server

Create `apps/backend/src/mcp-servers/reddit-server.ts`:

```typescript
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

// Create MCP server
const server = new Server(
  {
    name: 'reddit-ai-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'search_ai_posts',
      description: 'Search AI-related posts from Reddit',
      inputSchema: {
        type: 'object',
        properties: {
          subreddit: {
            type: 'string',
            description: 'Subreddit to search (e.g., MachineLearning, artificial)',
          },
          query: {
            type: 'string',
            description: 'Search query',
          },
          timeframe: {
            type: 'string',
            enum: ['hour', 'day', 'week', 'month', 'year'],
            description: 'Time range for search',
          },
        },
        required: ['subreddit'],
      },
    },
    {
      name: 'get_top_posts',
      description: 'Get top posts from an AI subreddit',
      inputSchema: {
        type: 'object',
        properties: {
          subreddit: {
            type: 'string',
            description: 'Subreddit name',
          },
          timeframe: {
            type: 'string',
            enum: ['hour', 'day', 'week', 'month', 'year'],
            default: 'week',
          },
          limit: {
            type: 'number',
            default: 10,
            maximum: 100,
          },
        },
        required: ['subreddit'],
      },
    },
  ],
}));

// Implement tool handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'search_ai_posts') {
    const { subreddit, query, timeframe = 'week' } = args;

    try {
      const response = await axios.get(
        `https://www.reddit.com/r/${subreddit}/search.json`,
        {
          params: {
            q: query || '',
            restrict_sr: true,
            sort: 'relevance',
            t: timeframe,
            limit: 25,
          },
          headers: {
            'User-Agent': 'AI-Trends-Tracker/1.0',
          },
        }
      );

      const posts = response.data.data.children.map((child: any) => ({
        title: child.data.title,
        url: child.data.url,
        score: child.data.score,
        author: child.data.author,
        created: new Date(child.data.created_utc * 1000),
        num_comments: child.data.num_comments,
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(posts, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error searching Reddit: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  if (name === 'get_top_posts') {
    const { subreddit, timeframe = 'week', limit = 10 } = args;

    try {
      const response = await axios.get(
        `https://www.reddit.com/r/${subreddit}/top.json`,
        {
          params: {
            t: timeframe,
            limit,
          },
          headers: {
            'User-Agent': 'AI-Trends-Tracker/1.0',
          },
        }
      );

      const posts = response.data.data.children.map((child: any) => ({
        title: child.data.title,
        url: child.data.url,
        score: child.data.score,
        num_comments: child.data.num_comments,
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(posts, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching top posts: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Reddit MCP server running on stdio');
}

main().catch(console.error);
```

### Step 2: Make it Executable

```bash
chmod +x apps/backend/src/mcp-servers/reddit-server.ts
```

### Step 3: Install Dependencies

```bash
cd apps/backend
npm install @modelcontextprotocol/sdk
```

### Step 4: Register with Claude

```bash
claude mcp add \
  --transport stdio \
  reddit \
  -- tsx apps/backend/src/mcp-servers/reddit-server.ts
```

### Step 5: Test It

```
Search r/MachineLearning for posts about "GPT-4" from this week

Get top 10 posts from r/artificial from this month
```

---

## Troubleshooting

### MCP Server Not Found

**Problem:** `Error: MCP server 'db' not found`

**Solution:**
1. Check installation: `claude mcp list`
2. Reinstall: `claude mcp remove db` then reinstall
3. Check logs: `claude mcp logs db`

### Database Connection Failed

**Problem:** `Error connecting to PostgreSQL`

**Solution:**
1. Verify PostgreSQL is running: `docker ps | grep postgres`
2. Test connection: `psql postgresql://postgres:postgres@localhost:5432/ai_trends`
3. Check database exists: `psql -l`

### Permission Denied

**Problem:** `Permission denied when running MCP server`

**Solution:**
```bash
chmod +x apps/backend/src/mcp-servers/*.ts
```

### MCP Server Crashes

**Problem:** MCP server crashes on startup

**Solution:**
1. Check logs: `claude mcp logs [server-name]`
2. Test script directly: `tsx apps/backend/src/mcp-servers/reddit-server.ts`
3. Check dependencies are installed

---

## MCP Server Best Practices

1. **Error Handling:**
   - Always wrap API calls in try-catch
   - Return helpful error messages
   - Log errors for debugging

2. **Rate Limiting:**
   - Respect API rate limits
   - Implement exponential backoff
   - Cache responses when possible

3. **Security:**
   - Never expose API keys in MCP server code
   - Use environment variables
   - Validate all inputs

4. **Testing:**
   - Test each tool individually
   - Mock API responses in tests
   - Handle edge cases (empty results, errors)

---

## Next Steps

1. ✅ Install PostgreSQL MCP server
2. ✅ Test database queries from Claude
3. ✅ Install GitHub MCP server (optional)
4. ✅ Build custom Reddit MCP server (Phase 5)

Once MCP servers are installed, you can use them throughout development to:
- Debug database issues
- Query data for insights
- Manage GitHub workflow
- Access external APIs easily

Happy MCP-ing! 🚀
