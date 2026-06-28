# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

This is the file mirror for the deployed site **blog.bildungsluecke.xyz** ("Bildungslücke" — German digital-literacy/political-education blog). There is no build system, no `package.json`, no test suite — it's plain static HTML served as-is. There are no commands to build, lint, or test; changes are deployed by pushing to `main` on GitHub (deployment is wired to the GitHub repo — there is no manual FTP upload step).

## Everything is hand-authored static HTML

`index.html` (site root) and `site1/`–`site6/` were originally raw downloaded snapshots of a compiled React/Vite bundle (minified, unreadable, unmaintainable — the original React source project was never committed anywhere and is considered lost). They have since been **fully rewritten as plain static HTML**, using the shared theme CSS classes, with the article text recovered verbatim from the old bundles. There is no React, no build step, and no minified JS left anywhere in the repo. Every page now follows the same hand-authored pattern.

## Adding a new topic page

Follow the existing `siteN/index.html` pattern:

1. Create `siteN/index.html` (next free number; `site1`–`site8` are taken).
2. Use relative paths `../shared-theme.css` and `../shared-theme.js?v=stable-20260628-2` (these resolve from `/siteN/` to the root-level theme files). Bump the `?v=` query whenever `shared-theme.js` changes so browsers refetch it (the static server ignores the query string and always serves the current file).
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
7. Add a matching `lusi-theme-nav-link` entry (linking to the new page) to the nav block on **every** existing page — `index.html` and all `siteN/index.html` files all repeat the same nav markup independently (there's no shared template/include), so a new page must be added to each one by hand.
8. Add a corresponding `lusi-article-card` to the `lusi-article-grid` on the homepage (`index.html`) so the new page is discoverable from the start page.

## Interactive article enhancements (`shared-theme.js` + `shared-theme.css`)

Article pages are progressively enhanced by `shared-theme.js` — vanilla JS, no build, no dependencies. Everything is **opt-in via markup** and **degrades gracefully**: if the script never runs, all content stays visible and readable. Follow the established `site1`–`site8` pattern.

**Editorial structure (the house style for every article):** open with a punchy 1-paragraph **hook** (not dry definitions or regulation first), then a short roadmap/orientation paragraph, then an animated stat row, then the long-form sections. Move dry/legal material further down. When proposing a hook to the user, offer 2–3 variants and let them choose.

**Automatic features** (no per-page markup needed — they activate whenever the page contains `<article class="lusi-longform-copy">`):
- Reading-progress bar (top), scroll-reveal of top-level article blocks, and a back-to-top button.
- All respect `prefers-reduced-motion` and are gated behind JS-set classes (`body.lusi-reveal-ready`) so content is never hidden if the script fails.

**Opt-in widgets** (add the markup; JS wires them up):
- **Animated counters** — `<span class="lusi-stat-value" data-count-to="73" data-count-suffix=" %">73 %</span>` counts up from 0 when scrolled into view. The element's text content is the no-JS fallback (write the final value). Optional `data-count-prefix`, `data-count-suffix`, and `data-count-group="true"` (German `.` thousands grouping, e.g. `60.000`; leave it off for years like `2024`). Decimals use a German comma automatically (`2,8`). Group counters in a `lusi-stat-row` of `lusi-stat` cells (`lusi-stat-value` + `lusi-stat-label`); the row is an `auto-fit` grid, so **3 or 4** cells both look right.
- **Tabs** — `<div class="lusi-tabs" data-tabs>` with a `lusi-tab-list` of `lusi-tab-btn` (each `data-tab="N"`) and matching `lusi-tab-panel` (`data-panel="N"`). Without JS all panels show stacked; JS adds `.is-enhanced` to reveal only the active one. Good for parallel categories (e.g. risk classes, fraud types).
- **Accordion** — native `<details class="lusi-accordion"><summary>…</summary><div class="lusi-accordion-body">…</div></details>`. Pure CSS, works without JS. Use for "Vertiefung" deep-dives and FAQ blocks.
- **Quiz** — `<section class="lusi-quiz" data-quiz>` containing `lusi-quiz-item` blocks, each with `data-answer="N"` (index of the correct option), a `lusi-quiz-q`, several `<button class="lusi-quiz-opt">`, and a `<p class="lusi-quiz-feedback" hidden>`. JS marks right/wrong, reveals feedback, and locks the item. Keep questions answerable from the article text; **skip the quiz on tonally sensitive topics** (e.g. `site4` on filmed violence/victims).

Preserve article body text verbatim when converting a list into tabs/accordions — only restructure, don't rewrite the substance.

## Design system reference (`shared-theme.css`)

Single shared stylesheet across the whole site (and apparently other related sites in the same family, e.g. a `demokratieforum` project). Key facts:

- Dark theme: background `#090b10`, text `#eef3f8`/`#bdc7d4`, accent colors cyan `#67e8f9` and gold `#f3c77d`.
- Headings: "Playfair Display" serif. Body: "Inter" sans-serif.
- Layout widths are controlled via CSS custom properties (`--blog-content-width: 76rem`, `--blog-reading-width: 50rem`) rather than per-page Tailwind classes.
- All theme rules are scoped under `body.lusi-unified-blog`, so this class must be present on `<body>` for any styling to apply.
- The file also defines fallback styling for Tailwind-style utility classes (`max-w-7xl`, `bg-zinc-*`, `gradient-text`, etc.) in case the page reuses Tailwind class names without the actual Tailwind build.

## Routing convention

Live pages are served at `/`, `/site1/` … `/site8/`, each as its own `index.html` rather than client-side routed paths — the server returns a real 404 for unknown paths, there is no SPA fallback. When referencing other pages, always link to the full `/siteN/` path.
