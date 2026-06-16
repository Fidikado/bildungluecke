# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

This is the file mirror for the deployed site **blog.bildungsluecke.xyz** ("Bildungslücke" — German digital-literacy/political-education blog). There is no build system, no `package.json`, no test suite — it's plain static HTML served as-is. There are no commands to build, lint, or test; changes are deployed by uploading the relevant files to the web server.

## Important: two different kinds of `index.html` in this repo

- `index.html` (site root) and `site1/`–`site5/` are **raw downloaded snapshots of the live, compiled React/Vite bundle**. They are minified, contain an entire inlined JS app, and are effectively unreadable/unmaintainable as source — they exist here only as a backup of what's currently live. **Do not hand-edit these to add content.** The original source project for that React app was never committed anywhere and is considered lost; these files are the only record of it.
- `site6/index.html` is **hand-authored static HTML**, written from scratch to visually match the live site using the shared theme CSS classes. This is the actual pattern to follow when adding new topic pages.

## Adding a new topic page

Follow the `site6/index.html` pattern, not the minified bundles:

1. Create `siteN/index.html` (next free number; `site1`–`site6` are taken).
2. Use relative paths `../shared-theme.css` and `../shared-theme.js?v=stable-20260501-3` (these resolve from `/siteN/` to the root-level theme files).
3. Set `<body class="lusi-unified-blog bg-[#060608] antialiased">` directly — `shared-theme.js` normally adds the `lusi-unified-blog` class at runtime, but for a static page set it inline so styling is correct even before the script runs.
4. Reuse the existing structural classes rather than inventing new ones — all of these are defined in `shared-theme.css` and nothing else:
   - `lusi-theme-shell` — outer rounded container for the whole page
   - `lusi-theme-topbar`, `lusi-theme-topbar-main`, `lusi-theme-brand`, `lusi-theme-brand-badge`, `lusi-theme-brand-copy`, `lusi-theme-kicker` — header/branding
   - `lusi-theme-nav`, `lusi-theme-nav-link` (add `is-active` to the current page's link) — top navigation, should list all live topic pages
   - `lusi-article-meta`, `lusi-article-meta-note`, `lusi-article-backlink` — title/meta bar above the article
   - `lusi-content-root`, `lusi-reading-frame`, `lusi-longform-copy`, `lusi-section-heading` — article body and `<h2>` section headers
   - `lusi-pullquote` — highlighted quote block
   - `lusi-home-hero-panel` — boxed callout (used here for the closing CTA box)
   - `lusi-cta-link` — pill-style call-to-action link (auto-appends a `→`)
   - `lusi-theme-footer` — page footer
5. Before using any new class name, verify it's actually defined in `shared-theme.css` — don't assume a class exists just because it sounds plausible.
6. Headings (`h1`–`h6`) automatically render in Playfair Display via the shared theme; body text automatically uses Inter. Don't override `font-family` manually.
7. New pages are **not** automatically linked from the homepage — the homepage card grid lives inside the minified bundle (`index.html`) and isn't safely editable. If a new page should be discoverable from the homepage, that requires separately reconstructing/editing the bundle, which is out of scope for a normal content addition; flag this limitation rather than attempting it.

## Design system reference (`shared-theme.css`)

Single shared stylesheet across the whole site (and apparently other related sites in the same family, e.g. a `demokratieforum` project). Key facts:

- Dark theme: background `#090b10`, text `#eef3f8`/`#bdc7d4`, accent colors cyan `#67e8f9` and gold `#f3c77d`.
- Headings: "Playfair Display" serif. Body: "Inter" sans-serif.
- Layout widths are controlled via CSS custom properties (`--blog-content-width: 76rem`, `--blog-reading-width: 50rem`) rather than per-page Tailwind classes.
- All theme rules are scoped under `body.lusi-unified-blog`, so this class must be present on `<body>` for any styling to apply.
- The file also defines fallback styling for Tailwind-style utility classes (`max-w-7xl`, `bg-zinc-*`, `gradient-text`, etc.) in case the page reuses Tailwind class names without the actual Tailwind build.

## Routing convention

Live pages are served at `/`, `/site1/` … `/site5/` (and now `/site6/`), each as its own `index.html` rather than client-side routed paths — the server returns a real 404 for unknown paths, there is no SPA fallback. When referencing other pages, always link to the full `/siteN/` path.
