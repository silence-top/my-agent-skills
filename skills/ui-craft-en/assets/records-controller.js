(() => {
  'use strict'
  const ui = window.UICraft
  const byId = id => document.getElementById(id)
  const records = [
    { id: 'SP-240618-031', name: 'Mock specimen · Gastric tissue', source: 'Endoscopy unit', time: '09:42', done: false, note: 'Verify fixation time; transport record received.' },
    { id: 'SP-240618-032', name: 'Mock specimen · Colonic tissue', source: 'Day care unit', time: '10:08', done: false, note: 'Container count matches the request; awaiting human receipt.' },
    { id: 'SP-240618-033', name: 'Mock specimen · Skin tissue', source: 'Outpatient sampling', time: '10:26', done: false, note: 'Source fields complete; check identifier before confirmation.' },
  ]
  let filter = 'all'
  let current = records[0].id
  let sequence = 34
  const selection = new Set()
  const list = byId('record-list')
  const template = byId('record-template')
  function matching() {
    const term = byId('search').value.trim().toLowerCase()
    return records.filter(record => (filter === 'all' || (filter === 'done' ? record.done : !record.done)) && `${record.id} ${record.name} ${record.source}`.toLowerCase().includes(term))
  }
  function render() {
    const state = ui.effective.state
    const rows = matching()
    const completed = records.filter(record => record.done).length
    for (const [key, value] of Object.entries({ all: records.length, pending: records.length - completed, done: completed })) {
      document.querySelectorAll(`[data-count="${key}"]`).forEach(element => { element.textContent = value })
    }
    document.querySelectorAll('[data-filter]').forEach(element => { element.setAttribute('aria-pressed', String(element.dataset.filter === filter)) })
    list.replaceChildren()
    if (state === 'normal') for (const record of rows) {
      const fragment = template.content.cloneNode(true)
      const row = fragment.firstElementChild
      row.dataset.record = record.id
      for (const node of row.querySelectorAll('[data-field]')) {
        const key = node.dataset.field
        node.textContent = key === 'status' ? (record.done ? 'Confirmed' : 'To verify') : record[key]
        if (key === 'status') node.classList.toggle('done', record.done)
      }
      for (const button of row.querySelectorAll('[data-action]')) {
        button.dataset.id = record.id
        if (button.dataset.action === 'mark') {
          button.disabled = record.done
          button.textContent = record.done ? 'Completed' : 'Mark complete'
        }
      }
      const checkbox = row.querySelector('input[type="checkbox"]')
      if (checkbox) {
        checkbox.checked = selection.has(record.id)
        checkbox.dataset.id = record.id
        checkbox.setAttribute('aria-label', `Select ${record.id}`)
      }
      list.append(fragment)
    }
    const empty = state === 'empty' || (state === 'normal' && !rows.length)
    byId('data-region').hidden = state !== 'normal' || empty
    byId('state-panel').hidden = state === 'normal' && !empty
    const descriptions = {
      loading: ['Loading mock queue', 'Review the loading state. Return to normal to restore the same data.'],
      empty: ['No matching records', 'Clear filters to restore the complete mock queue.'],
      error: ['Simulated read failure', 'Data remains on this page. Retry safely without duplicate submission.'],
      denied: ['This role cannot view the queue', 'Permission demonstration. Contact your organization administrator; this page cannot grant access.'],
    }
    const info = descriptions[empty ? 'empty' : state]
    if (info) {
      byId('state-title').textContent = info[0]
      byId('state-description').textContent = info[1]
    }
    byId('retry').hidden = state !== 'error'
    byId('clear-state').hidden = !empty
    byId('finish-loading').hidden = state !== 'loading'
    byId('result-count').textContent = state === 'normal' ? `${rows.length} results` : 'Review state'
    document.querySelectorAll('[data-requires-data]').forEach(element => { element.disabled = state !== 'normal' })
    if (byId('delete-selected')) byId('delete-selected').disabled = state !== 'normal' || selection.size === 0
    updateContext()
    ui.check()
  }
  function updateContext() {
    const record = records.find(item => item.id === current) || records[0]
    if (!record) {
      current = ''
      document.querySelectorAll('[data-current]').forEach(element => { element.textContent = 'No current record' })
      if (byId('open-current')) byId('open-current').disabled = true
      return
    }
    if (byId('open-current')) byId('open-current').disabled = ui.effective.state !== 'normal'
    current = record.id
    document.querySelectorAll('[data-current]').forEach(element => {
      const key = element.dataset.current
      element.textContent = key === 'status' ? (record.done ? 'Confirmed' : 'To verify') : record[key]
    })
  }
  function openDetail(id, trigger) {
    if (ui.effective.state !== 'normal') return
    current = id
    updateContext()
    byId('confirm-check').checked = false
    byId('complete-record').disabled = true
    const done = records.find(record => record.id === current)?.done
    byId('confirmation-area').hidden = !!done
    ui.openDialog(byId('detail-dialog'), trigger)
  }
  function mark(id) {
    const record = records.find(item => item.id === id)
    if (!record || ui.effective.state !== 'normal') return
    record.done = true
    selection.delete(id)
    render()
    ui.message(`${record.id} confirmed locally; nothing was uploaded.`)
  }
  list.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]')
    if (!button) return
    if (button.dataset.action === 'detail') openDetail(button.dataset.id, button)
    if (button.dataset.action === 'mark') {
      mark(button.dataset.id)
      list.querySelector(`[data-record="${button.dataset.id}"] [data-action="detail"]`)?.focus()
    }
  })
  list.addEventListener('change', event => {
    const input = event.target.closest('input[type="checkbox"]')
    if (!input) return
    input.checked ? selection.add(input.dataset.id) : selection.delete(input.dataset.id)
    if (byId('delete-selected')) byId('delete-selected').disabled = !selection.size
    ui.check()
  })
  byId('search').addEventListener('input', render)
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter
    render()
  }))
  function clear() {
    byId('search').value = ''
    filter = 'all'
    ui.set('state', 'normal')
    render()
    byId('search').focus()
  }
  byId('clear-search').addEventListener('click', clear)
  byId('clear-state').addEventListener('click', clear)
  byId('retry').addEventListener('click', () => ui.set('state', 'normal'))
  byId('finish-loading').addEventListener('click', () => ui.set('state', 'normal'))
  byId('confirm-check').addEventListener('change', () => {
    byId('complete-record').disabled = !byId('confirm-check').checked
    ui.check()
  })
  byId('complete-record').addEventListener('click', () => {
    if (!byId('confirm-check').checked) return
    const oldId = current
    byId('detail-dialog').close()
    mark(oldId)
    const next = list.querySelector(`[data-record="${oldId}"] [data-action="detail"]`) || list.querySelector('[data-action="detail"]') || byId('search')
    byId('detail-dialog')._returnFocus = next
    next.focus()
  })
  byId('open-current')?.addEventListener('click', event => openDetail(current, event.currentTarget))
  byId('new-record')?.addEventListener('click', () => {
    const id = `SP-240618-${String(sequence++).padStart(3, '0')}`
    records.unshift({ id, name: 'Mock specimen · New receipt', source: 'Local demonstration', time: '11:00', done: false, note: 'New local mock record; verify its source.' })
    current = id
    clear()
    list.querySelector('[data-action="detail"]')?.focus()
    ui.message('Added one local mock record.')
  })
  function requestDelete(ids, trigger) {
    if (!ids.length || ui.effective.state !== 'normal') return
    byId('delete-dialog')._ids = ids
    byId('delete-description').textContent = `Remove from this page: ${ids.join(', ')}. Reload restores the initial mock data.`
    ui.openDialog(byId('delete-dialog'), trigger)
  }
  byId('delete-selected')?.addEventListener('click', event => requestDelete([...selection], event.currentTarget))
  byId('delete-current')?.addEventListener('click', () => {
    byId('detail-dialog').close()
    requestDelete([current], byId('search'))
  })
  byId('confirm-delete')?.addEventListener('click', () => {
    for (const id of byId('delete-dialog')._ids || []) {
      const index = records.findIndex(record => record.id === id)
      if (index >= 0) records.splice(index, 1)
      selection.delete(id)
    }
    byId('delete-dialog').close()
    render()
    const target = list.querySelector('[data-action="detail"]') || byId('new-record') || byId('search')
    byId('delete-dialog')._returnFocus = target
    target.focus()
    ui.message('Removed from this page.')
  })
  byId('export-records')?.addEventListener('click', () => {
    const rows = [['id','name','source','time','status'], ...matching().map(record => [record.id,record.name,record.source,record.time,record.done ? 'confirmed' : 'pending'])]
    const csv = '\uFEFF' + rows.map(row => row.map(value => `"${String(value).replaceAll('"','""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'mock-records.csv'
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    ui.message('Generated a local CSV download of the current results.')
  })
  document.addEventListener('previewchange', render)
  render()
  if (ui.query.get('action') === 'sheet') list.querySelector('[data-action="detail"]')?.click()
  if (ui.query.get('action') === 'mark') {
    const inline = list.querySelector('[data-action="mark"]')
    if (inline) inline.click()
    else {
      list.querySelector('[data-action="detail"]')?.click()
      if (byId('detail-dialog').open) {
        byId('confirm-check').click()
        byId('complete-record').click()
      }
    }
  }
  if (ui.query.get('action') === 'cycle') {
    ui.set('state','loading')
    requestAnimationFrame(() => requestAnimationFrame(() => ui.set('state','empty')))
  }
})()
