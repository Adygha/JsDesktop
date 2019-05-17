import AbsApp from '../app/abs-app.js'

const DTOP_PATH = 'js-dtop/'
const WIN_CSS_PATH = DTOP_PATH + 'css/window.css'
const WIN_TMPL_PATH = DTOP_PATH + 'tmpl/window.html'
const WIN_MIN_WIDTH = 300
const WIN_MIN_HEIGHT = 300
export const WIN_EVENTS = {
  // EVENT_WIN_CREATED: 'window-created',
  WIN_FOCUSED: 'window-focused',
  WIN_MAXIMIZED: 'window-maximized',
  WIN_MINIMIZED: 'window-minimized',
  WIN_CLOSED: 'window-closed',
  WIN_GRABBED: 'window-grabbed'
}
const HTML_TAG_WIN = 'js-dtop-window' // Window's HTML tag name
const HTML_CLASS_WIN_OUTER = 'js-dtop-win' // HTML class for the outer container of the window
const HTML_CLASS_WIN_INNER = 'js-dtop-win-content' // HTML class for the inner container of the window
const HTML_CLASS_WIN_TITLE = 'js-dtop-win-title' // HTML class for the title-bar
const HTML_CLASS_WIN_ICON = 'js-dtop-win-icon' // HTML class for the title-bar's icon
const HTML_CLASS_WIN_MIN = 'js-dtop-win-min' // HTML class for the min button
const HTML_CLASS_WIN_MAX = 'js-dtop-win-max' // HTML class for the max button
const HTML_CLASS_WIN_CLOSE = 'js-dtop-win-close' // HTML class for the close button

/**
 * An Enum used to specify the type of grab (which part of the window is grabbed/moved)
 * @readonly
 * @enum {Symbol}
 */
export const WindowGrabType = Object.freeze({

  /** Window is being moved */
  WINDOW_MOVE: Symbol('WINDOW_MOVE'),

  /** Top edge is being grabbed */
  TOP_EDGE: Symbol('TOP_EDGE'),

  /** Right edge is being grabbed */
  RIGHT_EDGE: Symbol('RIGHT_EDGE'),

  /** Bottom edge is being grabbed */
  BOTTOM_EDGE: Symbol('BOTTOM_EDGE'),

  /** Left edge is being grabbed */
  LEFT_EDGE: Symbol('LEFT_EDGE'),

  /** Top-left corner is being grabbed */
  TOP_LEFT_CORNER: Symbol('TOP_LEFT_CORNER'),

  /** Top-right corner is being grabbed */
  TOP_RIGHT_CORNER: Symbol('TOP_RIGHT_CORNER'),

  /** Bottom-right corner is being grabbed */
  BOTTOM_RIGHT_CORNER: Symbol('BOTTOM_RIGHT_CORNER'),

  /** Bottom-left corner is being grabbed */
  BOTTOM_LEFT_CORNER: Symbol('BOTTOM_LEFT_CORNER')
})

/**
 * A class that represents an event dispatched when a window is grabbed/moved.
 */
export class WindowGrabEvent extends (window.PointerEvent ? PointerEvent : MouseEvent) {

  /**
   * Constructor that takes the event-type, the grab-type, and the PointerEventInit/MouseEventInit dictionary (or a PointerEvent/MouseEvent) as parameters.
   * @param {WindowGrabType} grabType   the type of grab (which part of the window is grabbed/moved) that triggered the event
   * @param {PointerEventInit|
   *          MouseEventInit|
   *          PointerEvent|
   *          MouseEvent} eventInit     a PointerEventInit/MouseEventInit dictionary (or a PointerEvent/MouseEvent Object) to build this event on
   */
  constructor (grabType, eventInit) {
    super(WIN_EVENTS.WIN_GRABBED, eventInit)
    this._grabType = grabType
  }

  /**
   * the type of grab (which part of the window is grabbed/moved) that triggered the event.
   * @return {WindowGrabType}
   */
  get grabType () {
    return this._grabType
  }
}

/**
 * A class that represents a window that can contain an application
 */
export default class Window extends HTMLElement {

  /**
   * Constructor that takes the app and its position and size as parameters.
   * @param {AbsApp} appObj           the js-desktop-app object that is to be run in this window object
   * @param {Object} [winPos]         the app's window position {x: number, y: number}
   * @param {Number} winPos.x         the app's window X position
   * @param {Number} winPos.y         the app's window Y position
   * @param {Object} [winSize]        the app's window size {width: number, height: number}
   * @param {Number} winSize.width    the app's window width
   * @param {Number} winSize.height   the app's window height
   */
  constructor (appObj, winPos, winSize) {
    super()
    if (winSize && winSize.width && winSize.height) {
      this.windowWidth = winSize.width
      this.windowHeight = winSize.height
    } else {
      this.windowWidth = appObj.constructor.defaultAppSize.width
      this.windowHeight = appObj.constructor.defaultAppSize.height
    }
    if (winPos && winPos.x && winPos.y) {
      this.windowLeft = winPos.x
      this.windowTop = winPos.y
    } else {
      this.windowLeft = 0
      this.windowTop = 0
    }
    fetch(WIN_TMPL_PATH).then(resp => resp.text()).then(docTxt => { // fetch the window html template
      this._windowOuter = (new DOMParser()).parseFromString(docTxt, 'text/html').querySelector('.' + HTML_CLASS_WIN_OUTER).cloneNode(true)
      let tmpCloseBut = this._windowOuter.querySelector('.' + HTML_CLASS_WIN_CLOSE)
      let tmpInner = this._windowOuter.querySelector('.' + HTML_CLASS_WIN_INNER)
      this._windowOuter.querySelector('.' + HTML_CLASS_WIN_TITLE).textContent = appObj.constructor.appName
      if (tmpInner.attachShadow) { // If 'Shadow Dom' is supported then replace 'tmpInner' with its shadow
        tmpInner = tmpInner.attachShadow({mode: 'closed'})
      }
      tmpInner.appendChild(appObj)
      this._winApp = appObj
      this._windowOuter.querySelector('.' + HTML_CLASS_WIN_ICON).setAttribute('src', appObj.constructor.appIconURL)
      this.appendChild(this._windowOuter)
      this.addEventListener('click', this._handleWinClick.bind(this))
      this.addEventListener(window.PointerEvent ? 'pointerdown' : 'mousedown', this._handleWinPointerDown.bind(this))
      this._windowOuter.querySelector('.' + HTML_CLASS_WIN_MIN).addEventListener('click', this._handleWinMinimize.bind(this))
      this._windowOuter.querySelector('.' + HTML_CLASS_WIN_MAX).addEventListener('click', this._handleWinMaximize.bind(this))
      this._windowOuter.querySelector('.' + HTML_CLASS_WIN_CLOSE).addEventListener('click', this._handleWinClose.bind(this))
    })
    // this.dispatchEvent(new Event(WIN_EVENTS.EVENT_WIN_CREATED))
  }

  connectedCallback () {
    let tmpStyle = document.querySelector('link[rel="stylesheet"][href="' + WIN_CSS_PATH + '"]')
    if (!tmpStyle) {
      tmpStyle = document.createElement('link')
      tmpStyle.setAttribute('rel', 'stylesheet')
      tmpStyle.setAttribute('href', WIN_CSS_PATH)
      document.head.appendChild(tmpStyle)
    }
    this.isActive = false
    this.dispatchEvent(new Event(WIN_EVENTS.WIN_FOCUSED))
  }

  /**
   * Supposed to handle the event of window click.
   * @private
   */
  _handleWinClick () {
    if (!this.isActive) {
      this.dispatchEvent(new Event(WIN_EVENTS.WIN_FOCUSED))
    }
  }

  /**
   * Supposed to handle the event of window pointer-/mouse-down event.
   * @param {PointerEvent|MouseEvent} ev    the mouse-event related to pointer-/mouse-down
   * @private
   */
  _handleWinPointerDown (ev) {
    if (!this._beforeMax && ev.target && ev.target.classList && ev.target.classList.contains('js-dtop-win-moveresize')) { // Check if not maximized and in move-resize
      let tmpGrabType
      if (ev.target.classList.contains('js-dtop-win-bar')) { // The title bar is grabbed
        tmpGrabType = WindowGrabType.WINDOW_MOVE
      } else if (ev.target.classList.contains('js-dtop-win-topedge')) { // The top edge is grabbed
        tmpGrabType = WindowGrabType.TOP_EDGE
      } else if (ev.target.classList.contains('js-dtop-win-rightedge')) { // The right edge is grabbed
        tmpGrabType = WindowGrabType.RIGHT_EDGE
      } else if (ev.target.classList.contains('js-dtop-win-botedge')) { // The bottom edge is grabbed
        tmpGrabType = WindowGrabType.BOTTOM_EDGE
      } else if (ev.target.classList.contains('js-dtop-win-leftedge')) { // The left edge is grabbed
        tmpGrabType = WindowGrabType.LEFT_EDGE
      } else if (ev.target.classList.contains('js-dtop-win-topleftcorner')) { // The top-left corner is grabbed
        tmpGrabType = WindowGrabType.TOP_LEFT_CORNER
      } else if (ev.target.classList.contains('js-dtop-win-toprightcorner')) { // The top-right corner is grabbed
        tmpGrabType = WindowGrabType.TOP_RIGHT_CORNER
      } else if (ev.target.classList.contains('js-dtop-win-botrightcorner')) { // The bottom-right corner is grabbed
        tmpGrabType = WindowGrabType.BOTTOM_RIGHT_CORNER
      } else if (ev.target.classList.contains('js-dtop-win-botleftcorner')) { // The bottom-left corner is grabbed
        tmpGrabType = WindowGrabType.BOTTOM_LEFT_CORNER
      }
      this.dispatchEvent(new WindowGrabEvent(tmpGrabType, ev))
    }
  }

  /**
   * Supposed to handle the event of window minimize.
   * @private
   */
  _handleWinMinimize () {
    // TODO: Fill for minimize
    this.dispatchEvent(new Event(WIN_EVENTS.WIN_MINIMIZED))
  }

  /**
   * Supposed to handle the event of window maximize.
   * @private
   */
  _handleWinMaximize () {
    if (this._beforeMax) {
      let tmpEdges = this._windowOuter.querySelectorAll('div.js-dtop-win-moveresize-nocursor')
      tmpEdges.forEach(elem => {
        elem.classList.remove('js-dtop-win-moveresize-nocursor')
        elem.classList.add('js-dtop-win-moveresize')
      })
      this.windowLeft = this._beforeMax.x
      this.windowTop = this._beforeMax.y
      this.windowWidth = this._beforeMax.width
      this.windowHeight = this._beforeMax.height
      this._beforeMax = undefined
    } else {
      let tmpEdges = this._windowOuter.querySelectorAll('div.js-dtop-win-moveresize')
      tmpEdges.forEach(elem => {
        elem.classList.remove('js-dtop-win-moveresize')
        elem.classList.add('js-dtop-win-moveresize-nocursor')
      })
      this._beforeMax = {
        x: this.windowLeft,
        y: this.windowTop,
        width: this.windowWidth,
        height: this.windowHeight
      }
      this.dispatchEvent(new Event(WIN_EVENTS.WIN_MAXIMIZED))
    }
  }

  /**
   * Supposed to handle the event of window close.
   * @private
   */
  _handleWinClose () {
    this._winApp.endApp()
    this.dispatchEvent(new Event(WIN_EVENTS.WIN_CLOSED))
  }

  /**
   * The left of the window.
   * @type {Number}
   */
  get windowLeft () {
    return parseInt(this.style.left, 10)
  }

  /**
   * The left of the window.
   * @type {Number}
   */
  set windowLeft (newLeft) {
    this.style.left = newLeft + 'px'
  }

  /**
   * The top of the window.
   * @type {Number}
   */
  get windowTop () {
    return parseInt(this.style.top, 10)
  }

  /**
   * The top of the window.
   * @type {Number}
   */
  set windowTop (newTop) {
    this.style.top = newTop + 'px'
  }

  /**
   * The width of this window.
   * @type {Number}
   */
  get windowWidth () {
    return parseInt(this.style.width, 10)
  }

  /**
   * The width of this window.
   * @type {Number}
   */
  set windowWidth (newWidth) {
    if (newWidth >= WIN_MIN_WIDTH) {
      this.style.width = newWidth + 'px'
    }
  }

  /**
   * The height of this window.
   * @type {Number}
   */
  get windowHeight () {
    return parseInt(this.style.height, 10)
  }

  /**
   * The height of this window.
   * @type {Number}
   */
  set windowHeight (newHeight) {
    if (newHeight >= WIN_MIN_HEIGHT) {
      this.style.height = newHeight + 'px'
    }
  }

  /**
   * The z-index of the window.
   * @type {Number}
   */
  get windowZIndex () {
    return this.style.zIndex ? parseInt(this.style.zIndex, 10) : 0
  }

  /**
   * The z-index of the window.
   * @type {Number}
   */
  set windowZIndex (newZIndex) {
    this.style.zIndex = newZIndex.toString()
  }

  /**
   * The window's title.
   * @readonly
   * @type {String}
   */
  get windowTitle () {
    return this._winApp.constructor.appName
  }

  /**
   * Specifies if the window is the active on-top window.
   * @type {Boolean}
   */
  get isActive () {
    return !this.classList.contains('app-inactive')
  }

  /**
   * Specifies if the window is the active on-top window.
   * @type {Boolean}
   */
  set isActive (newIsActive) {
    if (newIsActive) {
      this.classList.remove('app-inactive')
    } else {
      this.classList.add('app-inactive')
    }
  }

  /**
   * Specifies if the window is transparent (can be set when moving).
   * @type {Boolean}
   */
  get isTransparent () {
    return this.classList.contains('app-transp')
  }

  /**
   * Specifies if the window is transparent (can be set when moving).
   * @type {Boolean}
   */
  set isTransparent (newIsTransparent) {
    if (newIsTransparent) {
      this.classList.add('app-transp')
    } else {
      this.classList.remove('app-transp')
    }
  }

  /**
   * Specifies if the window is disabled.
   * @type {Boolean}
   */
  get isDisabled () {
    return !this.classList.contains('app-disabled')
  }

  /**
   * Specifies if the window is disabled.
   * @type {Boolean}
   */
  set isDisabled (newIsDisabled) {
    if (newIsDisabled) {
      this.classList.add('app-disabled')
    } else {
      this.classList.remove('app-disabled')
    }
  }

  /**
   * Checks if the window is maximized.
   * @readonly
   * @type {Boolean}
   */
  get isMaximized () {
    return !!this._beforeMax
  }

  /**
   * The minimum window width.
   * @type {Number}
   */
  static get minWindowWidth () {
    return WIN_MIN_WIDTH
  }

  /**
   * The minimum window height.
   * @type {Number}
   */
  static get minWindowHeight () {
    return WIN_MIN_HEIGHT
  }
}

window.customElements.define(HTML_TAG_WIN, Window)
