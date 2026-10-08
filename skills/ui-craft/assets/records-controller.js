(() => {
  'use strict'
  const ui = window.UICraft, t = ui.t, $ = id => document.getElementById(id)
  const records = [
    { id: 'SP-240618-031', name: t('模拟标本 · 胃窦组织','Mock specimen · Gastric tissue'), source: t('消化内镜中心','Endoscopy unit'), time: '09:42', done: false, note: t('固定时间待核对；转运记录已到达。','Verify fixation time; transport record received.') },
    { id: 'SP-240618-032', name: t('模拟标本 · 结肠组织','Mock specimen · Colonic tissue'), source: t('日间诊疗中心','Day care unit'), time: '10:08', done: false, note: t('容器数量与申请单一致；等待人工接收。','Container count matches the request; awaiting human receipt.') },
    { id: 'SP-240618-033', name: t('模拟标本 · 皮肤组织','Mock specimen · Skin tissue'), source: t('门诊采样室','Outpatient sampling'), time: '10:26', done: false, note: t('来源字段完整；核对标识后确认。','Source fields complete; check identifier before confirmation.') },
  ]
  let filter = 'all', current = records[0].id, sequence = 34
  const selection = new Set()
  const list = $('record-list'), template = $('record-template')
  function matching() {
    const term = $('search').value.trim().toLowerCase()
    return records.filter(r => (filter === 'all' || (filter === 'done' ? r.done : !r.done)) && `${r.id} ${r.name} ${r.source}`.toLowerCase().includes(term))
  }
  function render() {
    const state = ui.effective.state, rows = matching()
    const completed = records.filter(r => r.done).length
    for (const [key, value] of Object.entries({ all: records.length, pending: records.length - completed, done: completed })) {
      document.querySelectorAll(`[data-count="${key}"]`).forEach(el => { el.textContent = value })
    }
    document.querySelectorAll('[data-filter]').forEach(el => { el.setAttribute('aria-pressed', String(el.dataset.filter === filter)) })
    list.replaceChildren()
    if (state === 'normal') for (const record of rows) {
      const fragment = template.content.cloneNode(true), row = fragment.firstElementChild
      row.dataset.record = record.id
      for (const node of row.querySelectorAll('[data-field]')) {
        const key = node.dataset.field
        node.textContent = key === 'status' ? (record.done ? t('已确认','Confirmed') : t('待核对','To verify')) : record[key]
        if (key === 'status') node.classList.toggle('done', record.done)
      }
      for (const button of row.querySelectorAll('[data-action]')) {
        button.dataset.id = record.id
        if (button.dataset.action === 'mark') { button.disabled = record.done; button.textContent = record.done ? t('已完成','Completed') : t('标记完成','Mark complete') }
      }
      const checkbox = row.querySelector('input[type="checkbox"]')
      if (checkbox) { checkbox.checked = selection.has(record.id); checkbox.dataset.id = record.id; checkbox.setAttribute('aria-label', `${t('选择','Select')} ${record.id}`) }
      list.append(fragment)
    }
    const empty = state === 'empty' || (state === 'normal' && !rows.length)
    $('data-region').hidden = state !== 'normal' || empty
    $('state-panel').hidden = state === 'normal' && !empty
    const descriptions = {
      loading: [t('正在读取模拟队列','Loading mock queue'), t('评审加载态。返回正常后会恢复同一份数据。','Review loading state. Return to normal to restore the same data.')],
      empty: [t('没有匹配记录','No matching records'), t('清除筛选，回到完整模拟队列。','Clear filters to restore the mock queue.')],
      error: [t('模拟读取失败','Simulated read failure'), t('数据仍保留在本页。重试可恢复，不会重复提交。','Data is retained on this page. Retry safely without duplicate submission.')],
      denied: [t('当前角色无权查看','This role cannot view the queue'), t('权限演示，不支持在此提权。请联系机构管理员核实访问范围。','Permission demonstration. Contact your organization administrator; this page cannot grant access.')],
    }
    const info = descriptions[empty ? 'empty' : state]
    if (info) { $('state-title').textContent = info[0]; $('state-description').textContent = info[1] }
    $('retry').hidden = state !== 'error'
    $('clear-state').hidden = !empty
    $('finish-loading').hidden = state !== 'loading'
    $('result-count').textContent = state === 'normal' ? `${rows.length} ${t('条结果','results')}` : t('当前为评审状态','Review state')
    document.querySelectorAll('[data-requires-data]').forEach(el => { el.disabled = state !== 'normal' })
    if ($('delete-selected')) $('delete-selected').disabled = state !== 'normal' || selection.size === 0
    updateContext()
    ui.check()
  }
  function updateContext() {
    const record = records.find(r => r.id === current) || records[0]
    if (!record) {
      current = ''
      document.querySelectorAll('[data-current]').forEach(el => { el.textContent = t('无当前记录','No current record') })
      if ($('open-current')) $('open-current').disabled = true
      return
    }
    if ($('open-current')) $('open-current').disabled = ui.effective.state !== 'normal'
    current = record.id
    document.querySelectorAll('[data-current]').forEach(el => { const key = el.dataset.current; el.textContent = key === 'status' ? (record.done ? t('已确认','Confirmed') : t('待核对','To verify')) : record[key] })
  }
  function openDetail(id, trigger) {
    if (ui.effective.state !== 'normal') return
    current = id; updateContext(); $('confirm-check').checked = false
    $('complete-record').disabled = true
    const done = records.find(r => r.id === current)?.done
    $('confirmation-area').hidden = !!done
    ui.openDialog($('detail-dialog'), trigger)
  }
  function mark(id) {
    const record = records.find(r => r.id === id)
    if (!record || ui.effective.state !== 'normal') return
    record.done = true; selection.delete(id); render()
    ui.message(`${record.id} ${t('已在本页确认；未上传任何数据。','confirmed locally; nothing was uploaded.')}`)
  }
  list.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]')
    if (!button) return
    if (button.dataset.action === 'detail') openDetail(button.dataset.id, button)
    if (button.dataset.action === 'mark') { mark(button.dataset.id); list.querySelector(`[data-record="${button.dataset.id}"] [data-action="detail"]`)?.focus() }
  })
  list.addEventListener('change', event => {
    const input = event.target.closest('input[type="checkbox"]')
    if (!input) return
    input.checked ? selection.add(input.dataset.id) : selection.delete(input.dataset.id)
    if ($('delete-selected')) $('delete-selected').disabled = !selection.size
    ui.check()
  })
  $('search').addEventListener('input', render)
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { filter = button.dataset.filter; render() }))
  function clear() { $('search').value = ''; filter = 'all'; ui.set('state', 'normal'); render(); $('search').focus() }
  $('clear-search').addEventListener('click', clear); $('clear-state').addEventListener('click', clear)
  $('retry').addEventListener('click', () => ui.set('state', 'normal'))
  $('finish-loading').addEventListener('click', () => ui.set('state', 'normal'))
  $('confirm-check').addEventListener('change', () => { $('complete-record').disabled = !$('confirm-check').checked; ui.check() })
  $('complete-record').addEventListener('click', () => {
    if (!$('confirm-check').checked) return
    const oldId = current
    $('detail-dialog').close(); mark(oldId)
    const next = list.querySelector(`[data-record="${oldId}"] [data-action="detail"]`) || list.querySelector('[data-action="detail"]') || $('search')
    $('detail-dialog')._returnFocus = next; next.focus()
  })
  $('open-current')?.addEventListener('click', event => openDetail(current, event.currentTarget))
  $('new-record')?.addEventListener('click', () => {
    const id = `SP-240618-${String(sequence++).padStart(3, '0')}`
    records.unshift({ id, name: t('模拟标本 · 新建接收记录','Mock specimen · New receipt'), source: t('本地演示录入','Local demonstration'), time: '11:00', done: false, note: t('本地新建模拟记录；请核对来源。','New local mock record; verify its source.') })
    current = id; clear(); list.querySelector('[data-action="detail"]')?.focus(); ui.message(t('已添加一条本地模拟记录。','Added one local mock record.'))
  })
  function requestDelete(ids, trigger) {
    if (!ids.length || ui.effective.state !== 'normal') return
    $('delete-dialog')._ids = ids
    $('delete-description').textContent = `${t('将从本页删除','Remove from this page:')} ${ids.join('、')}。${t('刷新可恢复初始模拟数据。','Reload restores the initial mock data.')}`
    ui.openDialog($('delete-dialog'), trigger)
  }
  $('delete-selected')?.addEventListener('click', event => requestDelete([...selection], event.currentTarget))
  $('delete-current')?.addEventListener('click', event => { $('detail-dialog').close(); requestDelete([current], $('search')) })
  $('confirm-delete')?.addEventListener('click', () => {
    for (const id of $('delete-dialog')._ids || []) { const index = records.findIndex(r => r.id === id); if (index >= 0) records.splice(index, 1); selection.delete(id) }
    $('delete-dialog').close(); render()
    const target = list.querySelector('[data-action="detail"]') || $('new-record') || $('search')
    $('delete-dialog')._returnFocus = target; target.focus(); ui.message(t('已从本页删除。','Removed from this page.'))
  })
  $('export-records')?.addEventListener('click', () => {
    const rows = [['id','name','source','time','status'], ...matching().map(r => [r.id,r.name,r.source,r.time,r.done ? 'confirmed' : 'pending'])]
    const csv = '\uFEFF' + rows.map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a'); a.href = url; a.download = 'mock-records.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
    ui.message(t('已生成当前结果的本地 CSV 下载。','Generated a local CSV download of the current results.'))
  })
  document.addEventListener('previewchange', render)
  render()
  if (ui.query.get('action') === 'sheet') list.querySelector('[data-action="detail"]')?.click()
  if (ui.query.get('action') === 'mark') {
    const inline = list.querySelector('[data-action="mark"]')
    if (inline) inline.click()
    else {
      list.querySelector('[data-action="detail"]')?.click()
      if ($('detail-dialog').open) { $('confirm-check').click(); $('complete-record').click() }
    }
  }
  if (ui.query.get('action') === 'cycle') { ui.set('state','loading'); requestAnimationFrame(() => requestAnimationFrame(() => ui.set('state','empty'))) }
})()
