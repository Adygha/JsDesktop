const HTML_TAG_DTOP_ICON = 'js-dtop-icon' // Desktop's HTML tag name

export default class DesktopIcon extends HTMLElement {
  constructor () {
    super()
  }
}

window.customElements.define(HTML_TAG_DTOP_ICON, DesktopIcon)
