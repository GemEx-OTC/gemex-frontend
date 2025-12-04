/**
 * Robust clipboard utility that works on mobile and desktop
 * Handles various browser compatibility issues
 */

export async function copyToClipboard(text: string): Promise<boolean> {
  // Method 1: Modern Clipboard API (preferred)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.warn("Clipboard API failed, trying fallback:", err)
    }
  }

  // Method 2: Fallback using textarea (works on mobile)
  try {
    const textArea = document.createElement("textarea")
    textArea.value = text
    
    // Make it invisible and out of viewport
    textArea.style.position = "fixed"
    textArea.style.left = "-999999px"
    textArea.style.top = "-999999px"
    textArea.style.opacity = "0"
    textArea.setAttribute("readonly", "")
    
    document.body.appendChild(textArea)
    
    // For iOS
    if (navigator.userAgent.match(/ipad|iphone/i)) {
      const range = document.createRange()
      range.selectNodeContents(textArea)
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
      }
      textArea.setSelectionRange(0, text.length)
    } else {
      textArea.select()
    }
    
    const successful = document.execCommand("copy")
    document.body.removeChild(textArea)
    
    return successful
  } catch (err) {
    console.error("Fallback clipboard copy failed:", err)
    return false
  }
}
