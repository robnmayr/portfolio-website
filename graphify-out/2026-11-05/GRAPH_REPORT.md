# Graph Report - portfolio-website  (2026-11-05)

## Corpus Check
- 47 files · ~25,541 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 22 file(s) not represented in the graph (top: .css 14, (none) 8)

## Summary
- 316 nodes · 568 edges · 20 communities (12 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7c55cab6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Hero.jsx
- package.json
- Language & Site Chrome
- steps
- Docs & Deployment
- OrbitPortrait.jsx
- dither-reveal.tsx
- ScrollReveal.jsx
- pixel-led-display.tsx
- portfolio-website
- CLAUDE.md
- Content
- usercursor.tsx

## God Nodes (most connected - your core abstractions)
1. `react` - 22 edges
2. `useLanguage()` - 21 edges
3. `OrbitPortrait()` - 16 edges
4. `Hero()` - 14 edges
5. `usePrefersReducedMotion()` - 11 edges
6. `About()` - 10 edges
7. `AppShell()` - 9 edges
8. `Header()` - 9 edges
9. `scrollToSection()` - 9 edges
10. `gsap` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Deploy to GitHub Pages Workflow` --shares_data_with--> `Vite`  [INFERRED]
  .github/workflows/deploy.yml → README.md
- `Deploy to GitHub Pages Workflow` --implements--> `GitHub Pages Deployment`  [EXTRACTED]
  .github/workflows/deploy.yml → README.md
- `Portfolio Website README` --references--> `Deploy to GitHub Pages Workflow`  [EXTRACTED]
  README.md → .github/workflows/deploy.yml
- `404 Not Found Page` --references--> `index.html App Shell`  [EXTRACTED]
  public/404.html → index.html
- `AppShell()` --calls--> `About()`  [EXTRACTED]
  src/App.jsx → src/components/About/About.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **GitHub Pages Deployment Pipeline** — github_workflows_deploy_deploy_workflow, readme_github_pages, readme_overview, public_404_not_found_page [INFERRED 0.75]

## Communities (20 total, 8 thin omitted)

### Community 0 - "Hero.jsx"
Cohesion: 0.11
Nodes (23): gsap@^3.15.0, gsap, canvasPadStyle, handStyle(), Hero(), HUMAN_HAND, ROBOT_HAND, StrokeName() (+15 more)

### Community 1 - "package.json"
Cohesion: 0.05
Nodes (48): dependencies, clsx@^2.1.1, @fontsource/barlow-condensed@^5.3.0, @fontsource/silkscreen@^5.3.0, @fontsource-variable/exo-2@^5.3.0, @fontsource/work-sans@^5.3.0, framer-motion@^14.9.0, @heroicons/react@^2.2.0 (+40 more)

### Community 2 - "Language & Site Chrome"
Cohesion: 0.07
Nodes (32): App(), AppShell(), Footer(), Header(), handleLogoClick(), LanguageToggle(), Projects(), SectionNav() (+24 more)

### Community 3 - "steps"
Cohesion: 0.07
Nodes (31): runs-on, steps, concurrency, cancel-in-progress, group, environment, needs, runs-on (+23 more)

### Community 4 - "Docs & Deployment"
Cohesion: 0.22
Nodes (11): Deploy to GitHub Pages Workflow, index.html App Shell, 404 Not Found Page, CSS Modules, Design Tokens File (src/styles/tokens.css), GitHub Pages Deployment, GSAP (animation library), Lenis (smooth scroll library) (+3 more)

### Community 5 - "OrbitPortrait.jsx"
Cohesion: 0.08
Nodes (41): react, About(), clamp01(), clamp01(), FlyingHeading(), alphaMask(), axis, BAYER (+33 more)

### Community 6 - "dither-reveal.tsx"
Cohesion: 0.15
Nodes (12): clamp(), DEFAULTS, DITHER_INDEX, DitherMotion, DitherPointer, DitherReveal(), DitherRevealProps, imageURL() (+4 more)

### Community 7 - "ScrollReveal.jsx"
Cohesion: 0.44
Nodes (8): clamp01(), clampToScroll(), easeBack(), easeOut(), glowAt(), paintPiece(), ScrollReveal(), smooth()

### Community 9 - "pixel-led-display.tsx"
Cohesion: 0.12
Nodes (22): LedName(), pitchForViewport(), toRgb(), buildColumns(), Direction, DotShape, EXTRA, flickerNoise() (+14 more)

### Community 10 - "portfolio-website"
Cohesion: 0.40
Nodes (4): Build, Local development, portfolio-website, Stack

### Community 12 - "Content"
Cohesion: 0.50
Nodes (3): Common edits, Content, How a file is built

### Community 13 - "usercursor.tsx"
Cohesion: 0.31
Nodes (8): ClassNames, COMPONENT_DEFAULTS, CursorLayer(), __OriginkitBase_UserCursor(), __originkitPresetProps, Props, useIsStaticRenderer(), UserCursor()

## Knowledge Gaps
- **5 isolated node(s):** `404 Not Found Page`, `CSS Modules`, `Design Tokens File (src/styles/tokens.css)`, `GSAP (animation library)`, `Lenis (smooth scroll library)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 112 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `OrbitPortrait.jsx` to `Hero.jsx`, `package.json`, `Language & Site Chrome`, `dither-reveal.tsx`, `ScrollReveal.jsx`, `pixel-led-display.tsx`, `usercursor.tsx`?**
  _High betweenness centrality (0.316) - this node is a cross-community bridge._
- **What connects `404 Not Found Page`, `CSS Modules`, `Design Tokens File (src/styles/tokens.css)` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Hero.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11491935483870967 - nodes in this community are weakly interconnected._
- **Why does `gsap` connect `Hero.jsx` to `package.json`, `OrbitPortrait.jsx`, `ScrollReveal.jsx`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05411764705882353 - nodes in this community are weakly interconnected._
- **Why does `useLanguage()` connect `Language & Site Chrome` to `Hero.jsx`, `OrbitPortrait.jsx`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Should `Language & Site Chrome` be split into smaller, more focused modules?**
  _Cohesion score 0.06912442396313365 - nodes in this community are weakly interconnected._