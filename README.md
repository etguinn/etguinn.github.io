# Blog

A static site. Markdown goes in, plain HTML comes out, GitHub serves it.
No database, no server, no admin login, no third-party scripts.

- **Write** a Markdown file.
- **Commit** it with Git.
- **Push.** It's live in about a minute.

---

## One-time setup (~10 minutes)

### 1. Put your name on it

Open `src/_data/site.json` and replace every `CHANGE ME`. This one file
controls the header, footer, page titles, RSS feed, and social previews.

```json
{
  "title": "Elliott Guinn",
  "tagline": "Notes on film, technology, and the values underneath both.",
  "url": "https://YOUR-USERNAME.github.io"
}
```

The `url` must be exact — it's what builds the RSS feed and sitemap links.

### 2. Preview it locally

```bash
npm install          # only needed once
npm run dev          # http://localhost:8080 — saves reload instantly
```

### 3. Tell Git who you are

You don't have this set yet:

```bash
git config --global user.name "Ethan Guinn"
git config --global user.email "et.guinn@gmail.com"
```

### 4. Create the repository

On GitHub, create a **public, empty** repository named exactly:

```
YOUR-USERNAME.github.io
```

That exact name is what makes the site serve from the root of your domain.
Don't let GitHub add a README or .gitignore — this folder already has them.

### 5. Push

```bash
git init -b main
git add .
git commit -m "Initial site"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-USERNAME.github.io.git
git push -u origin main
```

### 6. Turn on Pages — the one step people miss

In the repo: **Settings → Pages → Build and deployment → Source → GitHub
Actions.**

Not "Deploy from a branch." If you pick that, GitHub will try to build the
site with Jekyll and it will fail.

Then go to the **Actions** tab and watch the run go green. Your site is at
`https://YOUR-USERNAME.github.io`.

---

## Publishing a post

```bash
npm run new "The Cut Is the Argument" Filmmaking Culture
```

That creates `src/posts/2026-09-16-the-cut-is-the-argument.md` and opens it.
Everything after the title becomes a tag, so pass as many as you like. Fill in
the front matter and write:

```markdown
---
title: The Cut Is the Argument
description: One sentence. Shows on the homepage, in search results, and in the feed.
topics: [Filmmaking, Culture]
draft: true
---

Your first paragraph.
```

Then:

```bash
npm run dev      # preview — drafts show with a "Draft" badge
```

When it's ready, **delete the `draft: true` line** and:

```bash
git add .
git commit -m "Add: The Cut Is the Argument"
git push
```

Live in about a minute. That's the whole loop.

### Front matter reference

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Headline. |
| `description` | recommended | Homepage summary, meta description, RSS summary. |
| `topics` | optional | A list of tags: `topics: [Filmmaking, Culture]`. Each one creates `/topics/<name>/` automatically, and the post appears on every tag's page. Reuse spellings exactly. |
| `draft` | optional | `true` hides it from the live site but lets you commit it safely. |
| `date` | optional | Taken from the filename prefix. Only set this to override. |

A single `topic: Filmmaking` (string) still works, so older posts need no
changes — but `topics: [...]` is the way to tag new ones.

### Tags and filtering

A post can carry any number of tags. On the homepage, a **Filter by tag** bar
lets a reader pick one or more and narrow the list without leaving the page:

- **Any** (the default) shows posts matching *at least one* selected tag.
- **All** shows only posts matching *every* selected tag.

Each tag is also its own page at `/topics/<name>/`, listing every post with
that tag, and `/topics/` is the full index. The filter is progressive
enhancement: with JavaScript off, the bar stays hidden and every post shows.

### Drafts are safe to commit

A post with `draft: true` is visible when you run `npm run dev` and is simply
not built into the published site. You can push half-finished work without it
appearing anywhere public.

### Images

Drop files in `src/images/`, reference them as `/images/name.jpg`:

```markdown
![A frame from the edit](/images/edit-bay.jpg)
```

Resize large photos before committing — Git stores every version forever.
Around 1600px wide and under ~300KB is plenty.

---

## What's here

```
src/
  _data/site.json      ← your title, tagline, URL, nav. Edit this first.
  _includes/           ← page shells (base, post, page)
  posts/               ← your writing. One Markdown file per post.
  css/style.css        ← the entire design, hand-written, no framework
  js/theme.js          ← light/dark toggle
  js/tag-filter.js     ← the homepage Any/All tag filter
  index.njk            ← homepage list + tag filter
  archive.njk          ← everything by year
  topics.njk           ← tag index; topic-page.njk generates each tag's page
  feed.njk             ← RSS/Atom feed
  about.md             ← rewrite this
eleventy.config.js     ← build rules, date formatting, collections
.github/workflows/     ← the deploy pipeline
```

Generated pages, all automatic: `/`, `/archive/`, `/topics/`, one page per
tag, `/about/`, `/feed.xml`, `/sitemap.xml`, `/robots.txt`, `/404.html`.

### Changing the design

Everything visual lives in `src/css/style.css`. The colors are CSS variables
at the top of the file — change `--accent` and the whole site shifts:

```css
--accent: #9c3b23;   /* light mode */
--accent: #e29070;   /* dark mode, further down */
```

Fonts use the system serif stack, so nothing is downloaded from Google or any
other third party. The site loads with zero external requests.

---

## Security

The reason a static site is the secure choice:

- **Nothing executes on the server.** There's no PHP, no database, no admin
  panel, no login form. The classic attack surface doesn't exist.
- **Your machine and GitHub hold the only copies.** Every change is a signed-in
  Git push. There's no separate CMS password to leak.
- **HTTPS is automatic** and enforced by GitHub Pages.
- **No third-party code.** No analytics, no fonts, no CDN, no trackers. The
  only JavaScript is the theme toggle and the homepage tag filter — a few dozen
  lines each, written by hand and readable in a minute.
- **Least-privilege CI.** The deploy workflow can read the repo and publish
  Pages. Nothing else.
- **Dependabot** opens a monthly PR if the one dependency needs a security
  update.

Two habits worth keeping:

1. Turn on two-factor auth on your GitHub account. It's the only real key to
   the site.
2. Never commit anything secret. The repo is public and Git history is
   permanent — a deleted file is still in the history.

---

## A custom domain, later

Nothing needs rebuilding. When you're ready:

1. Buy the domain (Cloudflare and Namecheap are both fine — roughly $10–15/yr).
2. At your registrar, add these DNS records:

   | Type | Name | Value |
   |---|---|---|
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | CNAME | `www` | `YOUR-USERNAME.github.io` |

3. In the repo: **Settings → Pages → Custom domain**, enter the domain, save.
   GitHub commits a `CNAME` file for you.
4. Wait for the certificate, then tick **Enforce HTTPS**.
5. Update `url` in `src/_data/site.json` to the new domain and push, so the
   feed and sitemap point at the right place.

---

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Local preview at localhost:8080, live reload, drafts visible |
| `npm run build` | Build the production site into `_site/` |
| `npm run new "Title" Tag...` | Create a new draft post (any number of tags) |
| `npm run clean` | Delete `_site/` |

## Troubleshooting

**The Actions run failed.** Open the Actions tab and read the red step. It's
almost always step 6 above — Pages source set to a branch instead of GitHub
Actions.

**My post didn't appear.** Check that `draft: true` is gone, and that the
filename starts with a `YYYY-MM-DD-` date.

**The date is off by a day.** Dates are treated as UTC deliberately, so they
never shift by timezone. The filename prefix is the source of truth.

**CSS changes aren't showing.** Hard-reload: `Cmd+Shift+R`.
