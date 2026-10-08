(() => {
  'use strict'
  const root = document.documentElement
  const brief = JSON.parse(document.getElementById('design-brief').textContent)
  const en = root.lang.startsWith('en')
  const t = (zh, english) => en ? english : zh
  const query = new URLSearchParams(location.search)
  const embedded = document.getElementById('preview-config')
  if (embedded) for (const [key, value] of Object.entries(JSON.parse(embedded.textContent))) query.set(key, String(value))
  const capabilities = brief.capabilities
  const pick = (key, values, fallback) => values.includes(query.get(key)) ? query.get(key) : fallback
  const effective = {
    theme: pick('theme', ['light', 'dark'], 'light'),
    state: pick('state', capabilities.states, 'normal'),
    density: pick('density', capabilities.densities, capabilities.densities.includes('default') ? 'default' : capabilities.densities.includes('balanced') ? 'balanced' : capabilities.densities[0] || 'none'),
    motion: capabilities.motion ? pick('motion', ['on', 'off'], 'on') : 'none',
    safe: pick('safe', ['on', 'off'], 'off'),
  }
  Object.assign(root.dataset, effective)
  const errors = []
  window.addEventListener('error', e => {
    if (e instanceof ErrorEvent) errors.push(e.message)
    else if (e.target?.matches?.('script,link,img')) errors.push(`资源错误：${e.target.src || e.target.href || 'unknown'}`)
  }, true)
  window.addEventListener('unhandledrejection', e => errors.push(String(e.reason)))
  let revision = 0
  let resultNode = document.getElementById('selfcheck-result')
  if (!resultNode) { resultNode = document.createElement('script'); resultNode.type = 'application/json'; resultNode.id = 'selfcheck-result'; document.body.append(resultNode) }
  const visible = el => !!el && el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  function rgba(value) {
    if (!CSS.supports('color', value)) throw Error(`无法解析颜色 ${value}`)
    ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = value; ctx.fillRect(0, 0, 1, 1)
    const c = Array.from(ctx.getImageData(0, 0, 1, 1).data); c[3] /= 255; return c
  }
  function over(fg, bg) {
    const a = fg[3] + bg[3] * (1 - fg[3])
    return [0, 1, 2].map(i => a ? (fg[i] * fg[3] + bg[i] * bg[3] * (1 - fg[3])) / a : 0).concat(a)
  }
  function background(el) {
    const chain = []; let node = el
    while (node instanceof Element) { chain.unshift(node); node = node.parentElement }
    let color = rgba(getComputedStyle(root).getPropertyValue('--ui-canvas').trim())
    for (const item of chain) {
      const style = getComputedStyle(item)
      if (style.backgroundImage !== 'none' || style.mixBlendMode !== 'normal' || Number(style.opacity) < 1) return null
      color = over(rgba(style.backgroundColor), color)
    }
    return color
  }
  function luminance(c) { return c.slice(0, 3).map(v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }).reduce((n, v, i) => n + v * [0.2126, 0.7152, 0.0722][i], 0) }
  function contrast(fg, bg) { const a = luminance(over(fg, bg)); const b = luminance(bg); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) }
  function measure() {
    const violations = [], unknown = [], ratios = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let node
    while ((node = walker.nextNode())) {
      const el = node.parentElement
      if (!node.textContent.trim() || !el || el.closest('script,style,option,textarea') || !visible(el) || el.closest(':disabled')) continue
      const range = document.createRange(); range.selectNode(node)
      if (!Array.from(range.getClientRects()).some(r => r.width && r.height)) continue
      const style = getComputedStyle(el), bg = background(el)
      if (!bg) { unknown.push(node.textContent.trim().slice(0, 30)); continue }
      const ratio = contrast(rgba(style.color), bg)
      const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && parseInt(style.fontWeight) >= 700)
      ratios.push(ratio)
      if (ratio + 0.01 < (large ? 3 : 4.5)) violations.push(`对比度 ${ratio.toFixed(2)}：${node.textContent.trim().slice(0, 35)}`)
    }
    for (const el of document.querySelectorAll('input:not([type="checkbox"]):not([type="file"]),textarea,select')) {
      if (!visible(el) || el.disabled) continue
      const style = getComputedStyle(el), bg = background(el)
      if (!bg) unknown.push(el.id || el.tagName)
      else { const ratio = contrast(rgba(style.color), bg); ratios.push(ratio); if (ratio < 4.5) violations.push(`输入对比度 ${ratio.toFixed(2)}：${el.id}`) }
    }
    const modal = document.querySelector('dialog[open]')
    const controls = [...document.querySelectorAll('button,input,select,textarea,summary,a[href],[tabindex="0"]')].filter(el => visible(el) && !el.disabled && (!modal || modal.contains(el)))
    const min = innerWidth < 768 ? 48 : 24
    const small = controls.filter(el => { const r = el.getBoundingClientRect(); return r.width + 0.5 < min || r.height + 0.5 < min })
    for (const el of small) violations.push(`命中区小于 ${min}×${min}：${el.id || el.textContent.trim().slice(0, 24)}`)
    const obscured = controls.filter(el => {
      const r = el.getBoundingClientRect(), x = r.x + r.width / 2, y = r.y + r.height / 2
      if (x < 0 || x >= innerWidth || y < 0 || y >= innerHeight) return false
      // 滚动容器以外的部分尚未进入可见区；交互测试另行滚入后验证可达性。
      for (let parent = el.parentElement; parent; parent = parent.parentElement) {
        const style = getComputedStyle(parent), bounds = parent.getBoundingClientRect()
        if (/(auto|scroll|hidden|clip)/.test(style.overflowY) && (y < bounds.top || y >= bounds.bottom)) return false
        if (/(auto|scroll|hidden|clip)/.test(style.overflowX) && (x < bounds.left || x >= bounds.right)) return false
      }
      const top = document.elementFromPoint(x, y)
      return top && !el.contains(top) && !top.contains(el)
    })
    for (const el of obscured) violations.push(`操作被遮挡：${el.id || el.textContent.trim().slice(0, 24)}`)
    let anchorVisible = false
    try { anchorVisible = visible(document.querySelector(brief.anchor.selector)) } catch { violations.push('无效锚点选择器') }
    const noOverflow = document.documentElement.scrollWidth <= innerWidth + 1
    const headings = document.querySelectorAll('h1').length === 1 && [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(visible).every((el, i, all) => i === 0 || Number(el.tagName[1]) <= Number(all[i - 1].tagName[1]) + 1)
    if (!anchorVisible) violations.push('主锚点不可见')
    if (!noOverflow) violations.push('页面横向溢出')
    if (!headings) violations.push('标题层级不完整')
    if (unknown.length) violations.push(`对比度不可测，需要人工确认：${unknown.join('、')}`)
    const checks = { anchorVisible, noOverflow, targets: !small.length && !obscured.length, contrast: !!ratios.length && !unknown.length && !violations.some(v => v.includes('对比度')), headings }
    return { schemaVersion: 1, status: errors.length || violations.length ? 'fail' : 'ok', errors: [...errors], violations, checks,
      metrics: { minContrast: ratios.length ? Number(Math.min(...ratios).toFixed(2)) : null, textSamples: ratios.length, controls: controls.length, unknown },
      effective: { ...effective }, viewport: { width: innerWidth, height: innerHeight }, revision,
      manual: ['构图与锚点强弱', '人格、尺度与节奏', '真机安全区与软键盘'], briefId: brief.id }
  }
  async function check() {
    const current = ++revision
    resultNode.textContent = JSON.stringify({ schemaVersion: 1, status: 'pending', revision })
    try {
      await document.fonts.ready
      await Promise.all(document.getAnimations().filter(a => a.effect?.getTiming().iterations !== Infinity).map(a => a.finished.catch(() => {})))
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      if (current !== revision) return
      const result = measure()
      resultNode.textContent = JSON.stringify(result)
      const status = document.getElementById('engineering-result')
      if (status) status.textContent = result.status === 'ok' ? t('自动测量通过；视觉待人工确认。', 'Measured checks passed; visual review remains manual.') : result.violations.concat(result.errors).join('；')
      if (parent !== window) parent.postMessage({ protocol: 'ui-craft', version: 1, pageId: brief.id, type: 'report', result, brief }, '*')
    } catch (e) {
      errors.push(String(e)); resultNode.textContent = JSON.stringify({ schemaVersion: 1, status: 'fail', errors: [...errors], violations: ['测量异常'] })
    }
  }
  function set(key, value) {
    const allowed = { theme: ['light','dark'], state: capabilities.states, density: capabilities.densities, motion: capabilities.motion ? ['on','off'] : [], safe: ['on','off'] }
    if (!allowed[key]?.includes(value)) return
    effective[key] = value; root.dataset[key] = value
    document.querySelectorAll(`[data-review="${key}"]`).forEach(el => { el.value = value })
    document.dispatchEvent(new CustomEvent('previewchange', { detail: { key, value } })); check()
  }
  function message(text) { const live = document.getElementById('live-message'); if (live) live.textContent = text; check() }
  function openDialog(dialog, trigger = document.activeElement) {
    if (dialog.open) return
    dialog._returnFocus = trigger; dialog.showModal(); check()
  }
  for (const dialog of document.querySelectorAll('dialog')) {
    dialog.addEventListener('close', () => { if (dialog._returnFocus?.isConnected) dialog._returnFocus.focus(); check() })
    dialog.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return
      const nodes = [...dialog.querySelectorAll('button,input,select,textarea,a[href],[tabindex="0"]')].filter(el => visible(el) && !el.disabled)
      if (!nodes.length) { e.preventDefault(); return }
      const first = nodes[0], last = nodes.at(-1)
      if (e.shiftKey && (document.activeElement === first || !nodes.includes(document.activeElement))) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    })
    dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dialog.close()))
  }
  const notes = document.createElement('details'); notes.className = 'design-notes'; notes.id = 'design-notes'; notes.open = query.get('demo') === '1'
  const summary = document.createElement('summary'); summary.textContent = t('设计决策与检查 / 评审开关', 'Design decisions, checks and controls'); notes.append(summary)
  const list = document.createElement('dl')
  for (const [label, value] of [[t('主任务','Task'), brief.task], ['Composition / Personality', `${brief.composition} / ${brief.personalities.join(' + ')}`], [t('主锚点','Anchor'), brief.anchor.reason], [t('移动策略','Mobile'), brief.mobile.strategy], [t('第二轮修订','Refinement'), `${brief.refinement.before} → ${brief.refinement.after}；${brief.refinement.reason}`]]) {
    const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = label; dd.textContent = value; list.append(dt, dd)
  }
  notes.append(list)
  const review = document.createElement('div'); review.className = 'review-controls'
  for (const [key, values] of Object.entries({ theme: ['light','dark'], state: capabilities.states, density: capabilities.densities, motion: capabilities.motion ? ['on','off'] : [], safe: ['off','on'] })) {
    if (!values.length) continue
    const label = document.createElement('label'), select = document.createElement('select')
    label.append(key === 'safe' ? t('模拟安全区','Simulated safe area') : key)
    select.dataset.review = key; select.id = `review-${key}`
    for (const value of values) { const option = document.createElement('option'); option.value = option.textContent = value; select.append(option) }
    select.value = effective[key]; select.addEventListener('change', () => set(key, select.value)); label.append(select); review.append(label)
  }
  notes.append(review)
  const status = document.createElement('p'); status.id = 'engineering-result'; status.textContent = t('待测量', 'Pending measurement'); notes.append(status)
  notes.addEventListener('toggle', check)
  document.querySelector('[data-notes]')?.append(notes)
  window.UICraft = { brief, effective, query, check, set, message, openDialog, visible, rgba, contrast, t }
  window.addEventListener('resize', check)
  window.addEventListener('load', check)
})()
