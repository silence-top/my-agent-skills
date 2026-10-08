(() => {
  'use strict'
  const root = document.documentElement
  const brief = JSON.parse(document.getElementById('design-brief').textContent)
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
  window.addEventListener('error', event => {
    if (event instanceof ErrorEvent) errors.push(event.message)
    else if (event.target?.matches?.('script,link,img')) errors.push(`Resource error: ${event.target.src || event.target.href || 'unknown'}`)
  }, true)
  window.addEventListener('unhandledrejection', event => errors.push(String(event.reason)))
  let revision = 0
  let resultNode = document.getElementById('selfcheck-result')
  if (!resultNode) {
    resultNode = document.createElement('script')
    resultNode.type = 'application/json'
    resultNode.id = 'selfcheck-result'
    document.body.append(resultNode)
  }
  const visible = element => !!element && element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) && element.getBoundingClientRect().width > 0 && element.getBoundingClientRect().height > 0
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const context = canvas.getContext('2d', { willReadFrequently: true })
  function rgba(value) {
    if (!CSS.supports('color', value)) throw Error(`Cannot parse color ${value}`)
    context.clearRect(0, 0, 1, 1)
    context.fillStyle = value
    context.fillRect(0, 0, 1, 1)
    const color = Array.from(context.getImageData(0, 0, 1, 1).data)
    color[3] /= 255
    return color
  }
  function over(foreground, background) {
    const alpha = foreground[3] + background[3] * (1 - foreground[3])
    return [0, 1, 2].map(index => alpha ? (foreground[index] * foreground[3] + background[index] * background[3] * (1 - foreground[3])) / alpha : 0).concat(alpha)
  }
  function background(element) {
    const chain = []
    let node = element
    while (node instanceof Element) {
      chain.unshift(node)
      node = node.parentElement
    }
    let color = rgba(getComputedStyle(root).getPropertyValue('--ui-canvas').trim())
    for (const item of chain) {
      const style = getComputedStyle(item)
      if (style.backgroundImage !== 'none' || style.mixBlendMode !== 'normal' || Number(style.opacity) < 1) return null
      color = over(rgba(style.backgroundColor), color)
    }
    return color
  }
  function luminance(color) {
    return color.slice(0, 3).map(value => {
      value /= 255
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0)
  }
  function contrast(foreground, backgroundColor) {
    const foregroundLuminance = luminance(over(foreground, backgroundColor))
    const backgroundLuminance = luminance(backgroundColor)
    return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  }
  function measure() {
    const violations = []
    const unknown = []
    const ratios = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let node
    while ((node = walker.nextNode())) {
      const element = node.parentElement
      if (!node.textContent.trim() || !element || element.closest('script,style,option,textarea') || !visible(element) || element.closest(':disabled')) continue
      const range = document.createRange()
      range.selectNode(node)
      if (!Array.from(range.getClientRects()).some(rect => rect.width && rect.height)) continue
      const style = getComputedStyle(element)
      const backgroundColor = background(element)
      if (!backgroundColor) {
        unknown.push(node.textContent.trim().slice(0, 30))
        continue
      }
      const ratio = contrast(rgba(style.color), backgroundColor)
      const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && parseInt(style.fontWeight) >= 700)
      ratios.push(ratio)
      if (ratio + 0.01 < (large ? 3 : 4.5)) violations.push(`Contrast ${ratio.toFixed(2)}: ${node.textContent.trim().slice(0, 35)}`)
    }
    for (const element of document.querySelectorAll('input:not([type="checkbox"]):not([type="file"]),textarea,select')) {
      if (!visible(element) || element.disabled) continue
      const style = getComputedStyle(element)
      const backgroundColor = background(element)
      if (!backgroundColor) unknown.push(element.id || element.tagName)
      else {
        const ratio = contrast(rgba(style.color), backgroundColor)
        ratios.push(ratio)
        if (ratio < 4.5) violations.push(`Input contrast ${ratio.toFixed(2)}: ${element.id}`)
      }
    }
    const modal = document.querySelector('dialog[open]')
    const controls = [...document.querySelectorAll('button,input,select,textarea,summary,a[href],[tabindex="0"]')].filter(element => visible(element) && !element.disabled && (!modal || modal.contains(element)))
    const minimum = innerWidth < 768 ? 48 : 24
    const small = controls.filter(element => {
      const rect = element.getBoundingClientRect()
      return rect.width + 0.5 < minimum || rect.height + 0.5 < minimum
    })
    for (const element of small) violations.push(`Target smaller than ${minimum}×${minimum}: ${element.id || element.textContent.trim().slice(0, 24)}`)
    const obscured = controls.filter(element => {
      const rect = element.getBoundingClientRect()
      const x = rect.x + rect.width / 2
      const y = rect.y + rect.height / 2
      if (x < 0 || x >= innerWidth || y < 0 || y >= innerHeight) return false
      // Content beyond a scroll container is not visible yet; interaction tests scroll it into view separately.
      for (let parent = element.parentElement; parent; parent = parent.parentElement) {
        const style = getComputedStyle(parent)
        const bounds = parent.getBoundingClientRect()
        if (/(auto|scroll|hidden|clip)/.test(style.overflowY) && (y < bounds.top || y >= bounds.bottom)) return false
        if (/(auto|scroll|hidden|clip)/.test(style.overflowX) && (x < bounds.left || x >= bounds.right)) return false
      }
      const top = document.elementFromPoint(x, y)
      return top && !element.contains(top) && !top.contains(element)
    })
    for (const element of obscured) violations.push(`Control is obscured: ${element.id || element.textContent.trim().slice(0, 24)}`)
    let anchorVisible = false
    try {
      anchorVisible = visible(document.querySelector(brief.anchor.selector))
    } catch {
      violations.push('Invalid anchor selector')
    }
    const noOverflow = document.documentElement.scrollWidth <= innerWidth + 1
    const headings = document.querySelectorAll('h1').length === 1 && [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(visible).every((element, index, all) => index === 0 || Number(element.tagName[1]) <= Number(all[index - 1].tagName[1]) + 1)
    if (!anchorVisible) violations.push('Primary anchor is not visible')
    if (!noOverflow) violations.push('Page has horizontal overflow')
    if (!headings) violations.push('Heading hierarchy is incomplete')
    if (unknown.length) violations.push(`Contrast cannot be measured; manual review required: ${unknown.join(', ')}`)
    const checks = {
      anchorVisible,
      noOverflow,
      targets: !small.length && !obscured.length,
      contrast: !!ratios.length && !unknown.length && !violations.some(value => value.includes('Contrast')),
      headings,
    }
    return {
      schemaVersion: 1,
      status: errors.length || violations.length ? 'fail' : 'ok',
      errors: [...errors],
      violations,
      checks,
      metrics: { minContrast: ratios.length ? Number(Math.min(...ratios).toFixed(2)) : null, textSamples: ratios.length, controls: controls.length, unknown },
      effective: { ...effective },
      viewport: { width: innerWidth, height: innerHeight },
      revision,
      manual: ['Composition and anchor strength', 'Personality, scale, and rhythm', 'Real-device safe area and soft keyboard'],
      briefId: brief.id,
    }
  }
  async function check() {
    const current = ++revision
    resultNode.textContent = JSON.stringify({ schemaVersion: 1, status: 'pending', revision })
    try {
      await document.fonts.ready
      await Promise.all(document.getAnimations().filter(animation => animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {})))
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      if (current !== revision) return
      const result = measure()
      resultNode.textContent = JSON.stringify(result)
      const status = document.getElementById('engineering-result')
      if (status) status.textContent = result.status === 'ok' ? 'Measured checks passed; visual review remains manual.' : result.violations.concat(result.errors).join('; ')
      if (parent !== window) parent.postMessage({ protocol: 'ui-craft', version: 1, pageId: brief.id, type: 'report', result, brief }, '*')
    } catch (error) {
      errors.push(String(error))
      resultNode.textContent = JSON.stringify({ schemaVersion: 1, status: 'fail', errors: [...errors], violations: ['Measurement failed'] })
    }
  }
  function set(key, value) {
    const allowed = { theme: ['light','dark'], state: capabilities.states, density: capabilities.densities, motion: capabilities.motion ? ['on','off'] : [], safe: ['on','off'] }
    if (!allowed[key]?.includes(value)) return
    effective[key] = value
    root.dataset[key] = value
    document.querySelectorAll(`[data-review="${key}"]`).forEach(element => { element.value = value })
    document.dispatchEvent(new CustomEvent('previewchange', { detail: { key, value } }))
    check()
  }
  function message(text) {
    const live = document.getElementById('live-message')
    if (live) live.textContent = text
    check()
  }
  function openDialog(dialog, trigger = document.activeElement) {
    if (dialog.open) return
    dialog._returnFocus = trigger
    dialog.showModal()
    check()
  }
  for (const dialog of document.querySelectorAll('dialog')) {
    dialog.addEventListener('close', () => {
      if (dialog._returnFocus?.isConnected) dialog._returnFocus.focus()
      check()
    })
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return
      const nodes = [...dialog.querySelectorAll('button,input,select,textarea,a[href],[tabindex="0"]')].filter(element => visible(element) && !element.disabled)
      if (!nodes.length) {
        event.preventDefault()
        return
      }
      const first = nodes[0]
      const last = nodes.at(-1)
      if (event.shiftKey && (document.activeElement === first || !nodes.includes(document.activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    })
    dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dialog.close()))
  }
  const notes = document.createElement('details')
  notes.className = 'design-notes'
  notes.id = 'design-notes'
  notes.open = query.get('demo') === '1'
  const summary = document.createElement('summary')
  summary.textContent = 'Design decisions, checks and controls'
  notes.append(summary)
  const list = document.createElement('dl')
  for (const [label, value] of [
    ['Task', brief.task],
    ['Composition / Personality', `${brief.composition} / ${brief.personalities.join(' + ')}`],
    ['Anchor', brief.anchor.reason],
    ['Mobile', brief.mobile.strategy],
    ['Refinement', `${brief.refinement.before} → ${brief.refinement.after}; ${brief.refinement.reason}`],
  ]) {
    const term = document.createElement('dt')
    const description = document.createElement('dd')
    term.textContent = label
    description.textContent = value
    list.append(term, description)
  }
  notes.append(list)
  const review = document.createElement('div')
  review.className = 'review-controls'
  for (const [key, values] of Object.entries({ theme: ['light','dark'], state: capabilities.states, density: capabilities.densities, motion: capabilities.motion ? ['on','off'] : [], safe: ['off','on'] })) {
    if (!values.length) continue
    const label = document.createElement('label')
    const select = document.createElement('select')
    label.append(key === 'safe' ? 'Simulated safe area' : key)
    select.dataset.review = key
    select.id = `review-${key}`
    for (const value of values) {
      const option = document.createElement('option')
      option.value = option.textContent = value
      select.append(option)
    }
    select.value = effective[key]
    select.addEventListener('change', () => set(key, select.value))
    label.append(select)
    review.append(label)
  }
  notes.append(review)
  const status = document.createElement('p')
  status.id = 'engineering-result'
  status.textContent = 'Pending measurement'
  notes.append(status)
  notes.addEventListener('toggle', check)
  document.querySelector('[data-notes]')?.append(notes)
  window.UICraft = { brief, effective, query, check, set, message, openDialog, visible, rgba, contrast }
  window.addEventListener('resize', check)
  window.addEventListener('load', check)
})()
