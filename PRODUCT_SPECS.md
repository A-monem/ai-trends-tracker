# AI Trends Tracker - Product Specifications

## Target Users

**Primary user:** Developer (personal use) - a daily tool to stay updated with AI news

**Secondary audience:** Portfolio reviewers (recruiters, hiring managers) to demonstrate full-stack development capabilities

## Problems Solved

- **Information overload:** Too many AI news sources to track individually
- **Time constraints:** No time to read every full article across multiple platforms
- **Scattered content:** AI news spread across RSS feeds, YouTube, Reddit, Hacker News
- **Missing important updates:** Easy to miss key developments when sources aren't centralized

## User Workflows

### Browsing Trends

**Main Feed View:**

- User lands on a single-page feed showing all aggregated articles
- Articles displayed as cards in a grid layout (responsive: 1 column mobile, 2-3 columns desktop)
- Each card shows: title, source name, publish date, and AI-generated summary preview (2-3 lines)
- Cards sorted by publish date (newest first)

**Viewing Article Details:**

- User clicks on a card to expand and see the full AI summary
- Summary panel displays: complete AI summary, source name, publish date
- "Read Original" button links to the full article on the source website (opens in new tab)
- User can close the panel and return to the feed

### Filtering Content

**Source Filter:**

- Dropdown or button group at the top of the feed
- Options: "All Sources" (default), or individual source names (e.g., "TechCrunch", "MIT Tech Review")
- Selecting a source instantly filters the feed to show only articles from that source
- Active filter is visually highlighted

### Refreshing Content

**Manual Refresh (MVP):**

- "Refresh" button prominently placed in the header
- Clicking triggers backend to fetch new articles from all RSS sources
- Loading indicator shows while fetching
- New articles appear at the top of the feed once complete
- Button disabled during refresh to prevent duplicate requests

**Automated Refresh (V1):**

- Cron job runs every 6 hours to fetch new content automatically
- No user action required - feed stays updated in the background

## Content Sources

### MVP - RSS Feeds

| Source                | Description                       |
| --------------------- | --------------------------------- |
| TechCrunch AI         | AI news and startup coverage      |
| VentureBeat AI        | Enterprise AI and industry news   |
| MIT Technology Review | In-depth AI research and analysis |
| The Verge AI          | Consumer-focused AI news          |
| Ars Technica          | Technical AI coverage             |
| Wired AI              | AI trends and culture             |

### V1 - Additional Sources

| Source                                             | Type       |
| -------------------------------------------------- | ---------- |
| YouTube (Two Minute Papers, Andrej Karpathy, etc.) | Video      |
| Hacker News                                        | Discussion |
| Reddit (r/MachineLearning, r/artificial)           | Discussion |

**YouTube Processing:**

- Uses video transcripts (auto-generated captions), not actual video
- Fetch metadata via YouTube API (title, channel, publish date)
- Extract transcript text for summarization
- Same workflow as RSS articles (text in → summary out)
- Limitation: Some videos may lack transcripts

## AI Processing

### Model Selection

**MVP: Claude 3.5 Haiku**

- Cost-effective for straightforward summarization tasks
- Fast response times
- Sufficient quality for news article summaries

### Estimated Costs

Based on ~100 articles/day:

| Direction | Description                    | Monthly Cost    |
| --------- | ------------------------------ | --------------- |
| Input     | Article content sent to Claude | ~$0.75          |
| Output    | Summaries received from Claude | ~$1.90          |
| **Total** |                                | **~$2-3/month** |

---

**Document Version:** 1.0
**Last Updated:** 2026-01-31
