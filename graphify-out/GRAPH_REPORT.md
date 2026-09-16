# Graph Report - .  (2026-09-16)

## Corpus Check
- Corpus is ~2,039 words - fits in a single context window. You may not need a graph.

## Summary
- 87 nodes · 123 edges · 7 communities
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.73)
- Token cost: 54,829 input · 0 output

## Community Hubs (Navigation)
- Build Tooling & Dev Deps
- Runtime Dependencies
- Language & Site Chrome
- App Shell & Page Sections
- Docs & Deployment
- Theme System

## God Nodes (most connected - your core abstractions)
1. `useLanguage()` - 11 edges
2. `Portfolio Website README` - 8 edges
3. `scripts` - 5 edges
4. `usePrefersReducedMotion()` - 5 edges
5. `ThemeToggle()` - 4 edges
6. `ThemeProvider()` - 4 edges
7. `useLenis()` - 4 edges
8. `AppShell()` - 3 edges
9. `Footer()` - 3 edges
10. `Header()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Deploy to GitHub Pages Workflow` --shares_data_with--> `Vite`  [INFERRED]
  .github/workflows/deploy.yml → README.md
- `index.html App Shell` --conceptually_related_to--> `React`  [INFERRED]
  index.html → README.md
- `Deploy to GitHub Pages Workflow` --implements--> `GitHub Pages Deployment`  [EXTRACTED]
  .github/workflows/deploy.yml → README.md
- `Portfolio Website README` --references--> `Deploy to GitHub Pages Workflow`  [EXTRACTED]
  README.md → .github/workflows/deploy.yml
- `404 Not Found Page` --references--> `index.html App Shell`  [EXTRACTED]
  public/404.html → index.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **GitHub Pages Deployment Pipeline** — github_workflows_deploy_deploy_workflow, readme_github_pages, readme_overview, public_404_not_found_page [INFERRED 0.75]

## Communities (7 total, 0 thin omitted)

### Community 0 - "Build Tooling & Dev Deps"
Cohesion: 0.10
Nodes (20): oxlint, devDependencies, oxlint, @types/react, @types/react-dom, vite, @vitejs/plugin-react, name (+12 more)

### Community 1 - "Runtime Dependencies"
Cohesion: 0.13
Nodes (15): @fontsource/silkscreen, @fontsource-variable/exo-2, @fontsource/work-sans, gsap, lenis, dependencies, @fontsource/silkscreen, @fontsource-variable/exo-2 (+7 more)

### Community 2 - "Language & Site Chrome"
Cohesion: 0.23
Nodes (10): Footer(), Header(), NAV_ITEMS, LanguageToggle(), getInitialLanguage(), LanguageContext, LanguageProvider(), SUPPORTED_LANGUAGES (+2 more)

### Community 3 - "App Shell & Page Sections"
Cohesion: 0.26
Nodes (7): App(), AppShell(), About(), Hero(), Projects(), useLenis(), usePrefersReducedMotion()

### Community 4 - "Docs & Deployment"
Cohesion: 0.22
Nodes (11): Deploy to GitHub Pages Workflow, index.html App Shell, 404 Not Found Page, CSS Modules, Design Tokens File (src/styles/tokens.css), GitHub Pages Deployment, GSAP (animation library), Lenis (smooth scroll library) (+3 more)

### Community 5 - "Theme System"
Cohesion: 0.29
Nodes (6): ThemeToggle(), getStoredTheme(), getSystemTheme(), ThemeContext, ThemeProvider(), useTheme()

## Knowledge Gaps
- **29 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+24 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Runtime Dependencies` to `Build Tooling & Dev Deps`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _29 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Build Tooling & Dev Deps` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `Runtime Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._