# CLAUDE.md - Ghost to Hugo Migration for jolyonbrown.com

## Project Overview

Migrate jolyonbrown.com from Ghost Pro to a Hugo static site hosted on GitHub Pages. The site is a personal blog called ".plan" (named after the old Unix finger file).

**Repository:** `jolyonbrown/jolyonbrown.github.io`
**Live URL:** https://jolyonbrown.com
**Tagline:** "AI experiments, hardware projects, and things I found interesting enough to write down"

## Prerequisites

Before running this spec, the user should place the following in the repo root:

1. `ghost-export.json` - Export from Ghost Admin → Settings → Labs → Export
2. `/images/` folder containing:
   - `hackers-keyboard.png` (Gibson keyboard from Hackers 1994)
   - `tron-keyboard.png` (Dillinger's terminal from Tron 1982)
   - `alien-keyboard.png` (Nostromo keyboard from Alien)
   - `the-thing-keyboard.png` (Chess wizard keyboard from The Thing 1982)

If images aren't provided, leave placeholder references and note which images are needed.

## Content to Migrate

### Posts (3 total)

1. **"1 engineer, 1 month, 1 million lines of code"**
   - Date: 2025-12-23
   - Slug: `1-engineer-1-month-1-million-lines-of-code`
   - Cover: hackers-keyboard.png
   - Topic: Response to Galen Hunt's LinkedIn post about AI-assisted development

2. **"Hardware hankerings"**
   - Date: 2025-11-30
   - Slug: `hardware-hankerings`
   - Cover: tron-keyboard.png
   - Topic: Wanting to build custom peripherals, starting with a trackball

3. **"LLMs and me"**
   - Date: 2025-09-25
   - Slug: `llms-and-me`
   - Cover: alien-keyboard.png
   - Topic: How LLMs help manage multiple interests/projects

### Pages

1. **About**
   - Slug: `about`
   - Cover: the-thing-keyboard.png
   - Content: Explains ".plan" name origin, describes site as "workshop in public"

## Implementation Steps

### 1. Initialize Hugo Site

```bash
# Clear existing content (preserve .git)
find . -maxdepth 1 ! -name '.git' ! -name 'ghost-export.json' ! -name 'images' ! -name '.' -exec rm -rf {} +

# Initialize Hugo
hugo new site . --force
```

### 2. Install Theme

Use **PaperMod** - it's minimal, fast, and well-maintained:

```bash
git submodule add https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
```

### 3. Create hugo.toml

```toml
baseURL = "https://jolyonbrown.com/"
languageCode = "en-gb"
title = ".plan"
theme = "PaperMod"

[params]
  description = "AI experiments, hardware projects, and things I found interesting enough to write down"
  author = "Jolyon Brown"
  defaultTheme = "auto"
  ShowReadingTime = true
  ShowPostNavLinks = true
  ShowBreadCrumbs = false
  ShowCodeCopyButtons = true
  homeInfoParams.Title = ".plan"
  homeInfoParams.Content = "AI experiments, hardware projects, and things I found interesting enough to write down"

[params.cover]
  hidden = false
  hiddenInList = false

[[params.socialIcons]]
  name = "github"
  url = "https://github.com/jolyonbrown"

[menu]
  [[menu.main]]
    identifier = "about"
    name = "About"
    url = "/about/"
    weight = 10

[outputs]
  home = ["HTML", "RSS", "JSON"]

[markup.goldmark.renderer]
  unsafe = true
```

### 4. Create Directory Structure

```
.
├── .github/
│   └── workflows/
│       └── hugo.yml
├── content/
│   ├── posts/
│   │   ├── 1-engineer-1-month-1-million-lines-of-code.md
│   │   ├── hardware-hankerings.md
│   │   └── llms-and-me.md
│   └── about.md
├── static/
│   └── images/
│       └── (cover images)
├── themes/
│   └── PaperMod/
├── hugo.toml
└── CNAME
```

### 5. Convert Ghost Content to Markdown

Parse `ghost-export.json` and create markdown files with this front matter format:

```yaml
---
title: "Post Title"
date: 2025-12-23
slug: "post-slug"
cover:
  image: "/images/cover-image.png"
  alt: "Alt text description"
  caption: ""
draft: false
---

Post content here...
```

For the About page, use `layout: "about"` in front matter.

### 6. Create GitHub Actions Workflow

Create `.github/workflows/hugo.yml`:

```yaml
name: Deploy Hugo site to Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

defaults:
  run:
    shell: bash

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      HUGO_VERSION: 0.140.0
    steps:
      - name: Install Hugo CLI
        run: |
          wget -O ${{ runner.temp }}/hugo.deb https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.deb \
          && sudo dpkg -i ${{ runner.temp }}/hugo.deb
      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: recursive
      - name: Setup Pages
        id: pages
        uses: actions/configure-pages@v5
      - name: Build with Hugo
        env:
          HUGO_CACHEDIR: ${{ runner.temp }}/hugo_cache
          HUGO_ENVIRONMENT: production
        run: |
          hugo \
            --minify \
            --baseURL "${{ steps.pages.outputs.base_url }}/"
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 7. Create CNAME File

Create `static/CNAME` containing:
```
jolyonbrown.com
```

### 8. DNS Configuration (Manual Step)

User needs to update DNS records:

**Option A - Apex domain:**
```
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153
CNAME www   jolyonbrown.github.io
```

**Option B - If using www subdomain:**
```
CNAME www   jolyonbrown.github.io
```

Also enable "Enforce HTTPS" in GitHub repo Settings → Pages.

## Style Notes

- Keep it minimal and readable
- Dark/light mode auto-switching is good
- The retro keyboard images are a distinctive visual thread - preserve them
- No need for fancy animations or effects
- Typography should prioritise readability

## Post-Migration Checklist

- [ ] All 3 posts render correctly with cover images
- [ ] About page accessible at /about/
- [ ] RSS feed works at /index.xml
- [ ] Custom domain resolves with HTTPS
- [ ] Old Ghost URLs redirect or match (slugs preserved)
- [ ] Site looks good on mobile

## If Ghost Export Unavailable

If `ghost-export.json` isn't provided, create placeholder posts with:
- Correct titles, dates, and slugs
- Cover image references
- TODO comments noting content needs to be copied manually from live site
