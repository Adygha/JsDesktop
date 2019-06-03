import {CONF_CONSTS} from '../config-storage.js'

const SILH_WIN_CSS_PATH = CONF_CONSTS.DTOP_PATH + 'css/silhouette-window.css'
const HTML_TAG_SILH_WIN = 'js-dtop-silhouette-window' // The HTML tag for the silhouette window
const BIT_FLAG = {LEFT: 1, TOP: 2, WIDTH: 4, HEIGHT: 8} // Used to indicate if the 'SilhouetteWindow' rect is changed (and which part is changed)

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
    this._bitFlag = 0 // Used to indicate if this object's rect is changed and which part is changed (to avoid unnecessary move/resize)
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

  makeOriginalMatchSilhouette () {
    if ((this._bitFlag & BIT_FLAG.LEFT) === BIT_FLAG.LEFT) {
      this._origWindow.windowLeft = this.windowLeft
    }
    if ((this._bitFlag & BIT_FLAG.TOP) === BIT_FLAG.TOP) {
      this._origWindow.windowTop = this.windowTop
    }
    if ((this._bitFlag & BIT_FLAG.WIDTH) === BIT_FLAG.WIDTH) {
      this._origWindow.windowWidth = this.windowWidth
    }
    if ((this._bitFlag & BIT_FLAG.HEIGHT) === BIT_FLAG.HEIGHT) {
      this._origWindow.windowHeight = this.windowHeight
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
    this._bitFlag |= BIT_FLAG.LEFT
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
    this._bitFlag |= BIT_FLAG.TOP
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
    this._bitFlag |= BIT_FLAG.WIDTH
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
    this._bitFlag |= BIT_FLAG.HEIGHT
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
