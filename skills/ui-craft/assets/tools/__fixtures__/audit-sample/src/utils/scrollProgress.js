// scroll 事件驱动：1 处
export function initScrollProgress() {
  window.addEventListener('scroll', () => {
    document.body.dataset.progress = String(window.scrollY)
  })
}
