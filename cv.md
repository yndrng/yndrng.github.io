---
title: Aliaksandr (Alex/Sasha) Babaren
---

*Software Engineer / Backend Developer* living in *Warsaw, Poland*.

<div id="webaddress">
  <a href="mailto:sasha@klik.music">Email</a> |
  <a href="https://www.linkedin.com/in/yndrng" target="_blank">LinkedIn</a> |
  <a href="https://github.com/yndrng" target="_blank">GitHub</a>
</div>

Dedicated Software Engineer with extensive experience in designing, developing, and optimizing high-performance backend systems across agriculture, media, healthcare, finance, recruitment, cybersecurity, and real estate. Skilled in Python ecosystems (Django/DRF, FastAPI), cloud infrastructure (AWS, DigitalOcean), asynchronous processing, distributed systems, and data pipelines. Proven ability to lead technical projects, improve system reliability, automate workflows, and streamline infrastructure using IaC practices.

# R&D Skills

### Languages

**Python** – Django/DRF, FastAPI, Flask, Serverless Framework, etc. - **5 years of experience.**\
**TypeScript/JavaScript** – React, jQuery - **1 year of experience.**

---

### Data Access

**SQLite**, **PostgreSQL**, **MySQL/MariaDB**, **MongoDB**, **DynamoDB**, **Redis**, **OpenSearch/Elasticsearch**.

---

### Brokerages / Messaging

**RabbitMQ**, **AWS SQS**, **Redis**.

---

### Cloud

**AWS** – EC2, ECS Fargate, S3, Lambda, CloudFront, RDS, DynamoDB, SES, SQS, CloudWatch, etc. \
**DigitalOcean** – Droplets.

---

### Infrastructure

**Docker** – production and development containerization.  
**Terraform** – IaC for AWS and DigitalOcean environments.  
**GitHub Actions** – CI/CD pipelines for automated testing, builds, and deployments.

---

### Communication

**English** – B2+.  
**Russian** – Native.  
**Belarusian** – Native.  
**Polish** – B1.

---

### Interests
Music overall: <a href="https://roundnsquare.club/sanyafyl/" target="_blank">vinyl collecting</a>, <a href="https://yndrng.github.io/gigs.html" target="_blank">gigs</a>, instruments (guitar, vocals, bass, someday - piano and drums), history. 

# Employment

## Godel Technologies Europe — Senior Software Engineer  
*Warsaw, Poland*  
**Jan 2026 – ongoing**  

### Project in Energy domain
*Worldwide*

- Migrated customer communications off a legacy messaging path onto a transactional platform across several energy markets: onboarding, payments, meter readings, move-out, cooling-off, and supply events.
- Designed message triggers with context builders, recipient selection, and document attachments so each message resolves the right account, property, product, and PDF.
- Dual-published during rollout, then removed the legacy message types, workflow steps, and templates once the new path was live.
- Fixed production defects in live customer communications: duplicate sends, incorrect dates, and messages that should have been suppressed.
- Added operator preview (dependent fields, past properties, render before send) and shared message context across brands so the same communication does not fork per market.
- Prepared handover documentation for client teams, documenting potential issues and recommended resolutions.
- Used Claude Code extensively in daily delivery: custom skills, hooks, and plugins, plus other AI-assisted development best practices.
- Streamlined handing tasks over to internal review with Slack Workflows, making the handoff quicker and more consistent for the team.

**Stack:**
Python, Django (w. templates), pytest, Claude Code, Slack Workflows

## Fermata — Software Engineer  
*AI in Agriculture*  
**Dec 2024 – Dec 2025**

- Built a Slack app that automated a key business-critical reporting flow, integrating with the internal report service and enabling teams to generate reports on demand or on schedule.
- Engineered a secure image delivery pipeline using CDN, improving latency and user experience compared to direct S3 access.  
- Overhauled a complex legacy client integration: emulated camera input, implemented custom serialization, ensured reliable communication.  
- Implemented centralized secrets management with AWS SSM Parameter Store, introducing versioned, secure credential handling.  
- Built a service for automated arrangement of zone objects (camera & positions) with flexible configuration options.  
- Contributed to image tiling features, reducing loading time by splitting images into smaller tiles.  
- Refactored filtering system powering core functionality for accurate and efficient querying.

**Stack:**  
Python, asyncio, MongoDB, RabbitMQ, FastAPI, Slack API, AWS (S3, CloudFront, Parameter Store, Lambda, EventBridge), pytest, Sentry, Nomad, Portainer.

---

## <a href="https://klik.music" target="_blank">KLIK</a> — Swiss Army Man / Pet Project 
*Online music media*  
**Feb 2024 – ongoing**

- Launched and run the public site end-to-end — a Django REST API plus headless Wagtail CMS serving artists, releases, concerts, and editorial content.  
- Designed a three-layer domain model (canonical catalog / per-platform integration / CMS pages) that keeps streaming data, editorial truth, and content decoupled.  
- Built a pluggable platform-adapter layer with declarative capability flags — Spotify as source of truth, Yandex Music link-only; adding a platform needs no dispatch or persistence changes.  
- Replaced brittle HTML scraping with resilient async API clients: httpx, TOTP-based Spotify auth (incl. a token-refresh race fix), retries, a shared proxy pool, and anti-abuse handling.  
- Built an event-driven serverless pipeline on AWS: EventBridge schedules → Lambda fan-out → SQS, with container-image Lambdas sharing the Django codebase, partial-batch failure reporting, and DLQ redrive.  
- Implemented rate-limited cross-platform link syndication (Odesli) as a scheduled drainer with a daily budget counter and a 30-day refresh window, staying inside a ~2 req/min limit.  
- Migrated data storage from Google Sheets to a Django REST API on PostgreSQL, and infrastructure from DigitalOcean to AWS: backend on ECS Fargate, frontend on CloudFront.  
- Cut API latency and cost: eliminated N+1 queries, added hot-path indexes and pruned redundant ones, moved artist leaderboards onto a concurrently-refreshed materialized view behind a debounced refresh lock.  
- Made read paths CDN-cacheable — ETag/304 handling, Cache-Control, GZip, long-lived S3 caching, and responsive WebP srcset ladders that cut image payloads.  
- Added geo-aware features with GeoDjango/PostGIS: concerts filtered by viewer country and region-specific catalog rules.  
- Built the editorial CMS on headless Wagtail: custom StreamField blocks, OEmbed embeds, a custom image model with automatic WebP conversion, and multilingual content.  
- Extended the Django admin into an operations console — application intake and approval flows, duplicate merging, forced re-syncs, and one-click platform actions.  
- Hardened operations: Sentry, a pytest suite in CI, ruff and pre-commit, multi-stage Docker images, Terraform-provisioned AWS, and GitHub Actions deploying ECS and every Lambda.

**Stack:**  
Python, Django, DRF, Wagtail (headless CMS), PostgreSQL/PostGIS, GeoDjango, asyncio/httpx, Gunicorn + gevent, Pillow, AWS (ECS Fargate, Lambda, SQS, EventBridge, RDS, S3, CloudFront, ECR), Terraform, Docker, GitHub Actions, pytest, ruff, Sentry, uv, Spotify / Yandex Music / Odesli APIs, Google Sheets, DigitalOcean Droplets.

---

## Remedy Product Studio — Software Engineer | L5
*Warsaw, Poland*  
**Mar 2023 – Nov 2024**

### Wave Neuroscience, Inc. — Healthcare domain  
*US wide*

- Supported and optimized legacy systems while contributing to gradual modernization.  
- Led migration of critical datasets from Cybermed DB to Amazon RDS and Redis, improving performance and reducing cost.  
- Expanded SDK features enabling seamless integration with Cybermed DB.  
- Built a Redis-based solution for high-speed data access and caching.  
- Designed and maintained email workflows using AWS SES.  
- Contributed to frontend development using React for cohesive integration with backend services.

**Stack:**  
Python, FastAPI/Flask, AWS (DynamoDB, SES, RDS, S3), Redis, Cybermed DB, JavaScript + React, Sentry.

### Halter Ranch — POS system  
*CA, US*

- Developed a full POS system tailored for restaurant operations.  
- Designed and optimized the database for efficient data management.  
- Refactored order management logic to improve maintainability and performance.  
- Built an automated system for precise order calculations.  
- Prepared the application for its first production release.  
- Created unit & integration tests using pytest.  
- Wrote internal documentation for future maintenance.  
- Integrated ShipCompliant for regulatory shipment compliance.  
- Added subscription functionality for wine club customers.  
- Implemented Stripe-based payment processing.  
- Designed async SQLAlchemy workflows for high-performance data operations.  
- Integrated with WineDirect for direct-to-consumer operations.

**Stack:**  
Python, FastAPI, Stripe, async SQLAlchemy, PostgreSQL, pytest, AWS (RDS, SQS), ShipCompliant, WineDirect, Auth0, Klaviyo, Sentry.

---

## Innowise Group — Middle Software Engineer / Manager
*Minsk, Belarus / Warsaw, Poland*  
**Jan 2022 – Mar 2023**

- Mentored junior developers.  
- Conducted interviews and candidate evaluations.  
- Assisted engineers with interview preparation.

### Pectus Finance — Finance domain  
*Berlin, Germany*

- Designed the database architecture for a tree-structured data model.  
- Implemented SQL queries and data parsers for CSV, XLSX, and JSON.  
- Built comprehensive error-handling for high system reliability.  
- Developed the serverless components of the application.  
- Authored technical documentation and project guidelines (pre-commit, docstrings, type hints).

**Stack:**  
Python, FastAPI, AWS (Lambda, SAM, API Gateway, SQS, RDS, S3), Serverless Framework, PostgreSQL, SQLAlchemy.

### Drax Executive — Recruitment domain  
*UK*

- Built a generic architecture for extracting data from multiple sources.  
- Designed databases for efficient data retrieval and analysis.  
- Implemented OpenSearch for full-text search.  
- Created scripts for data manipulation in MongoDB and MySQL.  
- Developed serverless application components.  
- Built unit, integration, and E2E tests.

**Stack:**  
Python, FastAPI, AWS (Lambda, SQS, API Gateway, RDS, OpenSearch, S3), MySQL, MongoDB, pytest.

### NDA Project — Cybersecurity domain  

- Implemented RESTful APIs and data-exchange schemas.  
- Designed database schemas for optimized organization.  
- Developed TCP/IP restriction mechanisms for enhanced security.  
- Implemented user-permissions management.  
- Created custom widgets for Django admin.  
- Built tests ensuring stability and reliability.

**Stack:**  
Python, Django, DRF, MariaDB.

---

## iTechArt Group — Junior Software Engineer  
*Minsk, Belarus*  
**Jun 2021 – Dec 2021**

### Project in Real Estate domain

- Implemented backend modules for a Django admin back office.  
- Built custom widgets for landing pages.  
- Set up and configured a notification system.  
- Created email templates compatible with different clients and platforms.  
- Migrated frontend from Django templates + jQuery to React.

**Stack:**  
Python, Django, Celery, PostgreSQL, JavaScript, jQuery, Bootstrap, HTML5, CSS3, Mailchimp, pytest, Django templates, React.js.

# Education

## Belarusian State University of Informatics and Radioelectronics
**2019-2022**

- **Computer Science and Engineering** at **Faculty of informational technologies and control** (GPA: 3.73 / 4.0)

---

_I accept the processing of my personal data also for future recruitment, in accordance with Article 6(1)(a) of the GDPR._