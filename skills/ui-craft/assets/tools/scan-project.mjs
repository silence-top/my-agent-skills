#!/usr/bin/env node
/**
 * ui-craft 项目 UI 审计扫描器
 *
 * 把 visual-dna/anti-generic.md 与 review/visual-review.md 里"人工审计 + grep"的机械部分自动化。
 * 只读扫描，不修改任何文件。
 *
 * 用法：
 *   node assets/tools/scan-project.mjs <项目目录>                 # 打印 Markdown 报告
 *   node assets/tools/scan-project.mjs <项目目录> --out report.md # 写入文件
 *   node assets/tools/scan-project.mjs <项目目录> --json          # 机器可读
 *   node assets/tools/scan-project.mjs <项目目录> --strict        # 有"高"级别问题时退出码 1
 *   node assets/tools/scan-project.mjs --self-test                # 用内置样本自检规则是否生效
 *
 * 抑制误报：在任意行尾加 `ui-craft-scan-ignore` 注释即可跳过该行。
 * 已知边界：只在 .vue/.css/.scss/.less/.sass/.html/.jsx/.tsx 里检查"样式类"规则；
 * 若样式写在 .js/.ts 的字符串里（styled-components、tailwind-merge 等），
 * 只有硬编码颜色会被检查，其余样式规则不适用。
 */
import { readFileSync, writeFileSync, readdirSync, lstatSync, existsSync } from 'node:fs'
import { join, relative, extname, resolve } from 'node:path'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))

/* ============================ 规则定义 ============================ */
const STYLE_EXT = new Set(['.vue', '.css', '.scss', '.sass', '.less', '.html', '.jsx', '.tsx'])
/**
 * 每条规则：id（对应技能里的红线/反模式编号）、severity、title、suggestion、test(line, ctx)
 * scope='style' 表示只在样式文件里检查 —— 这些规则依赖 CSS 语法，
 * 放到 .js/.ts 里会把注入的样式字符串和比较用的色值字符串误判为问题。
 */
const RULES = [
  {
    id: 'R02',
    severity: '高',
    title: '硬编码颜色',
    suggestion: '改为语义令牌（var(--ui-surface) 等）；颜色只允许出现在令牌文件里',
    re: /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lch|lab|color)\s*\(|(?:color|background|fill|stroke)\s*:\s*(?:white|black|red|blue|green|gray|grey|orange|purple)\b/i,
  },
  {
    id: 'R02',
    severity: '低',
    title: '间距/字号偏离 4px 刻度',
    scope: 'style',
    suggestion:
      '确认是受控例外（1–3px 微调、表格密度内边距 10/14px、.sr-only 的 -1px）还是漏用令牌；除此之外应回到刻度或改用 var(--ui-space-*)',
    test: (line) => {
      const m = /(?:margin|padding|gap|font-size|border-radius)[a-z-]*\s*:\s*([^;]+)/.exec(line)
      if (!m) return false
      const SCALE = new Set([0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64])
      const EXCEPTIONS = new Set([-1, 1, 2, 3, 10, 14]) // 受控例外：1–3px 微调、表格密度内边距 10/14px、.sr-only 的 -1px
      for (const v of m[1].matchAll(/(-?\d+(?:\.\d+)?)(?:px|rem)\b/g)) {
        const n = Number(v[1])
        if (!SCALE.has(n) && !EXCEPTIONS.has(n)) return true
      }
      return false
    },
  },
  {
    id: 'R14',
    severity: '高',
    title: 'outline: none 未给替代焦点样式',
    scope: 'style',
    suggestion: '改为 :focus-visible { box-shadow: var(--ui-shadow-focus) }，否则键盘用户失去位置感',
    test: (line, ctx) => {
      if (!/outline\s*:\s*(?:none|0)\b/.test(line)) return false
      // 同一条规则块里给了 box-shadow / outline: revert 替代方案的，属于正确写法
      const block = ctx.lines.slice(ctx.i, ctx.i + 4).join(' ')
      return !/box-shadow|outline\s*:\s*(?:revert|unset|auto)/.test(block)
    },
  },
  {
    id: 'R07',
    severity: '高',
    title: '中文正文负字距',
    scope: 'style',
    suggestion: '中文正文 letter-spacing 必须为 0；负字距会让汉字互相挤压',
    re: /letter-spacing\s*:\s*-/,
  },
  {
    id: 'R06',
    severity: '高',
    title: '字体栈缺少中文回退',
    scope: 'style',
    suggestion: '西文字体在前、中文字体回退（PingFang SC / Microsoft YaHei 等），或直接用 var(--ui-font-sans)',
    test: (line) =>
      /font-family\s*:/.test(line) &&
      /sans-serif|serif|monospace/.test(line) &&
      !/PingFang|Microsoft YaHei|微软雅黑|Noto Sans CJK|Source Han|HarmonyOS|MiSans|Songti|SimSun|var\(--ui-font/.test(line),
  },
  {
    id: 'R11',
    severity: '中',
    title: '源码里出现 Emoji',
    suggestion: '用图标库或 SVG 取代；Emoji 在不同平台渲染不一致',
    re: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u,
  },
  {
    id: 'R13',
    severity: '中',
    title: '占位文案',
    suggestion: '换成可信的真实语境内容（张伟 / 市第一人民医院 之类），并标注为示例数据',
    re: /张三|李四|王五|XX公司|XX 公司|某某公司|Lorem ipsum|Acme Corp|测试数据\s*\d/,
  },
  {
    id: 'A11y',
    severity: '中',
    title: '非交互元素上绑点击',
    suggestion: '用 button / a；div 必须补 role、tabindex 与键盘事件，否则键盘不可达',
    re: /<(?:div|span|li|td)\b[^>]*\s@(?:click|mousedown)\b/,
  },
  {
    id: 'D9',
    severity: '中',
    title: 'scroll 事件驱动渲染/动画',
    suggestion: '改用 IntersectionObserver 或 CSS animation-timeline；scroll 回调会每帧触发',
    re: /addEventListener\(\s*['"]scroll['"]/,
  },
  {
    id: 'Perf',
    severity: '中',
    title: 'transition: all',
    scope: 'style',
    suggestion: '只过渡需要的属性（transform / opacity / background-color），all 会连不该动的也一起动',
    re: /transition\s*:\s*all\b/,
  },
  {
    id: 'Perf',
    severity: '低',
    title: '!important',
    scope: 'style',
    suggestion: '用 @layer 与作用域收敛；!important 会让样式不可控',
    re: /!important/,
  },
  {
    id: 'Z',
    severity: '低',
    title: 'z-index 硬编码',
    scope: 'style',
    test: (line) => /z-index\s*:\s*-?\d{2,}/.test(line) && !/var\(/.test(line),
  },
]

/** 文件级规则：整个文件维度判断 */
const FILE_RULES = [
  {
    id: 'R14',
    severity: '中',
    title: '有交互元素但整个文件没有 :focus-visible',
    suggestion: '补一条 :focus-visible 规则；这是键盘用户唯一的定位方式',
    test: (src) =>
      /<(?:button|input|select|textarea|a\s[^>]*href)/i.test(src) && !/:focus-visible/.test(src),
  },
]

const SCAN_EXT = new Set(['.vue', '.jsx', '.tsx', '.html', '.css', '.scss', '.sass', '.less', '.js', '.ts', '.mjs', '.cjs'])
const ASSET_DIRS = new Set(['assets', 'public', 'static'])
const SKIP_DIRS = new Set([
  'node_modules', 'dist', 'build', 'out', 'coverage', '.git', '.next', '.nuxt',
  '.output', '.cache', '.vite', '.turbo', '.svelte-kit', 'storybook-static',
  'vendor', '__snapshots__',
  // 打包产物目录：里面是第三方与构建结果，扫描只会产生噪声
  'release', 'win-unpacked', 'linux-unpacked', 'mac', 'tmp',
])
const TOKEN_FILE_HINT = /(^|[\\/])(tokens?|theme|variables?|var|design-system)([\\/.-]|$)|var\.scss$|tokens\.css$/i
/** 一行是不是在"定义设计令牌"（自定义属性） */
const CUSTOM_PROP_LINE = /^\s*--[\w-]+\s*:/
const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lch|lab|color)\s*\(/

/* ============================ 扫描 ============================ */
function walk(dir, scope, options) {
  let entries
  try { entries = readdirSync(dir).sort() }
  catch (error) { scope.failures.push({ path: dir, reason: error.message }); return }
  for (const name of entries) {
    const p = join(dir, name)
    let st
    try { st = lstatSync(p) }
    catch (error) { scope.failures.push({ path: p, reason: error.message }); continue }
    if (st.isSymbolicLink()) {
      scope.skipped.push({ path: p, reason: 'symbolic-link' })
    } else if (st.isDirectory()) {
      if (SKIP_DIRS.has(name) || (!options.includeAssets && ASSET_DIRS.has(name))) {
        scope.skipped.push({ path: p, reason: SKIP_DIRS.has(name) ? 'dependency-or-output' : 'assets-default-exclusion' })
      } else walk(p, scope, options)
    } else if (!SCAN_EXT.has(extname(name).toLowerCase()) || /\.min\./.test(name)) {
      scope.skipped.push({ path: p, reason: 'unsupported-extension-or-minified' })
    } else if (scope.discovered.length >= options.cap) {
      scope.truncated = true
      scope.skipped.push({ path: p, reason: 'file-cap' })
    } else scope.discovered.push(p)
  }
}

/**
 * 把 <script> 区块清空（保留行号），供"样式类"规则使用。
 * 否则 .html / .vue 里脚本文本中的 rgb(...)、!important 会被当成样式问题 —— 这是踩过的误报。
 */
function buildStyleView(lines) {
  let inScript = false
  return lines.map((line) => {
    const opens = /<script\b/i.test(line)
    const closes = /<\/script>/i.test(line)
    let out = line
    if (inScript) out = ''
    if (opens) {
      out = ''
      if (!closes) inScript = true
    }
    if (closes) inScript = false
    return out
  })
}

export function scanSource(src, rel, options = {}) {
  const isTokenFile = options.tokenFiles ? options.tokenFiles.includes(rel) : TOKEN_FILE_HINT.test(rel)
  const lines = src.split(/\r?\n/)
  const styleView = buildStyleView(lines)
  const found = []
  const excluded = []
  const ext = extname(rel).toLowerCase()

  // 正式来源可通过 tokenFiles 指定；局部变量多不能自动获得主题定义豁免。
  const tokenLines = new Set()
  for (let i = 0; i < lines.length; i++) {
    if (CUSTOM_PROP_LINE.test(lines[i]) && COLOR_RE.test(lines[i])) tokenLines.add(i)
  }
  const actsAsTokenFile = isTokenFile

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // 样式类规则看"去掉 script 之后的视图"，代码类规则看原文
    const lineForStyle = styleView[i]
    if (/ui-craft-scan-ignore/.test(line)) {
      excluded.push({ file: rel, line: i + 1, reason: 'explicit-line-ignore' })
      continue
    }
    for (const rule of RULES) {
      const isStyle = rule.scope === 'style'
      if (isStyle && !STYLE_EXT.has(ext)) continue
      const target = isStyle ? lineForStyle : line
      if (isStyle && !target) continue
      const hit = rule.re
        ? rule.re.test(target)
        : rule.test(target, { src, lines: isStyle ? styleView : lines, i, ext })
      if (!hit) continue
      const item = {
        ruleId: rule.id,
        severity: rule.severity,
        title: rule.title,
        suggestion: rule.suggestion,
        file: rel,
        line: i + 1,
        code: line.trim().slice(0, 120),
      }
      // 令牌定义属正常：颜色只允许出现在令牌里，出现在哪里不影响这个判断
      if (rule.title === '硬编码颜色' && actsAsTokenFile && tokenLines.has(i) && /^\s*--[\w-]+\s*:[^;]+;?\s*(?:\/\*.*\*\/)?\s*$/.test(line)) excluded.push({ ...item, reason: 'token-definition' })
      else found.push(item)
    }
  }

  for (const rule of FILE_RULES) {
    // 只对"自带样式"的文件生效：.css/.html 里的样式通常是外链的，在这里判断会误报
    const ownsStyles = ['.vue', '.jsx', '.tsx'].includes(ext) || /<style[\s>]/.test(src)
    if (!ownsStyles) continue
    if (rule.test(src, rel)) {
      found.push({
        ruleId: rule.id,
        severity: rule.severity,
        title: rule.title,
        suggestion: rule.suggestion,
        file: rel,
        line: 0,
        code: '(整个文件)',
      })
    }
  }
  return { found, excluded }
}

export function scanProject(rootDir, options = {}) {
  options = { includeAssets: false, cap: 20000, ...options }
  const scope = { discovered: [], skipped: [], failures: [], truncated: false }
  walk(rootDir, scope, options)
  const files = [], violations = [], excluded = []
  for (const f of scope.discovered) {
    try {
      const rel = relative(rootDir, f).replace(/\\/g, '/')
      const r = scanSource(readFileSync(f, 'utf8'), rel, options)
      files.push(f)
      violations.push(...r.found)
      excluded.push(...r.excluded)
    } catch (error) { scope.failures.push({ path: f, reason: error.message }) }
  }
  return { files, violations, excluded, ...scope, complete: !scope.truncated && !scope.failures.length && files.length > 0 }
}

/* ============================ 报告 ============================ */
function summarize(violations) {
  const byRule = new Map()
  for (const v of violations) {
    const key = `${v.ruleId}|${v.title}`
    if (!byRule.has(key)) byRule.set(key, { ...v, count: 0, files: new Set() })
    const e = byRule.get(key)
    e.count++
    e.files.add(v.file)
  }
  const order = { 高: 0, 中: 1, 低: 2 }
  return [...byRule.values()].sort(
    (a, b) => order[a.severity] - order[b.severity] || b.count - a.count,
  )
}

function toMarkdown(rootDir, result) {
  const { files, violations, excluded } = result
  const groups = summarize(violations)
  const high = violations.filter((v) => v.severity === '高').length
  const L = []
  L.push('# UI 审计报告（自动扫描）')
  L.push('')
  L.push(`扫描目录：\`${rootDir}\``)
  L.push(`扫描文件：${files.length} 个；完整：${result.complete}；截断：${result.truncated}；读取失败：${result.failures.length}`)
  L.push('规则范围：正则候选检查，非 CSS/JS 完整语义解析；命名颜色仅覆盖常见集合，布局与视觉判断需人工。')
  L.push(`排除路径：${result.skipped.length} 个；下列范围清单完整列出，不因报告明细限额而隐藏。`)
  for (const item of [...result.skipped, ...result.failures]) L.push(`- ${item.path}: ${item.reason}`)
  L.push(`已扫描：${files.map(f => relative(rootDir, f)).join('、')}`)
  L.push(`问题总数：**${violations.length}** 处（高 ${high} / 中 ${violations.filter((v) => v.severity === '中').length} / 低 ${violations.filter((v) => v.severity === '低').length}）`)
  L.push('')
  L.push('> 这是机械扫描的结果，只覆盖可正则化的部分。布局、状态完整性、文案质量仍需按')
  L.push('> `review/visual-review.md` 人工过一遍。规则含义见 `visual-dna/anti-generic.md`。')
  L.push('')

  if (!violations.length) {
    L.push('## 结论')
    L.push('')
    L.push('未发现机械可检出问题。这**不等于**通过评审，请继续跑人工清单。')
  } else {
    L.push('## 按规则汇总')
    L.push('')
    L.push('| 严重度 | 规则 | 问题 | 处数 | 涉及文件数 |')
    L.push('|---|---|---|---|---|')
    for (const g of groups) {
      L.push(`| ${g.severity} | \`${g.ruleId}\` | ${g.title} | ${g.count} | ${g.files.size} |`)
    }
    L.push('')
    L.push('## 明细（每类最多列 15 处）')
    L.push('')
    for (const g of groups) {
      const items = violations.filter((v) => v.ruleId === g.ruleId && v.title === g.title)
      L.push(`### \`${g.ruleId}\` ${g.title} · ${g.count} 处 · ${g.severity}`)
      L.push('')
      L.push(`修法：${g.suggestion}`)
      L.push('')
      L.push('| 文件 | 行 | 代码 |')
      L.push('|---|---|---|')
      for (const v of items.slice(0, 15)) {
        L.push(`| \`${v.file}\` | ${v.line || '-'} | \`${v.code.replace(/\|/g, '\\|')}\` |`)
      }
      if (items.length > 15) L.push(`| … | | 另有 ${items.length - 15} 处 |`)
      L.push('')
    }
  }

  if (excluded.length) {
    L.push('## 已排除')
    L.push('')
    L.push(`正式/候选令牌定义豁免 ${excluded.filter(e => e.reason === 'token-definition').length} 处；显式行忽略 ${excluded.filter(e => e.reason === 'explicit-line-ignore').length} 处。未用 --tokens 时按文件名判断候选来源，仍需人工核对。`)
    L.push(`涉及文件：${[...new Set(excluded.map((e) => e.file))].map((f) => '`' + f + '`').join('、')}`)
    L.push('')
  }
  return L.join('\n')
}

/* ============================ 内置样本自检 ============================ */
/**
 * 期望值由样本的"设计意图"手工确定（不是跑一遍再抄回来），
 * 因此这里能真正验证规则有没有生效、有没有误报。
 */
const SELF_TEST_EXPECT = {
  hardcodedColor: 4, // PatientList 3 + legacy 1（tokens.css 的 3 处属正常，进 excluded）
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

function keyOf(v) {
  const map = {
    '硬编码颜色': 'hardcodedColor',
    '硬编码间距/字号': 'magicNumber',
    '间距/字号偏离 4px 刻度': 'magicNumber',
    'outline: none 未给替代焦点样式': 'outlineNone',
    '中文正文负字距': 'negativeLetterSpacing',
    '字体栈缺少中文回退': 'fontStackNoCjk',
    '源码里出现 Emoji': 'emoji',
    '占位文案': 'placeholderText',
    '非交互元素上绑点击': 'clickOnNonInteractive',
    'scroll 事件驱动渲染/动画': 'scrollListener',
    'transition: all': 'transitionAll',
    '!important': 'important',
    'z-index 硬编码': 'zIndexHardcoded',
    '有交互元素但整个文件没有 :focus-visible': 'missingFocusVisible',
  }
  return map[v.title] || v.title
}

function selfTest() {
  const fixture = join(here, '__fixtures__', 'audit-sample')
  if (!existsSync(fixture)) {
    console.error(`样本目录不存在：${fixture}`)
    process.exit(2)
  }
  const result = scanProject(fixture)
  const actual = {}
  for (const v of result.violations) {
    const k = keyOf(v)
    actual[k] = (actual[k] || 0) + 1
  }
  actual.excludedTokenColors = result.excluded.filter(e => e.reason === 'token-definition').length
  actual.cleanFileViolations = result.violations.filter((v) =>
    v.file.endsWith('GoodCard.vue'),
  ).length

  let bad = 0
  console.log('ui-craft 扫描器自带样本自检')
  console.log('─'.repeat(58))
  for (const [k, want] of Object.entries(SELF_TEST_EXPECT)) {
    const got = actual[k] || 0
    const ok = got === want
    if (!ok) bad++
    console.log(`${ok ? 'ok  ' : 'FAIL'}  ${k.padEnd(24)} 期望 ${String(want).padStart(2)}  实际 ${String(got).padStart(2)}`)
  }
  console.log('─'.repeat(58))
  if (bad) {
    console.log(`结论：${bad} 项不符`)
    process.exit(1)
  }
  assert.equal(scanSource('.same { color: #ffffff; }', 'page.css').found.filter(v => v.title === '硬编码颜色').length, 1)
  assert.equal(scanSource('.same { color: oklch(50% 0.1 240); }', 'page.css').found.filter(v => v.title === '硬编码颜色').length, 1)
  assert.equal(scanSource('--local: #ffffff;', 'page.css').excluded.length, 0)
  assert.equal(scanSource('--ui-brand: #fff;', 'fixtures/tokens.css', { tokenFiles: ['ui-tokens.css'] }).excluded.length, 0)
  assert.equal(scanProject(fixture, { cap: 1 }).complete, false)
  assert.equal(scanProject(join(fixture, '__missing__')).complete, false)
  assert(SCAN_EXT.has('.mjs'))
  console.log('结论：原样本与同色硬编码、现代颜色、局部变量、非正式来源、截断/缺资源负例通过')
}

/* ============================ 入口 ============================ */
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
const argv = process.argv.slice(2)
if (argv.includes('--self-test')) {
  selfTest()
} else {
  const valueFlags = new Set(['--out', '--cap', '--tokens'])
  const positional = argv.filter((a, i) => !a.startsWith('--') && !valueFlags.has(argv[i - 1]))
  const target = positional[0]
  if (!target) {
    console.error('用法：node tools/scan-project.mjs <项目目录> [--out report.md] [--json] [--strict]')
    console.error('      node tools/scan-project.mjs --self-test')
    process.exit(2)
  }
  if (!existsSync(target)) {
    console.error(`目录不存在：${target}`)
    process.exit(2)
  }
  const capIndex = argv.indexOf('--cap')
  const cap = capIndex < 0 ? 20000 : Number(argv[capIndex + 1])
  if (!Number.isInteger(cap) || cap < 1 || cap > 20000) throw Error('--cap 必须为 1–20000')
  const tokenFiles = argv.flatMap((arg, i) => arg === '--tokens' ? [argv[i + 1]] : [])
  if (tokenFiles.some(file => !file || file.startsWith('--'))) throw Error('--tokens 缺少相对文件路径')
  const result = scanProject(target, { includeAssets: argv.includes('--include-assets'), cap, ...(tokenFiles.length ? { tokenFiles } : {}) })
  const asJson = argv.includes('--json')
  const outIdx = argv.indexOf('--out')
  const outFile = outIdx !== -1 ? argv[outIdx + 1] : null

  const payload = {
    root: target,
    scannedFiles: result.files.length,
    files: result.files,
    skipped: result.skipped,
    failures: result.failures,
    truncated: result.truncated,
    complete: result.complete,
    exclusions: result.excluded,
    ruleScope: { extensions: [...SCAN_EXT], syntax: 'line-regex', styleExtensions: [...STYLE_EXT], tokenSources: tokenFiles.length ? tokenFiles : 'filename-heuristic', namedColors: 'common-subset', visualJudgment: 'manual' },
    total: result.violations.length,
    bySeverity: {
      高: result.violations.filter((v) => v.severity === '高').length,
      中: result.violations.filter((v) => v.severity === '中').length,
      低: result.violations.filter((v) => v.severity === '低').length,
    },
    groups: summarize(result.violations).map((g) => ({
      ruleId: g.ruleId,
      title: g.title,
      severity: g.severity,
      count: g.count,
      files: g.files.size,
    })),
    violations: result.violations,
    excludedTokenColors: result.excluded.filter(e => e.reason === 'token-definition').length,
  }

  if (asJson) {
    const text = JSON.stringify(payload, null, 2)
    if (outFile) writeFileSync(outFile, text, 'utf8')
    else console.log(text)
  } else {
    const md = toMarkdown(target, result)
    if (outFile) {
      writeFileSync(outFile, md, 'utf8')
      console.log(`报告已写入 ${outFile}`)
      console.log(`扫描 ${result.files.length} 个文件，发现 ${result.violations.length} 处问题（高 ${payload.bySeverity.高}）`)
    } else {
      console.log(md)
    }
  }

  if (!result.complete) process.exitCode = 2
  else if (argv.includes('--strict') && payload.bySeverity.高 > 0) process.exitCode = 1
}
}
