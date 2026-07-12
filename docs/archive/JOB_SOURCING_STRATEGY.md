# Job Sourcing Strategy

## Overview
This job board operates without a database for the MVP phase. All job listings are stored as static JSON files in the repository and link directly to external company websites.

## Architecture Approach

### Static-First Design
- **No Database**: Jobs stored in `src/data/jobs.json` (or similar structure)
- **Static Generation**: Next.js generates static pages at build time
- **Fast Performance**: No database queries, instant page loads
- **Simple Deployment**: Just deploy static files

### Job Data Structure
```typescript
interface Job {
  id: string;                    // Unique identifier (slug or UUID)
  title: string;                 // Job title
  company: string;               // Company name
  companySlug: string;          // URL-friendly company identifier
  location: string;              // Location (e.g., "Remote, USA")
  externalUrl: string;           // Link to company's job posting
  description?: string;          // Brief description (optional)
  tags: string[];               // Technology tags (AWS, Kubernetes, etc.)
  category: string;             // Primary category (Cloud, SRE, DevOps)
  postedDate: string;           // ISO date string
  featured?: boolean;           // Featured/sponsored job
  salaryRange?: {               // Optional salary info
    min?: number;
    max?: number;
    currency?: string;
  };
}
```

## Job Sourcing Options

### 1. **RSS Feeds** (Recommended for Automation)
Many job boards provide RSS feeds that can be parsed:

- **RemoteOK**: `https://remoteok.io/remote-dev-jobs.rss`
- **We Work Remotely**: Category-specific RSS feeds
- **Stack Overflow Jobs**: RSS feeds available
- **AngelList**: Startup job RSS feeds

**Pros**: Automated updates, fresh content
**Cons**: Need filtering logic to identify cloud/SRE jobs

### 2. **Job Board APIs** (If Available)
Some job boards offer APIs:

- **Adzuna API**: Aggregated job listings (may require API key)
- **Reed API**: UK-focused but has some remote jobs
- **GitHub Jobs API**: Deprecated, but similar APIs exist

**Pros**: Structured data, easier to filter
**Cons**: May require API keys, rate limits, costs

### 3. **Manual Curation** (Best for Quality)
Manually add jobs from:

- Company career pages (AWS, Google Cloud, Microsoft Azure, etc.)
- Cloud-focused job boards
- LinkedIn job postings (manual copy)
- Direct company partnerships

**Pros**: High quality, accurate, curated
**Cons**: Time-intensive, requires ongoing effort

### 4. **Company Partnerships** (Best for Monetization)
Partner directly with companies:

- Companies submit jobs via form
- Featured/sponsored listings
- Company logo and branding
- Priority placement

**Pros**: Revenue opportunity, high-quality listings
**Cons**: Requires sales/outreach effort

### 5. **JobFunnel** (Recommended for Automation)
Use [JobFunnel](https://github.com/PaulMcInnis/JobFunnel) - Python tool that scrapes multiple job boards:

- Scrapes Indeed, Monster, Glassdoor, and more
- Outputs to CSV format
- Supports multiple locales (USA, Canada, UK, etc.)
- Built-in duplicate detection
- Respectful scraping with delays

**Pros**: Automated, aggregates multiple sources, handles duplicates
**Cons**: Requires Python environment, CSV to JSON conversion needed

**Implementation**:
- Run JobFunnel with cloud/SRE keywords
- Convert CSV output to JSON format
- Filter for cloud-relevant jobs
- Merge with existing jobs.json
- Run via GitHub Actions or local script

### 6. **Web Scraping** (Use with Caution)
Scrape job boards directly (ensure ToS compliance):

- Use tools like Puppeteer/Playwright
- Parse HTML to extract job data
- Filter for cloud/SRE keywords

**Pros**: Automated, comprehensive
**Cons**: Legal/ethical concerns, fragile (breaks when sites change)

## Recommended Approach for MVP

### Phase 1: Manual Curation
- Start with manually curated high-quality jobs
- Focus on well-known cloud companies
- Build initial content base

### Phase 2: JobFunnel Integration (Primary Automation)
- Set up JobFunnel Python environment
- Configure JobFunnel with cloud/SRE search keywords
- Create script to:
  - Run JobFunnel and output CSV
  - Convert CSV to JSON format
  - Filter jobs for cloud relevance
  - Merge with existing jobs.json
  - Deduplicate based on URL/title
- Run via GitHub Actions daily/weekly

### Phase 3: RSS Feed Integration (Secondary)
- Parse RSS feeds from RemoteOK, We Work Remotely
- Filter for cloud/SRE keywords:
  - AWS, Azure, GCP, Kubernetes, Docker, Terraform
  - SRE, DevOps, Cloud Engineer, Infrastructure
- Run update script weekly/daily

### Phase 4: Company Partnerships
- Create job submission form
- Reach out to companies for partnerships
- Offer featured listings

## Implementation Plan

### Job Data Storage
```
src/
  data/
    jobs.json          # All job listings
    companies.json     # Company information
    categories.json    # Job categories
```

### Update Process
1. **Manual Updates**: Edit `jobs.json` directly
2. **Script-Based**: Run `npm run update-jobs` to fetch from RSS/APIs
3. **GitHub Actions**: Automated daily/weekly updates
4. **Company Submission**: Form that creates PR or adds to JSON

### Filtering Logic for Cloud/SRE Jobs
Keywords to identify relevant jobs:
- **Cloud Providers**: AWS, Azure, GCP, Cloudflare, DigitalOcean
- **Technologies**: Kubernetes, Docker, Terraform, Ansible, Prometheus
- **Roles**: SRE, DevOps, Cloud Engineer, Infrastructure Engineer
- **Skills**: CI/CD, Infrastructure as Code, Microservices

## Example Job Sources

### High-Quality Sources
1. **Company Career Pages**:
   - AWS Careers
   - Google Cloud Careers
   - Microsoft Azure Careers
   - HashiCorp Careers
   - Datadog Careers

2. **Cloud-Focused Job Boards**:
   - Cloud Jobs (if exists)
   - DevOps Jobs
   - SRE-focused communities

3. **Remote Job Boards** (filter for cloud):
   - RemoteOK
   - We Work Remotely
   - Remote.co

## Future Considerations

### When to Add Database
Consider moving to a database when:
- Job volume exceeds 1000+ listings
- Need real-time updates
- Want user accounts and saved jobs
- Need advanced analytics
- Company partnerships require admin dashboard

### Migration Path
- Keep JSON as source of truth initially
- Add database for user data only
- Gradually migrate job data if needed
- Use database for dynamic features (saved jobs, alerts)

