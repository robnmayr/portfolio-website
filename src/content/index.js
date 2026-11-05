import { load } from 'js-yaml'

// All the texts on the site live in Markdown files in this folder (see
// README.md next to this file for how to edit them):
//
//   site.md        what is the same in every language: name, links
//   en/<name>.md   the English texts of one part of the page
//   de/<name>.md   the German ones, same names, same keys
//
// A file has a YAML block between two `---` lines (labels, lists, short texts) and,
// below it, the main text as ordinary paragraphs. This turns them into the
// `dictionary` the components read through useLanguage(): en/ui.md gives the
// top-level keys (nav, theme, footer, ...); every other file becomes one
// section, e.g. en/about.md -> t.about, with its text as `paragraphs` (a list,
// one entry per paragraph) and `text` (all of it as one string).
//
// Vite bundles the files with the page and reloads it when one changes.

export const LANGUAGES = ['en', 'de']

const files = import.meta.glob(['./**/*.md', '!./README.md'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

function parse(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)([\s\S]*)$/)
  const data = match ? (load(match[1]) ?? {}) : {}
  const body = (match ? match[2] : raw).replace(/<!--[\s\S]*?-->/g, '').trim()
  const paragraphs = body
    ? body.split(/\r?\n\s*\r?\n/).map((paragraph) => paragraph.replace(/\s*\r?\n\s*/g, ' ').trim())
    : []
  return { data, paragraphs }
}

function buildLanguage(language) {
  const result = {}
  Object.entries(files).forEach(([path, raw]) => {
    const match = path.match(/^\.\/([a-z]{2})\/([\w-]+)\.md$/)
    if (!match || match[1] !== language) return
    const { data, paragraphs } = parse(raw)
    if (match[2] === 'ui') {
      Object.assign(result, data)
    } else {
      result[match[2]] = { ...data, paragraphs, text: paragraphs.join(' ') }
    }
  })
  return result
}

export const dictionary = Object.fromEntries(LANGUAGES.map((language) => [language, buildLanguage(language)]))

export const site = parse(files['./site.md'] ?? '').data

// While developing: tell the editor (in the browser console) when a text exists
// in one language but not the other, so a missing translation does not go
// unnoticed.
if (import.meta.env.DEV) {
  const keysOf = (value, prefix = '') => {
    if (Array.isArray(value)) {
      return [`${prefix}[${value.length} entries]`, ...value.flatMap((item, index) => keysOf(item, `${prefix}[${index}]`))]
    }
    if (value && typeof value === 'object') {
      return Object.entries(value).flatMap(([key, item]) => keysOf(item, prefix ? `${prefix}.${key}` : key))
    }
    return [prefix]
  }
  const [first, ...others] = LANGUAGES
  const reference = new Set(keysOf(dictionary[first]))
  others.forEach((language) => {
    const current = new Set(keysOf(dictionary[language]))
    const missing = [...reference].filter((key) => !current.has(key))
    const extra = [...current].filter((key) => !reference.has(key))
    if (missing.length || extra.length) {
      console.warn(
        `[content] ${first} and ${language} do not match.`,
        missing.length ? `Missing in ${language}: ${missing.join(', ')}.` : '',
        extra.length ? `Only in ${language}: ${extra.join(', ')}.` : '',
      )
    }
  })
}
