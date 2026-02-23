# The Well Church Website — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete church website for The Well Church Reading hosted on GitHub Pages with Facebook auto-sync, video archive with Whisper transcription search, and prayer request forms.

**Architecture:** Jekyll static site on GitHub Pages. Facebook Graph API feeds content via scheduled GitHub Actions. Whisper transcribes video archive into timestamped JSON. Lunr.js provides client-side full-text search across transcripts, posts, and pages. Formspree handles prayer request form submissions.

**Tech Stack:** Jekyll (Ruby SSG), GitHub Pages, GitHub Actions, Facebook Graph API, OpenAI Whisper, Lunr.js, Formspree, SCSS, vanilla JS

---

## Phase 1: Foundation

### Task 1: Jekyll Project Scaffold

**Files:**
- Create: `Gemfile`
- Create: `_config.yml`
- Create: `.gitignore`
- Create: `CNAME`

**Step 1: Create Gemfile**

```ruby
source "https://rubygems.org"

gem "jekyll", "~> 4.3"
gem "jekyll-feed"
gem "jekyll-seo-tag"
gem "jekyll-sitemap"

group :jekyll_plugins do
  gem "jekyll-feed"
  gem "jekyll-seo-tag"
  gem "jekyll-sitemap"
end
```

**Step 2: Create _config.yml**

```yaml
title: The Well Church
description: A community church in Reading
url: "https://thewell-church.com"
baseurl: ""

church:
  name: "The Well Church"
  address: "Dawlish Road, Reading, RG2 7SD"
  phone: "0118 9755822"
  email: "life@thewell-church.com"
  facebook: "https://www.facebook.com/thewellreading"
  map_lat: 51.4340
  map_lng: -0.9690

markdown: kramdown
permalink: pretty
sass:
  style: compressed

collections:
  sermons:
    output: true
    permalink: /sermons/:slug/
  events:
    output: true
    permalink: /events/:slug/

defaults:
  - scope:
      path: ""
      type: "pages"
    values:
      layout: "page"
  - scope:
      path: ""
      type: "sermons"
    values:
      layout: "video"
  - scope:
      path: ""
      type: "events"
    values:
      layout: "page"

plugins:
  - jekyll-feed
  - jekyll-seo-tag
  - jekyll-sitemap

exclude:
  - Gemfile
  - Gemfile.lock
  - scripts/
  - docs/
  - README.md
  - node_modules/
```

**Step 3: Create .gitignore**

```
_site/
.jekyll-cache/
.jekyll-metadata
.sass-cache/
vendor/
node_modules/
.bundle/
*.gem
```

**Step 4: Create CNAME**

```
thewell-church.com
```

**Step 5: Install and verify Jekyll builds**

Run: `cd /home/petros/thewell-church && bundle install && bundle exec jekyll build`
Expected: Build succeeds (may warn about missing layouts)

**Step 6: Commit**

```bash
git add Gemfile _config.yml .gitignore CNAME
git commit -m "feat: scaffold Jekyll project with config and dependencies"
```

---

### Task 2: SCSS Design System + Base Styles

**Files:**
- Create: `_sass/_variables.scss`
- Create: `_sass/_base.scss`
- Create: `_sass/_responsive.scss`
- Create: `assets/css/main.scss`

**Step 1: Create variables — brand colours extracted from FB page, fonts, spacing scale**

See design doc for full variable definitions. Key brand colours: deep teal (#1a5c5e), warm gold (#d4a843). Fonts: Inter headings, Source Sans 3 body.

**Step 2: Create base styles — reset, typography, body, buttons, containers**

44x44px minimum touch targets. 4.5:1 contrast ratios. Focus-visible rings. prefers-reduced-motion support.

**Step 3: Create responsive breakpoints — 576px, 768px, 1024px, 1440px**

**Step 4: Create main.scss entry point importing all partials**

**Step 5: Build and verify CSS compiles**

Run: `bundle exec jekyll build && ls _site/assets/css/main.css`

**Step 6: Commit**

```bash
git add _sass/ assets/css/
git commit -m "feat: add SCSS design system with brand colours, typography, and responsive breakpoints"
```

---

### Task 3: Default Layout + Header + Footer

**Files:**
- Create: `_includes/header.html` — nav with logo, links, search bar, "Request Prayer" CTA
- Create: `_includes/footer.html` — 4-column grid: about, quick links, connect, social
- Create: `_layouts/default.html` — base HTML with fonts, CSS, SEO tags, skip link
- Create: `_sass/_header.scss` — fixed nav, mobile hamburger, desktop inline
- Create: `_sass/_footer.scss` — dark teal background, white text
- Create: `assets/js/mobile-menu.js` — toggle hamburger, escape to close

Navigation links: About, Services, Sermons, Events, The Well Centre, Our Family, Contact. "Request Prayer" as accent CTA button. Search input in nav.

**Commit:** `"feat: add default layout with header, footer, navigation, and mobile menu"`

---

### Task 4: Homepage

**Files:**
- Create: `_layouts/home.html`
- Create: `_includes/hero.html` — full-width bg, overlay, title, 2 CTAs, service times
- Create: `_includes/cta-banner.html` — "Need Prayer?" gold banner
- Create: `_sass/_hero.scss`
- Create: `_sass/_cards.scss` — reusable card grid (1col mobile, 2col tablet, 3col desktop)
- Create: `_data/service_times.json`
- Create: `pages/index.html`

Sections: Hero > Latest from Facebook (cards) > Live Clips (video cards) > Prayer CTA > Service Times + Map

**Commit:** `"feat: add homepage with hero, service times, prayer CTA, and card grid"`

---

### Task 5: Page Layout + Static Content Pages

**Files:**
- Create: `_layouts/page.html` — header banner + content body (720px max)
- Create: `pages/about.md`
- Create: `pages/services.md` — times, what to expect, plan your visit
- Create: `pages/well-centre.md` — social action arm, open to all
- Create: `pages/kids-youth.md`
- Create: `pages/small-groups.md`
- Create: `pages/give.md`
- Create: `pages/contact.html` — form (Formspree) + map + info
- Create: `_sass/_pages.scss`

**Commit:** `"feat: add page layout and all static content pages"`

---

### Task 6: Prayer Request Form

**Files:**
- Create: `pages/prayer.html` — warm intro + form (name, phone optional, request) + thank you
- Create: `_sass/_forms.scss` — form styling, privacy notice, submit states

Form posts to Formspree. Honeypot spam protection. Subject line for pastor email. Thank you message hidden until submit.

**Commit:** `"feat: add prayer request form page with Formspree integration"`

---

### Task 7: Partner Churches Page

**Files:**
- Create: `_data/partners.json` — D2W, Kharris Church, Well Ethiopian Church
- Create: `pages/our-family.html` — card grid with logos + descriptions + links
- Create: `_sass/_partners.scss`

**Commit:** `"feat: add partner churches page with D2W, Kharris, and Well Ethiopian"`

---

### Task 8: Placeholder Logo + Deploy to GitHub Pages

**Files:**
- Create: `assets/images/logo.svg` — simple "TW" placeholder
- Create: `.github/workflows/deploy.yml` — Ruby setup, Jekyll build, deploy-pages

Steps:
1. Create GitHub repo: `gh repo create thewell-church --public --source=. --push`
2. Enable Pages with workflow deployment
3. Verify build succeeds

**Commit:** `"feat: add placeholder logo, deploy workflow, and push to GitHub Pages"`

---

## Phase 2: Facebook Auto-Sync

### Task 9: Facebook Graph API Fetcher Script

**Files:**
- Create: `scripts/fetch-facebook.py` — fetches posts, videos, events from Graph API
- Create: `_includes/facebook-post-card.html` — card with image, date, excerpt, FB link
- Create: `_includes/video-card.html` — thumbnail, title, date card

**Commit:** `"feat: add Facebook Graph API fetcher and post/video card templates"`

---

### Task 10: GitHub Actions Facebook Sync Workflow

**Files:**
- Create: `.github/workflows/facebook-sync.yml` — hourly cron, fetch, commit if changed

Requires repo secrets: `FB_PAGE_ID`, `FB_ACCESS_TOKEN`

**Commit:** `"feat: add GitHub Actions workflow for hourly Facebook content sync"`

---

## Phase 3: Video Archive + Transcription

### Task 11: Sermons/Video Archive Page

**Files:**
- Create: `pages/sermons.html` — search bar + video card grid
- Create: `_layouts/video.html` — player + transcript panel with timestamps
- Create: `_sass/_video.scss`

**Commit:** `"feat: add sermons archive page and video player layout with transcript panel"`

---

### Task 12: Whisper Transcription Batch Script

**Files:**
- Create: `scripts/transcribe-batch.sh` — download videos, run Whisper, output timestamped JSON
- Create: `_data/transcripts/index.json` — placeholder

**Commit:** `"feat: add Whisper transcription batch script for video archive"`

---

## Phase 4: Search

### Task 13: Lunr.js Client-Side Search

**Files:**
- Create: `assets/js/lunr.min.js` — downloaded from CDN
- Create: `assets/js/search.js` — load index, query, render results with safe DOM methods
- Create: `pages/search.html` — search input + results container
- Create: `_sass/_search.scss`
- Create: `scripts/build-search-index.py` — generates search-index.json from transcripts + posts

Note: search.js MUST use safe DOM methods (createElement, textContent) instead of innerHTML to prevent XSS.

**Commit:** `"feat: add Lunr.js client-side search with transcript indexing"`

---

## Phase 5: Events + Domain + Polish

### Task 14: Events Diary Page

**Files:**
- Create: `pages/events.html` — date badges + event list from Facebook data
- Create: `_sass/_calendar.scss`

**Commit:** `"feat: add events diary page with date badges and Facebook event integration"`

---

### Task 15: Point thewell-church.com to GitHub Pages

Using Hostinger API to update DNS:
- A records: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
- CNAME: www -> thewellreading.github.io
- Enable HTTPS enforcement in GitHub Pages settings
- Verify with `dig` and `curl`

---

### Task 16: Video Player Timestamp JS

**Files:**
- Create: `assets/js/video-player.js` — click timestamp to seek, highlight active segment

**Commit:** `"feat: add video player timestamp sync with transcript highlighting"`

---

## Task Dependency Graph

```
1 (scaffold) → 2 (SCSS) → 3 (layout) → 4 (homepage)
                                       → 5 (pages) → 6 (prayer form)
                                                    → 7 (partners)
4 + 5 + 6 + 7 → 8 (deploy)
8 → 9 (FB fetcher) → 10 (FB workflow)
3 → 11 (sermons page) → 16 (video player JS)
12 (whisper scripts) standalone
11 + 12 → 13 (search)
3 → 14 (events)
8 → 15 (domain)
```

## Execution Note

Phase 1 (Tasks 1-8) can be built immediately with no external dependencies.
Phase 2 (Tasks 9-10) requires creating a Facebook App and getting a Page Access Token.
Phase 3 (Tasks 11-12, 16) requires Hostinger video access.
Phase 4 (Task 13) requires transcript data from Phase 3.
Phase 5 (Tasks 14-15) can be done in parallel with Phase 2-4.
