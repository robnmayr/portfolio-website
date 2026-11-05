# Content

Every text on the site lives in a Markdown file here, in English and German.
Edit a file, save, and the page reloads with the change. No code needed.

```
src/content/
  site.md          name and links (the same in every language)
  en/ui.md         navigation, buttons, footer, screen-reader texts
  en/hero.md       the hero: picture description, scroll hint, intro text
  en/about.md      the About section
  de/…             the same files in German
```

## How a file is built

```
---
label: A short text          ← between the two --- lines: labels, lists, short texts
list:
  - one
  - two
# a line starting with # is a comment, only for you
---

The main text goes here, as ordinary paragraphs.

A blank line starts a new paragraph.
```

- The block between `---` lines is YAML: `key: value`, lists with `- `. If a text
  contains a colon or starts with a quote, put it in double quotes.
- Below it comes the main text. Each paragraph (separated by a blank line) is
  one entry. `<!-- like this -->` is a comment that is not shown.
- Keep the English and German file of a part in step: same keys, same number of
  list entries. In development the browser console warns when they differ.

## Common edits

- **Change a text:** edit it in `en/` and in `de/`.
- **Add a fact or a tag in the About section:** add another entry to `facts:` or
  `tags:` in both languages.
- **Change the labels over the circling pictures:** `thoughts:` in `about.md`
  (in the order of the ring; the pictures are in
  `src/assets/images/about/thoughts/`).
- **Set your email or LinkedIn:** `links:` in `site.md`.
- **Add a new part of the page (e.g. Projects):** add `en/projects.md` and
  `de/projects.md`. Its keys then arrive in the component as `t.projects` (the
  paragraphs as `t.projects.paragraphs`); the component that shows it is code,
  so ask for that once and the texts stay editable here.

The loader is `index.js` next to this file.
