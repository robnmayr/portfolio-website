# Graph Report - portfolio-website  (2026-11-02)

## Corpus Check
- 25 files · ~5,299 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 18 file(s) not represented in the graph (top: .css 10, (none) 8)

## Summary
- 192 nodes · 321 edges · 12 communities (11 shown, 1 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `daa6e238`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Build Tooling & Dev Deps
- package.json
- Language & Site Chrome
- steps
- Docs & Deployment
- Hero.jsx
- dither-reveal.tsx
- deploy.yml
- SectionNav.jsx
- scripts
- portfolio-website
- CLAUDE.md

## God Nodes (most connected - your core abstractions)
1. `useLanguage()` - 15 edges
2. `react` - 11 edges
3. `AppShell()` - 9 edges
4. `Header()` - 9 edges
5. `Hero()` - 9 edges
6. `ThemeToggle()` - 9 edges
7. `usePrefersReducedMotion()` - 9 edges
8. `scrollToSection()` - 9 edges
9. `__OriginkitBase_DitherReveal()` - 8 edges
10. `Portfolio Website README` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Deploy to GitHub Pages Workflow` --shares_data_with--> `Vite`  [INFERRED]
  .github/workflows/deploy.yml → README.md
- `Deploy to GitHub Pages Workflow` --implements--> `GitHub Pages Deployment`  [EXTRACTED]
  .github/workflows/deploy.yml → README.md
- `Portfolio Website README` --references--> `Deploy to GitHub Pages Workflow`  [EXTRACTED]
  README.md → .github/workflows/deploy.yml
- `404 Not Found Page` --references--> `index.html App Shell`  [EXTRACTED]
  public/404.html → index.html
- `AppShell()` --calls--> `Hero()`  [EXTRACTED]
  src/App.jsx → src/components/Hero/Hero.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **GitHub Pages Deployment Pipeline** — github_workflows_deploy_deploy_workflow, readme_github_pages, readme_overview, public_404_not_found_page [INFERRED 0.75]

## Communities (12 total, 1 thin omitted)

### Community 0 - "Build Tooling & Dev Deps"
Cohesion: 0.12
Nodes (16): oxlint, devDependencies, oxlint@^1.81.0, @types/react@^19.2.18, @types/react-dom@^19.2.7, vite@^8.3.0, @vitejs/plugin-react@^6.1.1, oxlint (+8 more)

### Community 1 - "package.json"
Cohesion: 0.07
Nodes (33): @fontsource/silkscreen, @fontsource-variable/exo-2, @fontsource/work-sans, gsap, lenis, dependencies, @fontsource/anton@^5.3.0, @fontsource/silkscreen@^5.3.0 (+25 more)

### Community 2 - "Language & Site Chrome"
Cohesion: 0.15
Nodes (15): App(), AppShell(), About(), Footer(), Header(), NAV_ITEMS, LanguageToggle(), Projects() (+7 more)

### Community 3 - "steps"
Cohesion: 0.12
Nodes (19): runs-on, steps, environment, needs, runs-on, steps, name, url (+11 more)

### Community 4 - "Docs & Deployment"
Cohesion: 0.22
Nodes (11): Deploy to GitHub Pages Workflow, index.html App Shell, 404 Not Found Page, CSS Modules, Design Tokens File (src/styles/tokens.css), GitHub Pages Deployment, GSAP (animation library), Lenis (smooth scroll library) (+3 more)

### Community 5 - "Hero.jsx"
Cohesion: 0.14
Nodes (16): react, Hero(), hexToRgb(), readInk(), DitherReveal(), MoonIcon(), SunIcon(), ThemeToggle() (+8 more)

### Community 6 - "dither-reveal.tsx"
Cohesion: 0.18
Nodes (9): clamp(), DEFAULTS, DITHER_INDEX, DitherRevealProps, imageURL(), __OriginkitBase_DitherReveal(), __originkitPresetProps, RGB (+1 more)

### Community 7 - "deploy.yml"
Cohesion: 0.15
Nodes (12): concurrency, cancel-in-progress, group, name, on, push, workflow_dispatch, permissions (+4 more)

### Community 8 - "SectionNav.jsx"
Cohesion: 0.23
Nodes (7): clsx@^2.1.1, clsx, handleLogoClick(), SECTIONS, getLenisInstance(), scrollToSection(), cn()

### Community 9 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 10 - "portfolio-website"
Cohesion: 0.40
Nodes (4): Build, Local development, portfolio-website, Stack

## Knowledge Gaps
- **17 isolated node(s):** `oxlint`, `@types/react`, `@types/react-dom`, `vite`, `@vitejs/plugin-react` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 79 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Hero.jsx` to `SectionNav.jsx`, `package.json`, `Language & Site Chrome`, `dither-reveal.tsx`?**
  _High betweenness centrality (0.158) - this node is a cross-community bridge._
- **What connects `oxlint`, `@types/react`, `@types/react-dom` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Build Tooling & Dev Deps` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `package.json` to `SectionNav.jsx`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07254623044096728 - nodes in this community are weakly interconnected._
- **Why does `devDependencies` connect `Build Tooling & Dev Deps` to `package.json`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Should `Language & Site Chrome` be split into smaller, more focused modules?**
  _Cohesion score 0.1455026455026455 - nodes in this community are weakly interconnected._