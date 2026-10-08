// One scroll-driven listener.
export function initScrollProgress() {
  window.addEventListener('scroll', () => {
    document.body.dataset.progress = String(window.scrollY)
  })
}
