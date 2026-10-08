(() => {
  const button = document.getElementById('collapse-context')
  const context = document.getElementById('context-body')
  const ui = window.UICraft
  function collapse(value) {
    context.hidden = value
    button.setAttribute('aria-expanded', String(!value))
    button.textContent = value ? ui.t('展开', 'Expand') : ui.t('收起', 'Collapse')
    ui.check()
  }
  button.addEventListener('click', () => collapse(!context.hidden))
  collapse(innerWidth < 768)
})()
