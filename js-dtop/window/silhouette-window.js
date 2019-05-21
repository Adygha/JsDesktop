const DTOP_PATH = 'js-dtop/'
const SILH_WIN_CSS_PATH = DTOP_PATH + 'css/silhouette-window.css'
const HTML_TAG_SILH_WIN = 'js-dtop-silhouette-window' // The HTML tag for the silhouette window

/**
 * A class that represents a silhouette window to show when an actual window is moved/re-sized.
 */
export default class SilhouetteWindow extends HTMLElement {

  /**
   * Constructor that takes the actual window to make a silhouette of as a
   * parameter (made just to handle the size and position easily).
   * @param {Window} windowToSilhouette  the actual window to make a silhouette of
   */
  constructor (windowToSilhouette) {
    super()
    this.windowLeft = windowToSilhouette.windowLeft
    this.windowTop = windowToSilhouette.windowTop
    this.windowWidth = windowToSilhouette.windowWidth
    this.windowHeight = windowToSilhouette.windowHeight
    this.style.zIndex = windowToSilhouette.windowZIndex + 1
    this._origWindow = windowToSilhouette
  }

  connectedCallback () {
    let tmpStyle = document.querySelector('link[rel="stylesheet"][href="' + SILH_WIN_CSS_PATH + '"]')
    if (!tmpStyle) {
      tmpStyle = document.createElement('link')
      tmpStyle.setAttribute('rel', 'stylesheet')
      tmpStyle.setAttribute('href', SILH_WIN_CSS_PATH)
      document.head.appendChild(tmpStyle)
    }
  }

  /**
   * The silhouette window's left.
   * @type {Number}
   */
  get windowLeft () {
    return parseInt(this.style.left, 10)
  }

  /**
   * The silhouette window's left.
   * @type {Number}
   */
  set windowLeft (newLeft) {
    this.style.left = newLeft + 'px'
  }

  /**
   * The silhouette window's top.
   * @type {Number}
   */
  get windowTop () {
    return parseInt(this.style.top, 10)
  }

  /**
   * The silhouette window's top.
   * @type {Number}
   */
  set windowTop (newTop) {
    this.style.top = newTop + 'px'
  }

  /**
   * The silhouette window's width.
   * @type {Number}
   */
  get windowWidth () {
    return parseInt(this.style.width, 10)
  }

  /**
   * The silhouette window's width.
   * @type {Number}
   */
  set windowWidth (newWidth) {
    this.style.width = newWidth + 'px'
  }

  /**
   * The silhouette window's height.
   * @type {Number}
   */
  get windowHeight () {
    return parseInt(this.style.height, 10)
  }

  /**
   * The silhouette window's height.
   * @type {Number}
   */
  set windowHeight (newHeight) {
    this.style.height = newHeight + 'px'
  }

  /**
   * The original window that this silhouette window object imitates.
   * @readonly
   * @type {Window}
   */
  get originalWindow () {
    return this._origWindow
  }
}

window.customElements.define(HTML_TAG_SILH_WIN, SilhouetteWindow)
