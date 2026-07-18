# User Stories

Stories marked **[MVP]** are in the first shippable version. Everything else
lives in the "Later" section of [ROADMAP.md](./ROADMAP.md).

## Job seekers

- **[MVP]** As a job seeker, I want to browse a list of cloud/SRE/DevOps
  jobs (title, company, location, tags, posting date) so that I can see
  what's out there without wading through irrelevant roles.
- **[MVP]** As a job seeker, I want to search by keyword (e.g. "Kubernetes",
  "SRE") so that I can find jobs matching my skills fast.
- **[MVP]** As a job seeker, I want to filter by remote/location so that I
  only see jobs I could actually take.
- **[MVP]** As a job seeker, I want to filter by technology/category tags
  (AWS, Terraform, SRE vs DevOps...) so that I can narrow to my specialty.
- **[MVP]** As a job seeker, I want every job to link directly to the
  company's original posting so that I apply at the source, not through a
  middleman.
- **[MVP]** As a job seeker, I want to see when each job was posted so that
  I don't waste time on stale listings.
- **[MVP]** As a job seeker, I want the site to work well on my phone and my
  laptop so that I can browse anywhere.
- As a job seeker, I want email alerts when new jobs match my search so
  that I don't have to check the site daily. *(First post-MVP feature —
  this is the retention engine for boards like Space Crew.)*
- As a job seeker, I want an account where I can save jobs so that I can
  track the ones I care about.

## Companies

- **[MVP]** As a company, I want a "Post a job" link that opens an email so
  that I can submit a listing with zero friction. (A maintainer adds it by
  hand.)
- As a company, I want a real submission form with review/approval so that
  posting scales beyond email.
- As a company, I want to pay for a featured listing so that my role gets
  more visibility.

## Maintainers

- **[MVP]** As a maintainer, I want jobs stored in a simple JSON file so
  that adding or removing a listing is a quick edit, not a database task.
- **[MVP]** As a maintainer, I want a script that pulls jobs from
  legitimate feeds (RemoteOK API, We Work Remotely RSS, Remotive RSS) and
  filters them for cloud/SRE relevance so that the board stays fresh
  without manual work.
- As a maintainer, I want the feed script to run on a schedule (GitHub
  Actions) so that the board updates itself.
- As a maintainer, I want basic anonymous analytics so that I know
  whether real visitors are showing up.
