# portfolio-website

Personal portfolio site. React + Vite, no CSS framework — CSS Modules per
component plus a central design-tokens file. Currently a content-free
scaffold: structure and design system only, no real copy or project content
yet.

Live at: https://robnmayr.github.io/portfolio-website/

## Stack

- React + Vite (JavaScript/JSX)
- CSS Modules + CSS custom properties (`src/styles/tokens.css`)
- [Lenis](https://github.com/darkroomengineering/lenis) for smooth scroll
- [GSAP](https://gsap.com/) for animations

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Outputs to `dist/`. Deployment to GitHub Pages happens automatically via
GitHub Actions (`.github/workflows/deploy.yml`) on every push to `main`.
