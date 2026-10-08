#!/usr/bin/env node
/**
 * ui-craft-en project UI audit scanner
 *
 * Automates the mechanically detectable parts of the manual audit in
 * visual-dna/anti-generic.md and review/visual-review.md.
 * This scanner is read-only and never modifies project files.
 *
 * Usage:
 *   node assets/tools/scan-project.mjs <project-directory>
 *   node assets/tools/scan-project.mjs <project-directory> --out report.md
 *   node assets/tools/scan-project.mjs <project-directory> --json
 *   node assets/tools/scan-project.mjs <project-directory> --strict
 *   node assets/tools/scan-project.mjs --self-test
 *
 * Add a trailing `ui-craft-scan-ignore` comment to suppress one line.
 * Style rules inspect .vue/.css/.scss/.less/.sass/.html/.jsx/.tsx files.
 * When CSS appears inside .js/.ts strings, such as styled-components or
 * tailwind-merge, only hard-coded colors are inspected.
 */
import { readFileSync, writeFileSync, readdirSync, lstatSync, existsSync } from 'node:fs'
import { join, relative, extname, resolve, dirname } from 'node:path'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

/* ============================ Rule definitions ============================ */
const STYLE_EXT = new Set(['.vue', '.css', '.scss', '.sass', '.less', '.html', '.jsx', '.tsx'])

/**
 * Each rule provides the skill ID, severity, title, suggestion, and either a
 * regular expression or test(line, context). scope='style' means the rule is
 * limited to style-bearing files because it depends on CSS syntax.
 */
const RULES = [
  {
    id: 'R02',
    severity: 'high',
    title: 'Hard-coded color',
    suggestion: 'Use a semantic token such as var(--ui-surface); concrete colors belong only in token files.',
    re: /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lch|lab|color)\s*\(|(?:color|background|fill|stroke)\s*:\s*(?:white|black|red|blue|green|gray|grey|orange|purple)\b/i,
  },
  {
    id: 'R02',
    severity: 'low',
    title: 'Spacing or type size outside the 4px scale',
    scope: 'style',
    suggestion: 'Confirm a controlled exception such as a 1–3px adjustment, 10/14px table padding, or -1px sr-only offset; otherwise use the scale or var(--ui-space-*).',
    test: line => {
      const match = /(?:margin|padding|gap|font-size|border-radius)[a-z-]*\s*:\s*([^;]+)/.exec(line)
      if (!match) return false
      const scale = new Set([0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64])
      const exceptions = new Set([-1, 1, 2, 3, 10, 14])
      for (const value of match[1].matchAll(/(-?\d+(?:\.\d+)?)(?:px|rem)\b/g)) {
        const number = Number(value[1])
        if (!scale.has(number) && !exceptions.has(number)) return true
      }
      return false
    },
  },
  {
    id: 'R14',
    severity: 'high',
    title: 'outline reset without replacement focus style',
    scope: 'style',
    suggestion: 'Add :focus-visible with var(--ui-shadow-focus) or another equivalent; keyboard users otherwise lose their position.',
    test: (line, context) => {
      if (!/outline\s*:\s*(?:none|0)\b/.test(line)) return false
      const block = context.lines.slice(context.i, context.i + 4).join(' ')
      return !/box-shadow|outline\s*:\s*(?:revert|unset|auto)/.test(block)
    },
  },
  {
    id: 'R07',
    severity: 'high',
    title: 'Negative tracking on Chinese body text',
    scope: 'style',
    suggestion: 'Chinese body letter-spacing must be zero; negative tracking makes Han characters collide.',
    re: /letter-spacing\s*:\s*-/,
  },
  {
    id: 'R06',
    severity: 'high',
    title: 'Font stack lacks a Chinese fallback',
    scope: 'style',
    suggestion: 'Put Latin fonts first and add PingFang SC, Microsoft YaHei, or another Chinese fallback; alternatively use var(--ui-font-sans).',
    test: line =>
      /font-family\s*:/.test(line) &&
      /sans-serif|serif|monospace/.test(line) &&
      !/PingFang|Microsoft YaHei|Noto Sans CJK|Source Han|HarmonyOS|MiSans|Songti|SimSun|var\(--ui-font/.test(line),
  },
  {
    id: 'R11',
    severity: 'medium',
    title: 'Emoji appears in source',
    suggestion: 'Use an icon library or SVG because Emoji rendering varies by platform.',
    re: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u,
  },
  {
    id: 'R13',
    severity: 'medium',
    title: 'Placeholder copy',
    suggestion: 'Use credible contextual content and label it as example data.',
    re: /John Doe|Jane Doe|Example Corp|Lorem ipsum|Acme Corp|test data\s*\d/i,
  },
  {
    id: 'A11y',
    severity: 'medium',
    title: 'Click handler on a non-interactive element',
    suggestion: 'Use button or a; a div also needs role, tabindex, and keyboard handling to be reachable.',
    re: /<(?:div|span|li|td)\b[^>]*\s@(?:click|mousedown)\b/,
  },
  {
    id: 'D9',
    severity: 'medium',
    title: 'Scroll-event-driven rendering or animation',
    suggestion: 'Use IntersectionObserver or CSS animation-timeline; a scroll callback may fire every frame.',
    re: /addEventListener\(\s*['"]scroll['"]/,
  },
  {
    id: 'Perf',
    severity: 'medium',
    title: 'transition: all',
    scope: 'style',
    suggestion: 'Transition only required properties such as transform, opacity, or background-color.',
    re: /transition\s*:\s*all\b/,
  },
  {
    id: 'Perf',
    severity: 'low',
    title: '!important',
    scope: 'style',
    suggestion: 'Use @layer and scoped selectors; !important makes the cascade harder to control.',
    re: /!important/,
  },
  {
    id: 'Z',
    severity: 'low',
    title: 'Hard-coded z-index',
    scope: 'style',
    suggestion: 'Use a semantic --ui-z-* token.',
    test: line => /z-index\s*:\s*-?\d{2,}/.test(line) && !/var\(/.test(line),
  },
]

const FILE_RULES = [
  {
    id: 'R14',
    severity: 'medium',
    title: 'Interactive elements exist without :focus-visible',
    suggestion: 'Add a :focus-visible rule; it is the keyboard user’s location indicator.',
    test: source => /<(?:button|input|select|textarea|a\s[^>]*href)/i.test(source) && !/:focus-visible/.test(source),
  },
]

const SCAN_EXT = new Set(['.vue', '.jsx', '.tsx', '.html', '.css', '.scss', '.sass', '.less', '.js', '.ts', '.mjs', '.cjs'])
const ASSET_DIRS = new Set(['assets', 'public', 'static'])
const SKIP_DIRS = new Set([
  'node_modules', 'dist', 'build', 'out', 'coverage', '.git', '.next', '.nuxt',
  '.output', '.cache', '.vite', '.turbo', '.svelte-kit', 'storybook-static',
  'vendor', '__snapshots__', 'release', 'win-unpacked', 'linux-unpacked', 'mac', 'tmp',
])
const TOKEN_FILE_HINT = /(^|[\\/])(tokens?|theme|variables?|var|design-system)([\\/.-]|$)|var\.scss$|tokens\.css$/i
const CUSTOM_PROP_LINE = /^\s*--[\w-]+\s*:/
const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lch|lab|color)\s*\(/

/* ============================ Scanning ============================ */
function walk(directory, scope, options) {
  let entries
  try {
    entries = readdirSync(directory).sort()
  } catch (error) {
    scope.failures.push({ path: directory, reason: error.message })
    return
  }
  for (const name of entries) {
    const path = join(directory, name)
    let stat
    try {
      stat = lstatSync(path)
    } catch (error) {
      scope.failures.push({ path, reason: error.message })
      continue
    }
    if (stat.isSymbolicLink()) {
      scope.skipped.push({ path, reason: 'symbolic-link' })
    } else if (stat.isDirectory()) {
      if (SKIP_DIRS.has(name) || (!options.includeAssets && ASSET_DIRS.has(name))) {
        scope.skipped.push({ path, reason: SKIP_DIRS.has(name) ? 'dependency-or-output' : 'assets-default-exclusion' })
      } else {
        walk(path, scope, options)
      }
    } else if (!SCAN_EXT.has(extname(name).toLowerCase()) || /\.min\./.test(name)) {
      scope.skipped.push({ path, reason: 'unsupported-extension-or-minified' })
    } else if (scope.discovered.length >= options.cap) {
      scope.truncated = true
      scope.skipped.push({ path, reason: 'file-cap' })
    } else {
      scope.discovered.push(path)
    }
  }
}

/** Remove script blocks while preserving line indexes for CSS-oriented rules. */
function buildStyleView(lines) {
  let inScript = false
  return lines.map(line => {
    const opens = /<script\b/i.test(line)
    const closes = /<\/script>/i.test(line)
    let output = line
    if (inScript) output = ''
    if (opens) {
      output = ''
      if (!closes) inScript = true
    }
    if (closes) inScript = false
    return output
  })
}

export function scanSource(source, relativePath, options = {}) {
  const isTokenFile = options.tokenFiles ? options.tokenFiles.includes(relativePath) : TOKEN_FILE_HINT.test(relativePath)
  const lines = source.split(/\r?\n/)
  const styleView = buildStyleView(lines)
  const found = []
  const excluded = []
  const extension = extname(relativePath).toLowerCase()
  const tokenLines = new Set()
  for (let index = 0; index < lines.length; index++) {
    if (CUSTOM_PROP_LINE.test(lines[index]) && COLOR_RE.test(lines[index])) tokenLines.add(index)
  }

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]
    const styleLine = styleView[index]
    if (/ui-craft-scan-ignore/.test(line)) {
      excluded.push({ file: relativePath, line: index + 1, reason: 'explicit-line-ignore' })
      continue
    }
    for (const rule of RULES) {
      const styleOnly = rule.scope === 'style'
      if (styleOnly && !STYLE_EXT.has(extension)) continue
      const target = styleOnly ? styleLine : line
      if (styleOnly && !target) continue
      const hit = rule.re ? rule.re.test(target) : rule.test(target, { source, lines: styleOnly ? styleView : lines, i: index, extension })
      if (!hit) continue
      const item = {
        ruleId: rule.id,
        severity: rule.severity,
        title: rule.title,
        suggestion: rule.suggestion,
        file: relativePath,
        line: index + 1,
        code: line.trim().slice(0, 120),
      }
      const plainTokenDefinition = /^\s*--[\w-]+\s*:[^;]+;?\s*(?:\/\*.*\*\/)?\s*$/.test(line)
      if (rule.title === 'Hard-coded color' && isTokenFile && tokenLines.has(index) && plainTokenDefinition) {
        excluded.push({ ...item, reason: 'token-definition' })
      } else {
        found.push(item)
      }
    }
  }

  for (const rule of FILE_RULES) {
    const ownsStyles = ['.vue', '.jsx', '.tsx'].includes(extension) || /<style[\s>]/.test(source)
    if (!ownsStyles) continue
    if (rule.test(source, relativePath)) {
      found.push({
        ruleId: rule.id,
        severity: rule.severity,
        title: rule.title,
        suggestion: rule.suggestion,
        file: relativePath,
        line: 0,
        code: '(entire file)',
      })
    }
  }
  return { found, excluded }
}

export function scanProject(rootDirectory, options = {}) {
  options = { includeAssets: false, cap: 20000, ...options }
  const scope = { discovered: [], skipped: [], failures: [], truncated: false }
  walk(rootDirectory, scope, options)
  const files = []
  const violations = []
  const excluded = []
  for (const file of scope.discovered) {
    try {
      const relativePath = relative(rootDirectory, file).replace(/\\/g, '/')
      const result = scanSource(readFileSync(file, 'utf8'), relativePath, options)
      files.push(file)
      violations.push(...result.found)
      excluded.push(...result.excluded)
    } catch (error) {
      scope.failures.push({ path: file, reason: error.message })
    }
  }
  return {
    files,
    violations,
    excluded,
    ...scope,
    complete: !scope.truncated && !scope.failures.length && files.length > 0,
  }
}

/* ============================ Reporting ============================ */
function summarize(violations) {
  const byRule = new Map()
  for (const violation of violations) {
    const key = `${violation.ruleId}|${violation.title}`
    if (!byRule.has(key)) byRule.set(key, { ...violation, count: 0, files: new Set() })
    const entry = byRule.get(key)
    entry.count++
    entry.files.add(violation.file)
  }
  const order = { high: 0, medium: 1, low: 2 }
  return [...byRule.values()].sort((left, right) => order[left.severity] - order[right.severity] || right.count - left.count)
}

function toMarkdown(rootDirectory, result) {
  const { files, violations, excluded } = result
  const groups = summarize(violations)
  const high = violations.filter(violation => violation.severity === 'high').length
  const medium = violations.filter(violation => violation.severity === 'medium').length
  const low = violations.filter(violation => violation.severity === 'low').length
  const lines = []
  lines.push('# UI Audit Report (automated scan)')
  lines.push('')
  lines.push(`Scanned directory: \`${rootDirectory}\``)
  lines.push(`Scanned files: ${files.length}; complete: ${result.complete}; truncated: ${result.truncated}; read failures: ${result.failures.length}`)
  lines.push('Rule scope: regular-expression candidate checks, not complete CSS/JS semantic parsing. Named colors cover a common subset; layout and visual judgment remain manual.')
  lines.push(`Excluded paths: ${result.skipped.length}. The scope list below is complete and is not hidden by detail limits.`)
  for (const item of [...result.skipped, ...result.failures]) lines.push(`- ${item.path}: ${item.reason}`)
  lines.push(`Scanned: ${files.map(file => relative(rootDirectory, file)).join(', ')}`)
  lines.push(`Total findings: **${violations.length}** (high ${high} / medium ${medium} / low ${low})`)
  lines.push('')
  lines.push('> This mechanical scan covers only rules expressible as regular expressions. Review layout, state coverage,')
  lines.push('> and copy quality manually with `review/visual-review.md`. See `visual-dna/anti-generic.md` for rule meaning.')
  lines.push('')

  if (!violations.length) {
    lines.push('## Conclusion')
    lines.push('')
    lines.push('No mechanically detectable issues were found. This does **not** mean the review passed; continue with the manual checklist.')
  } else {
    lines.push('## Summary by rule')
    lines.push('')
    lines.push('| Severity | Rule | Finding | Count | Files |')
    lines.push('|---|---|---|---:|---:|')
    for (const group of groups) lines.push(`| ${group.severity} | \`${group.ruleId}\` | ${group.title} | ${group.count} | ${group.files.size} |`)
    lines.push('')
    lines.push('## Details (up to 15 per category)')
    lines.push('')
    for (const group of groups) {
      const items = violations.filter(violation => violation.ruleId === group.ruleId && violation.title === group.title)
      lines.push(`### \`${group.ruleId}\` ${group.title} · ${group.count} · ${group.severity}`)
      lines.push('')
      lines.push(`Fix: ${group.suggestion}`)
      lines.push('')
      lines.push('| File | Line | Code |')
      lines.push('|---|---:|---|')
      for (const violation of items.slice(0, 15)) {
        lines.push(`| \`${violation.file}\` | ${violation.line || '-'} | \`${violation.code.replace(/\|/g, '\\|')}\` |`)
      }
      if (items.length > 15) lines.push(`| Additional findings | | ${items.length - 15} more |`)
      lines.push('')
    }
  }

  if (excluded.length) {
    const tokenDefinitions = excluded.filter(item => item.reason === 'token-definition').length
    const explicitIgnores = excluded.filter(item => item.reason === 'explicit-line-ignore').length
    lines.push('## Excluded')
    lines.push('')
    lines.push(`Official or candidate token definitions: ${tokenDefinitions}; explicit line ignores: ${explicitIgnores}. Without --tokens, token sources are inferred from filenames and still require manual confirmation.`)
    lines.push(`Files: ${[...new Set(excluded.map(item => item.file))].map(file => '`' + file + '`').join(', ')}`)
    lines.push('')
  }
  return lines.join('\n')
}

/* ============================ Built-in fixture test ============================ */
/** Expected values are defined from fixture intent, not copied from scanner output. */
const SELF_TEST_EXPECT = {
  hardcodedColor: 4,
  magicNumber: 2,
  outlineNone: 2,
  negativeLetterSpacing: 1,
  fontStackNoCjk: 1,
  emoji: 1,
  placeholderText: 1,
  clickOnNonInteractive: 1,
  scrollListener: 1,
  transitionAll: 1,
  important: 1,
  zIndexHardcoded: 1,
  missingFocusVisible: 1,
  excludedTokenColors: 3,
  cleanFileViolations: 0,
}

function keyOf(violation) {
  const map = {
    'Hard-coded color': 'hardcodedColor',
    'Hard-coded spacing or type size': 'magicNumber',
    'Spacing or type size outside the 4px scale': 'magicNumber',
    'outline reset without replacement focus style': 'outlineNone',
    'Negative tracking on Chinese body text': 'negativeLetterSpacing',
    'Font stack lacks a Chinese fallback': 'fontStackNoCjk',
    'Emoji appears in source': 'emoji',
    'Placeholder copy': 'placeholderText',
    'Click handler on a non-interactive element': 'clickOnNonInteractive',
    'Scroll-event-driven rendering or animation': 'scrollListener',
    'transition: all': 'transitionAll',
    '!important': 'important',
    'Hard-coded z-index': 'zIndexHardcoded',
    'Interactive elements exist without :focus-visible': 'missingFocusVisible',
  }
  return map[violation.title] || violation.title
}

function selfTest() {
  const fixture = join(here, '__fixtures__', 'audit-sample')
  if (!existsSync(fixture)) {
    console.error(`Fixture directory does not exist: ${fixture}`)
    process.exit(2)
  }
  const result = scanProject(fixture)
  const actual = {}
  for (const violation of result.violations) {
    const key = keyOf(violation)
    actual[key] = (actual[key] || 0) + 1
  }
  actual.excludedTokenColors = result.excluded.filter(item => item.reason === 'token-definition').length
  actual.cleanFileViolations = result.violations.filter(violation => violation.file.endsWith('GoodCard.vue')).length

  let mismatches = 0
  console.log('ui-craft-en scanner built-in fixture test')
  console.log('─'.repeat(64))
  for (const [key, expected] of Object.entries(SELF_TEST_EXPECT)) {
    const actualValue = actual[key] || 0
    const ok = actualValue === expected
    if (!ok) mismatches++
    console.log(`${ok ? 'ok  ' : 'FAIL'}  ${key.padEnd(24)} expected ${String(expected).padStart(2)}  actual ${String(actualValue).padStart(2)}`)
  }
  console.log('─'.repeat(64))
  if (mismatches) {
    console.log(`Conclusion: ${mismatches} mismatched item(s)`)
    process.exit(1)
  }
  assert.equal(scanSource('.same { color: #ffffff; }', 'page.css').found.filter(violation => violation.title === 'Hard-coded color').length, 1)
  assert.equal(scanSource('.same { color: oklch(50% 0.1 240); }', 'page.css').found.filter(violation => violation.title === 'Hard-coded color').length, 1)
  assert.equal(scanSource('--local: #ffffff;', 'page.css').excluded.length, 0)
  assert.equal(scanSource('--ui-brand: #fff;', 'fixtures/tokens.css', { tokenFiles: ['ui-tokens.css'] }).excluded.length, 0)
  assert.equal(scanProject(fixture, { cap: 1 }).complete, false)
  assert.equal(scanProject(join(fixture, '__missing__')).complete, false)
  assert(SCAN_EXT.has('.mjs'))
  console.log('Conclusion: fixture counts and hard-coded-color, modern-color, local-variable, unofficial-token, truncation, and missing-resource negative cases passed')
}

/* ============================ Entry point ============================ */
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2)
  if (argv.includes('--self-test')) {
    selfTest()
  } else {
    const valueFlags = new Set(['--out', '--cap', '--tokens'])
    const positional = argv.filter((argument, index) => !argument.startsWith('--') && !valueFlags.has(argv[index - 1]))
    const target = positional[0]
    if (!target) {
      console.error('Usage: node assets/tools/scan-project.mjs <project-directory> [--out report.md] [--json] [--strict]')
      console.error('       node assets/tools/scan-project.mjs --self-test')
      process.exit(2)
    }
    if (!existsSync(target)) {
      console.error(`Directory does not exist: ${target}`)
      process.exit(2)
    }
    const capIndex = argv.indexOf('--cap')
    const cap = capIndex < 0 ? 20000 : Number(argv[capIndex + 1])
    if (!Number.isInteger(cap) || cap < 1 || cap > 20000) throw Error('--cap must be an integer from 1 to 20000')
    const tokenFiles = argv.flatMap((argument, index) => argument === '--tokens' ? [argv[index + 1]] : [])
    if (tokenFiles.some(file => !file || file.startsWith('--'))) throw Error('--tokens requires a relative file path')
    const result = scanProject(target, {
      includeAssets: argv.includes('--include-assets'),
      cap,
      ...(tokenFiles.length ? { tokenFiles } : {}),
    })
    const asJson = argv.includes('--json')
    const outputIndex = argv.indexOf('--out')
    const outputFile = outputIndex !== -1 ? argv[outputIndex + 1] : null
    const payload = {
      root: target,
      scannedFiles: result.files.length,
      files: result.files,
      skipped: result.skipped,
      failures: result.failures,
      truncated: result.truncated,
      complete: result.complete,
      exclusions: result.excluded,
      ruleScope: {
        extensions: [...SCAN_EXT],
        syntax: 'line-regex',
        styleExtensions: [...STYLE_EXT],
        tokenSources: tokenFiles.length ? tokenFiles : 'filename-heuristic',
        namedColors: 'common-subset',
        visualJudgment: 'manual',
      },
      total: result.violations.length,
      bySeverity: {
        high: result.violations.filter(violation => violation.severity === 'high').length,
        medium: result.violations.filter(violation => violation.severity === 'medium').length,
        low: result.violations.filter(violation => violation.severity === 'low').length,
      },
      groups: summarize(result.violations).map(group => ({
        ruleId: group.ruleId,
        title: group.title,
        severity: group.severity,
        count: group.count,
        files: group.files.size,
      })),
      violations: result.violations,
      excludedTokenColors: result.excluded.filter(item => item.reason === 'token-definition').length,
    }

    if (asJson) {
      const text = JSON.stringify(payload, null, 2)
      if (outputFile) writeFileSync(outputFile, text, 'utf8')
      else console.log(text)
    } else {
      const markdown = toMarkdown(target, result)
      if (outputFile) {
        writeFileSync(outputFile, markdown, 'utf8')
        console.log(`Report written to ${outputFile}`)
        console.log(`Scanned ${result.files.length} files and found ${result.violations.length} issues (${payload.bySeverity.high} high)`)
      } else {
        console.log(markdown)
      }
    }

    if (!result.complete) process.exitCode = 2
    else if (argv.includes('--strict') && payload.bySeverity.high > 0) process.exitCode = 1
  }
}
