(() => {
  const button = document.getElementById('collapse-context')
  const context = document.getElementById('context-body')
  const ui = window.UICraft
  function collapse(value) {
    context.hidden = value
    button.setAttribute('aria-expanded', String(!value))
    button.textContent = value ? 'Expand' : 'Collapse'
    ui.check()
  }
  button.addEventListener('click', () => collapse(!context.hidden))
  collapse(innerWidth < 768)
})()
