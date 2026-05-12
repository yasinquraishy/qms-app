import { ref, onScopeDispose } from 'vue'

// Resize state is kept outside Vue's reactivity for the high-frequency path
// (pointermove). Only the committed value and the `isResizing` flag are
// reactive. Pointer moves are coalesced to one update per animation frame to
// keep the editor responsive on slower devices.
export function useImageResize({
  onPreview,
  onCommit,
  getNaturalSize,
  minWidth = 80,
  maxWidth = 1200,
} = {}) {
  const isResizing = ref(false)

  let startX = 0
  let startWidth = 0
  let aspectRatio = 1
  let direction = null
  let mode = 'aspect' // 'aspect' | 'free' (Shift)
  let rafId = null
  let pendingWidth = 0
  let pendingHeight = null

  function start(event, dir, imgEl) {
    if (!imgEl) return
    event.preventDefault()
    event.stopPropagation()

    direction = dir
    mode = event.shiftKey ? 'free' : 'aspect'
    startX = event.clientX

    const rect = imgEl.getBoundingClientRect()
    startWidth = rect.width
    aspectRatio = rect.height > 0 ? rect.width / rect.height : 1

    // Try natural size for upscaling guard, falls back to maxWidth.
    const natural = getNaturalSize?.() || { width: maxWidth }
    const cap = Math.min(maxWidth, Math.max(natural.width || maxWidth, startWidth))

    isResizing.value = true

    function handleMove(ev) {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        let dx = ev.clientX - startX
        if (direction === 'w' || direction === 'sw') dx = -dx
        const next = clamp(Math.round(startWidth + dx), minWidth, cap)
        pendingWidth = next
        pendingHeight = mode === 'aspect' ? Math.round(next / aspectRatio) : null
        onPreview?.(pendingWidth, pendingHeight)
      })
    }

    function handleUp() {
      cleanup()
      isResizing.value = false
      if (pendingWidth) onCommit?.(pendingWidth, pendingHeight)
    }

    function handleCancel() {
      cleanup()
      isResizing.value = false
      onPreview?.(null, null) // restore stored width
    }

    function cleanup() {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = null
      document.removeEventListener('pointermove', handleMove)
      document.removeEventListener('pointerup', handleUp)
      document.removeEventListener('pointercancel', handleCancel)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('pointermove', handleMove, { passive: true })
    document.addEventListener('pointerup', handleUp, { once: true })
    document.addEventListener('pointercancel', handleCancel, { once: true })

    document.body.style.cursor = cursorForDir(dir)
    // Prevent accidental text selection / native image drag while dragging.
    document.body.style.userSelect = 'none'
  }

  onScopeDispose(() => {
    if (rafId) cancelAnimationFrame(rafId)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  })

  return { isResizing, start }
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

function cursorForDir(dir) {
  if (dir === 'e' || dir === 'w') return 'ew-resize'
  if (dir === 'se' || dir === 'nw') return 'nwse-resize'
  return 'nesw-resize'
}
