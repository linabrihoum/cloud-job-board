# Architecture Overview

## MVP Approach: Static-First, Database-Free

This job board is designed as a **static-first application** that aggregates cloud, SRE, and DevOps job listings without requiring a database or user authentication for the MVP phase.

## Core Principles

1. **No User Data Storage** (MVP): No authentication, no user accounts, no saved jobs
2. **External Links Only**: All jobs link directly to company websites
3. **Static Data**: Jobs stored in JSON files, generated at build time
4. **Simple & Fast**: No database queries, instant page loads
5. **Scalable Foundation**: Architecture allows easy migration to database later

## Technology Stack

### Frontend
- **Next.js 15** (App Router) - React framework with static generation
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **React 19** - Latest React features

### Data Storage (MVP)
- **JSON Files** - `src/data/jobs.json` for job listings
- **Git Repository** - Version control for job data
- **Static Generation** - Pages generated at build time

### Future Stack (Post-MVP)
- **PostgreSQL** - Relational database
- **Prisma ORM** - Type-safe database access
- **NextAuth.js** - Authentication
- **Stripe** - Payment processing (for featured listings)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── jobs/              # Job listings
│   │   ├── page.tsx       # List view
│   │   └── [slug]/        # Individual job pages
│   ├── companies/         # Company pages
│   └── api/               # API routes (future)
├── components/            # React components
│   ├── JobCard.tsx
│   ├── Header.tsx
│   └── Footer.tsx
├── data/                  # Static data files
│   ├── jobs.json         # Job listings
│   └── companies.json    # Company info
├── lib/                   # Utility functions
│   ├── jobs.ts           # Job data loading/parsing
│   └── utils.ts          # Helper functions
└── types/                 # TypeScript types
    └── job.ts            # Job interface definitions
```

## Data Flow

### Job Listing Flow
1. **Data Source**: Jobs stored in `src/data/jobs.json`
2. **Load**: Utility function reads JSON at build time
3. **Filter/Search**: Client-side filtering and search
4. **Display**: Rendered as static pages
5. **Link**: Users click to external company website

### Update Process
1. **Manual**: Edit JSON files directly
2. **Script**: Run update script to fetch from RSS/APIs
3. **Automated**: GitHub Actions runs daily/weekly
4. **Company Submission**: Form creates PR or adds to JSON

## Key Features

### MVP Features
- ✅ Job listings with filtering
- ✅ Search functionality
- ✅ Category pages (Cloud, SRE, DevOps)
- ✅ Company profile pages
- ✅ External links to job postings
- ✅ Responsive design
- ✅ Dark mode
- ✅ SEO optimization

### Post-MVP Features (Phase 10+)
- 🔄 User authentication
- 🔄 Saved jobs/bookmarks
- 🔄 Email job alerts
- 🔄 Application tracking
- 🔄 Company dashboard
- 🔄 Featured/sponsored listings

## Security Considerations

### Current (Static Site)
- **No User Input**: Minimal attack surface
- **HTTPS**: Enforced via hosting platform
- **Security Headers**: Configured in `next.config.ts`
- **No Database**: No SQL injection risk
- **No Auth**: No session management needed

### Future (With Database)
- **Input Validation**: Zod schemas for all inputs
- **Rate Limiting**: API route protection
- **CSRF Protection**: NextAuth.js handles this
- **SQL Injection**: Prisma ORM prevents this
- **File Uploads**: Validation and virus scanning

## Performance Strategy

### Static Generation
- All pages pre-rendered at build time
- No runtime database queries
- Instant page loads
- CDN-friendly

### Optimization
- Image optimization (Next.js Image)
- Code splitting
- Lazy loading
- Caching headers
- Minimal JavaScript bundle

## Scalability Path

### Current (MVP)
- **Jobs**: 100-1000 listings (JSON file)
- **Traffic**: Handles high traffic (static files)
- **Updates**: Manual or script-based

### Future Growth
- **Jobs**: 10,000+ listings (migrate to database)
- **Users**: Add authentication and user data
- **Real-time**: Add API routes for dynamic features
- **Automation**: Full RSS/API integration

## Deployment

### Hosting
- **Vercel** (recommended) - Optimized for Next.js
- **Netlify** - Alternative option
- **Static Export** - Can export as static site

### CI/CD
- **GitHub Actions** - Automated builds and deployments
- **Job Updates** - Scheduled RSS feed parsing
- **Testing** - Automated test runs

## Migration Strategy

When ready to add database:

1. **Keep JSON as Source**: Continue using JSON for jobs
2. **Add Database for Users**: Only store user data in DB
3. **Gradual Migration**: Move jobs to DB when needed
4. **Hybrid Approach**: JSON for jobs, DB for user features

## Best Practices

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Component-based architecture
- Reusable utility functions

### SEO
- Semantic HTML
- Meta tags and Open Graph
- Structured data (JSON-LD)
- Sitemap generation
- robots.txt

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- ARIA labels

### Performance
- Lighthouse score > 90
- Core Web Vitals optimization
- Image optimization
- Minimal dependencies


