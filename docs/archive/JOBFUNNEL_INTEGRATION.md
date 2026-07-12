# JobFunnel Integration Guide

## Overview

[JobFunnel](https://github.com/PaulMcInnis/JobFunnel) is a Python tool that scrapes job postings from multiple job boards (Indeed, Monster, Glassdoor, etc.) and outputs them to a CSV file. We'll integrate it into our job sourcing pipeline to automatically collect cloud and SRE jobs.

## How JobFunnel Works

- **Input**: YAML configuration file with search keywords and filters
- **Process**: Scrapes multiple job boards (Indeed, Monster, Glassdoor, etc.)
- **Output**: CSV file (`master_list.csv`) with job data
- **Features**: 
  - Duplicate detection
  - Respectful scraping delays
  - Multiple locale support (USA, Canada, UK, etc.)
  - Remote work filtering

## Integration Strategy

### Step 1: Install JobFunnel

```bash
pip install git+https://github.com/PaulMcInnis/JobFunnel.git
```

### Step 2: Create Configuration File

Create `scripts/jobfunnel-config.yaml`:

```yaml
search_terms:
  - "Cloud Engineer"
  - "SRE"
  - "Site Reliability Engineer"
  - "DevOps Engineer"
  - "AWS"
  - "Kubernetes"
  - "Terraform"
  - "Infrastructure Engineer"

providers:
  - indeed
  - monster
  - glassdoor

locale: "USAENGLISH"

remoteness: "FULLY_REMOTE"  # or "PARTIALLY_REMOTE", "ONSITE"

max_listing_days: 30  # Only get jobs posted in last 30 days

delay_config:
  min_delay: 1
  max_delay: 3
```

### Step 3: Create Conversion Script

Create `scripts/jobfunnel-to-json.js` (Node.js script):

```javascript
// Reads JobFunnel CSV output and converts to our JSON format
// Filters for cloud-relevant jobs
// Merges with existing jobs.json
```

### Step 4: Filtering Logic

Filter jobs based on keywords in:
- **Title**: Must contain cloud/SRE keywords
- **Description**: Check for cloud technologies
- **Tags**: Extract technology tags

**Cloud Keywords**:
- Cloud Providers: AWS, Azure, GCP, Cloudflare, DigitalOcean
- Technologies: Kubernetes, Docker, Terraform, Ansible, Prometheus, Grafana
- Roles: SRE, DevOps, Cloud Engineer, Infrastructure Engineer
- Skills: CI/CD, Infrastructure as Code, Microservices, Serverless

### Step 5: Data Transformation

Convert JobFunnel CSV format to our JSON structure:

**JobFunnel CSV Columns**:
- `title`, `company`, `location`, `date`, `link`, `description`, `tags`

**Our JSON Format**:
```json
{
  "id": "generated-slug",
  "title": "...",
  "company": "...",
  "companySlug": "...",
  "location": "...",
  "externalUrl": "...",
  "description": "...",
  "tags": ["AWS", "Kubernetes"],
  "category": "Cloud",
  "postedDate": "2024-01-15T00:00:00Z"
}
```

### Step 6: Deduplication

Prevent duplicate jobs by:
- Matching on `externalUrl` (exact match)
- Matching on `title + company` (fuzzy match)
- Checking against existing `jobs.json`

### Step 7: Automation

**Option A: GitHub Actions** (Recommended)
- Run daily/weekly
- Commit updated `jobs.json` automatically
- Review PR before merging

**Option B: Local Script**
- Run manually: `npm run update-jobs`
- Review changes before committing

## Implementation Plan

### Phase 1: Setup
1. Install JobFunnel
2. Create configuration file
3. Test manual run

### Phase 2: Conversion Script
1. Create CSV to JSON converter
2. Implement filtering logic
3. Add deduplication

### Phase 3: Automation
1. Set up GitHub Actions workflow
2. Configure scheduled runs
3. Add error handling and notifications

## Example Workflow

```bash
# 1. Run JobFunnel
funnel load -s scripts/jobfunnel-config.yaml

# 2. Convert CSV to JSON and filter
node scripts/jobfunnel-to-json.js

# 3. Review changes
git diff src/data/jobs.json

# 4. Commit if good
git add src/data/jobs.json
git commit -m "Update jobs from JobFunnel"
```

## GitHub Actions Workflow

```yaml
name: Update Jobs from JobFunnel

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:  # Manual trigger

jobs:
  update-jobs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: pip install git+https://github.com/PaulMcInnis/JobFunnel.git
      - run: funnel load -s scripts/jobfunnel-config.yaml
      - run: node scripts/jobfunnel-to-json.js
      - run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add src/data/jobs.json
          git diff --staged --quiet || git commit -m "Auto-update jobs from JobFunnel"
          git push
```

## Filtering Keywords

### Must-Have Keywords (at least one)
- Cloud providers: AWS, Azure, GCP, Google Cloud, Microsoft Azure, Amazon Web Services
- Cloud roles: Cloud Engineer, Cloud Architect, Cloud Developer, SRE, Site Reliability Engineer
- Technologies: Kubernetes, Docker, Terraform, Ansible, CloudFormation

### Nice-to-Have Keywords
- CI/CD, Jenkins, GitLab CI, GitHub Actions
- Prometheus, Grafana, Datadog, New Relic
- Microservices, Serverless, Lambda
- Infrastructure as Code, IaC

### Exclusion Keywords
- Frontend Developer (unless cloud-focused)
- Backend Developer (unless cloud-focused)
- Mobile Developer
- Data Scientist (unless cloud infrastructure)

## Best Practices

1. **Respect Rate Limits**: JobFunnel has built-in delays, but monitor for CAPTCHAs
2. **Review Before Committing**: Always review auto-generated jobs before merging
3. **Manual Override**: Keep ability to manually edit `jobs.json`
4. **Error Handling**: Handle cases where JobFunnel fails or returns no results
5. **Logging**: Log all updates for debugging and auditing

## Troubleshooting

### CAPTCHA Issues
If JobFunnel encounters CAPTCHA:
- Open the URL in browser and solve manually
- JobFunnel will continue after CAPTCHA is solved

### No Results
- Check if search terms are too specific
- Verify locale settings
- Check if job boards are accessible

### Duplicate Jobs
- Review deduplication logic
- Check if URLs are normalized correctly
- Consider fuzzy matching for titles

## References

- [JobFunnel GitHub](https://github.com/PaulMcInnis/JobFunnel)
- [JobFunnel Documentation](https://github.com/PaulMcInnis/JobFunnel#readme)


