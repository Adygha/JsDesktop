import AbsApp from '../app/abs-app.js'
import {CONF_CONSTS} from '../config-storage.js'

const WIN_CSS_PATH = CONF_CONSTS.DTOP_PATH + 'css/window.css'
const WIN_TMPL_PATH = CONF_CONSTS.DTOP_PATH + 'tmpl/window.html'
const HTML_TAG_WIN = 'js-dtop-window' // Window's HTML tag name
const HTML_CLASS_WIN_INNER = 'js-dtop-win-content' // HTML class for the inner container of the window
const HTML_CLASS_WIN_TITLE = 'js-dtop-win-title' // HTML class for the title-text element
const HTML_CLASS_WIN_ICON = 'js-dtop-win-icon' // HTML class for the titlebar's icon
const HTML_CLASS_WIN_MIN_BUT = 'js-dtop-win-min-but' // HTML class for the min button
const HTML_CLASS_WIN_MAX_BUT = 'js-dtop-win-max-but' // HTML class for the max button
const HTML_CLASS_WIN_CLOSE_BUT = 'js-dtop-win-close-but' // HTML class for the close button
const HTML_CLASS_WIN_INACTIVE = 'js-dtop-win-inactive' // HTML class for inactive window
const HTML_CLASS_WIN_TRANSP = 'js-dtop-win-transp' // HTML class for transparent window
const HTML_CLASS_WIN_DISABLED = 'js-dtop-win-disabled' // HTML class for disabled window
const HTML_CLASS_WIN_MINIM = 'js-dtop-win-minim' // HTML class for minimizing window
const HTML_CLASS_WIN_CLOSE = 'js-dtop-win-close' // HTML class for closing window
const HTML_CLASS_EDGE_WITHCURSOR = 'js-dtop-win-moveresize' // HTML class for the window's edges (with visible cursor)
const HTML_CLASS_EDGE_NOCURSOR = 'js-dtop-win-moveresize-nocursor' // HTML class to disable cursor for the window's edges
const HTML_CLASS_WIN_TITLEBAR = 'js-dtop-win-titlebar' // HTML class for window's title bar
const HTML_CLASS_EDGE_TOP = 'js-dtop-win-topedge' // HTML class for window's top edge
const HTML_CLASS_EDGE_RIGHT = 'js-dtop-win-rightedge' // HTML class for window's right edge
const HTML_CLASS_EDGE_BOT = 'js-dtop-win-botedge' // HTML class for window's bottom edge
const HTML_CLASS_EDGE_LEFT = 'js-dtop-win-leftedge' // HTML class for window's left edge
const HTML_CLASS_CORN_TOP_LEFT = 'js-dtop-win-topleftcorner' // HTML class for window's top-left corner
const HTML_CLASS_CORN_TOP_RIGHT = 'js-dtop-win-toprightcorner' // HTML class for window's top-right corner
const HTML_CLASS_CORN_BOT_RIGHT = 'js-dtop-win-botrightcorner' // HTML class for window's bottom-right corner
const HTML_CLASS_CORN_BOT_LEFT = 'js-dtop-win-botleftcorner' // HTML class for window's bottom-left corner
const HTML_CLASS_WIN_TASKBAR_BUT = 'js-dtop-win-taskbar-drawer-but' // HTML class for window's taskbar drawer button
const HTML_CLASS_WIN_TASKBAR_BUT_ACT = 'js-dtop-win-taskbar-drawer-but-active' // HTML class for active window's taskbar drawer button
export const WIN_EVENTS = {
  // EVENT_WIN_CREATED: 'window-created',
  WIN_FOCUS: 'window-focus',
  WIN_MAXIMIZE: 'window-maximize',
  WIN_MINIMIZE: 'window-minimize',
  WIN_CLOSE: 'window-close',
  WIN_GRAB: 'window-grab'
}

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
 * @extends {Event}
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
    super(WIN_EVENTS.WIN_GRAB, eventInit)
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
    /** @type {{x: Number, y: Number, width: Number, height: Number}} */
    this._beforeMax = undefined // Used to store this window rect before going to maximize
    this._isInTrans = false // To indicate that a window is in transition effect
    this._winApp = appObj
    if (winSize && winSize.width && winSize.height) {
      this.windowWidth = winSize.width
      this.windowHeight = winSize.height
    } else {
      this.windowWidth = this._winApp.constructor.defaultAppSize.width
      this.windowHeight = this._winApp.constructor.defaultAppSize.height
    }
    if (winPos && winPos.x && winPos.y) {
      this.windowLeft = winPos.x
      this.windowTop = winPos.y
    } else {
      this.windowLeft = 0
      this.windowTop = 0
    }
    this._taskBarDrawerBut = document.createElement('div')
    this._taskBarDrawerBut.classList.add(HTML_CLASS_WIN_TASKBAR_BUT)
    this._taskBarDrawerBut.textContent = this._taskBarDrawerBut.title = this._winApp.constructor.appName
    this._taskBarDrawerBut.addEventListener('click', this._handleDrawerButClick.bind(this))
    fetch(WIN_TMPL_PATH).then(resp => resp.text()).then(docTxt => { // fetch the window html template
      let tmpDoc = (new DOMParser()).parseFromString(docTxt, 'text/html') //.querySelector('.' + HTML_CLASS_WIN_OUTER).cloneNode(true)
      let tmpTitleBar = tmpDoc.querySelector('.' + HTML_CLASS_WIN_TITLEBAR).cloneNode(true)
      let tmpInner = tmpDoc.querySelector('.' + HTML_CLASS_WIN_INNER).cloneNode(true)
      let tmpIcon = tmpTitleBar.querySelector('.' + HTML_CLASS_WIN_ICON)
      tmpIcon.setAttribute('src', this._winApp.constructor.appIconURL)
      tmpIcon.style.pointerEvents = 'none' // Thought it's better to put it here in case accidentally removed from css file
      tmpTitleBar.querySelector('.' + HTML_CLASS_WIN_TITLE).textContent = this._winApp.constructor.appName
      this.appendChild(tmpTitleBar)
      Array.from(
        tmpDoc.querySelectorAll('.' + HTML_CLASS_EDGE_WITHCURSOR + ':not(.' + HTML_CLASS_WIN_TITLEBAR + ')'),
        elem => elem.cloneNode(true)
      ).forEach(elem => this.appendChild(elem))
      this.appendChild(tmpInner)
      if (tmpInner.attachShadow) tmpInner = tmpInner.attachShadow({mode: 'closed'}) // If 'Shadow Dom' is supported then replace 'tmpInner' with its shadow
      tmpInner.appendChild(this._winApp)
      tmpTitleBar.addEventListener('dblclick', this._handleWinMaximize.bind(this))
      this.addEventListener(window.PointerEvent ? 'pointerdown' : 'mousedown', this._handleWinPointerDown.bind(this))
      this.querySelector('.' + HTML_CLASS_WIN_MIN_BUT).addEventListener('click', this._handleWinMinimize.bind(this))
      this.querySelector('.' + HTML_CLASS_WIN_MAX_BUT).addEventListener('click', this._handleWinMaximize.bind(this))
      this.querySelector('.' + HTML_CLASS_WIN_CLOSE_BUT).addEventListener('click', this._handleWinClose.bind(this))
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
    // this.isActive = false
    this._taskBarDrawerBut.classList.add(HTML_CLASS_WIN_TASKBAR_BUT_ACT)
    this.dispatchEvent(new Event(WIN_EVENTS.WIN_FOCUS))
  }

  /**
   * Supposed to handle the event of window pointer-/mouse-down event.
   * @param {PointerEvent|MouseEvent} ev    the mouse-event related to pointer-/mouse-down
   * @private
   */
  _handleWinPointerDown (ev) {
    if (!this.isActive) this.dispatchEvent(new Event(WIN_EVENTS.WIN_FOCUS)) // Get focus first
    if (!this._beforeMax && ev.target && ev.target.classList && ev.target.classList.contains(HTML_CLASS_EDGE_WITHCURSOR)) { // Check if not maximized and in move-resize
      let tmpGrabType
      if (ev.target.classList.contains(HTML_CLASS_WIN_TITLEBAR)) { // The title bar is grabbed
        tmpGrabType = WindowGrabType.WINDOW_MOVE
      } else if (ev.target.classList.contains(HTML_CLASS_EDGE_TOP)) { // The top edge is grabbed
        tmpGrabType = WindowGrabType.TOP_EDGE
      } else if (ev.target.classList.contains(HTML_CLASS_EDGE_RIGHT)) { // The right edge is grabbed
        tmpGrabType = WindowGrabType.RIGHT_EDGE
      } else if (ev.target.classList.contains(HTML_CLASS_EDGE_BOT)) { // The bottom edge is grabbed
        tmpGrabType = WindowGrabType.BOTTOM_EDGE
      } else if (ev.target.classList.contains(HTML_CLASS_EDGE_LEFT)) { // The left edge is grabbed
        tmpGrabType = WindowGrabType.LEFT_EDGE
      } else if (ev.target.classList.contains(HTML_CLASS_CORN_TOP_LEFT)) { // The top-left corner is grabbed
        tmpGrabType = WindowGrabType.TOP_LEFT_CORNER
      } else if (ev.target.classList.contains(HTML_CLASS_CORN_TOP_RIGHT)) { // The top-right corner is grabbed
        tmpGrabType = WindowGrabType.TOP_RIGHT_CORNER
      } else if (ev.target.classList.contains(HTML_CLASS_CORN_BOT_RIGHT)) { // The bottom-right corner is grabbed
        tmpGrabType = WindowGrabType.BOTTOM_RIGHT_CORNER
      } else if (ev.target.classList.contains(HTML_CLASS_CORN_BOT_LEFT)) { // The bottom-left corner is grabbed
        tmpGrabType = WindowGrabType.BOTTOM_LEFT_CORNER
      }
      this.dispatchEvent(new WindowGrabEvent(tmpGrabType, ev))
    }
  }

  /**
   * Supposed to handle the event of window minimize.
   * @param {Event} ev  the dispatched event
   * @private
   */
  _handleWinMinimize (ev) {
    if (this._isInTrans) {
      ev.stopPropagation()
    } else {
      if (!this.isMinimized) {
        if (!this.isActive) this.dispatchEvent(new Event(WIN_EVENTS.WIN_FOCUS)) // Get focus first
        this.dispatchEvent(new Event(WIN_EVENTS.WIN_MINIMIZE)) // Then request minimize
      }
    }
  }

  /**
   * Supposed to handle the event of window maximize.
   * @param {Event} ev  the dispatched event
   * @private
   */
  _handleWinMaximize (ev) {
    if (this._isInTrans) {
      ev.stopPropagation()
    } else {
      if (!this.isActive) this.dispatchEvent(new Event(WIN_EVENTS.WIN_FOCUS)) // Get focus first
      if (this.isMaximized) {
        this.isMaximized = false
      } else {
        this.dispatchEvent(new Event(WIN_EVENTS.WIN_MAXIMIZE))
      }
    }
  }

  /**
   * Supposed to handle the event of window close.
   * @param {Event} ev  the dispatched event
   * @private
   */
  _handleWinClose (ev) {
    if (this._isInTrans) {
      ev.stopPropagation()
    } else {
      let tmpHandler = ev => {
        ev.target.removeEventListener('transitionend', tmpHandler)
        this._winApp.endApp()
        this.dispatchEvent(new Event(WIN_EVENTS.WIN_CLOSE))
        this._isInTrans = false
      }
      this._isInTrans = true
      if (!this.isActive) this.dispatchEvent(new Event(WIN_EVENTS.WIN_FOCUS)) // Get focus first
      this.addEventListener('transitionend', tmpHandler)
      this.isDisabled = true
      this.classList.add(HTML_CLASS_WIN_CLOSE)
    }
  }

  /**
   * Supposed to handle the event of window's drawer button click.
   * @param {Event} ev  the dispatched event
   * @private
   */
  _handleDrawerButClick (ev) {
    if (this._isInTrans) {
      ev.stopPropagation()
    } else {
      if (this.isActive) {
        this.dispatchEvent(new Event(WIN_EVENTS.WIN_MINIMIZE))
      } else {
        this.dispatchEvent(new Event(WIN_EVENTS.WIN_FOCUS))
        if (this.isMinimized) this.isMinimized = false
      }
    }
  }

  /**
   * The window's taskbar drawer button (that you can bring a minimized window back with).
   * @type {HTMLElement}
   */
  get taskBarDrawerButton () {
    return this._taskBarDrawerBut
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
    if (newWidth >= CONF_CONSTS.WIN_MIN_WIDTH) this.style.width = newWidth + 'px'
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
    if (newHeight >= CONF_CONSTS.WIN_MIN_HEIGHT) this.style.height = newHeight + 'px'
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
    return !this.classList.contains(HTML_CLASS_WIN_INACTIVE)
  }

  /**
   * Specifies if the window is the active on-top window.
   * @type {Boolean}
   */
  set isActive (newIsActive) {
    if (newIsActive && !this.isActive) {
      this.classList.remove(HTML_CLASS_WIN_INACTIVE)
      this._taskBarDrawerBut.classList.add(HTML_CLASS_WIN_TASKBAR_BUT_ACT)
    } else if (!newIsActive && this.isActive) {
      this.classList.add(HTML_CLASS_WIN_INACTIVE)
      this._taskBarDrawerBut.classList.remove(HTML_CLASS_WIN_TASKBAR_BUT_ACT)
    }
  }

  /**
   * Specifies if the window is transparent (can be set when moving).
   * @type {Boolean}
   */
  get isTransparent () {
    return this.classList.contains(HTML_CLASS_WIN_TRANSP)
  }

  /**
   * Specifies if the window is transparent (can be set when moving).
   * @type {Boolean}
   */
  set isTransparent (newIsTransparent) {
    if (newIsTransparent) {
      this.classList.add(HTML_CLASS_WIN_TRANSP)
    } else {
      this.classList.remove(HTML_CLASS_WIN_TRANSP)
    }
  }

  /**
   * Specifies if the window is disabled.
   * @type {Boolean}
   */
  get isDisabled () {
    return this.classList.contains(HTML_CLASS_WIN_DISABLED)
  }

  /**
   * Specifies if the window is disabled.
   * @type {Boolean}
   */
  set isDisabled (newIsDisabled) {
    if (newIsDisabled && !this.isDisabled) {
      this.classList.add(HTML_CLASS_WIN_DISABLED)
    } else if (!newIsDisabled && this.isDisabled) {
      this.classList.remove(HTML_CLASS_WIN_DISABLED)
    }
  }

  /**
   * Specifies if the window is minimized.
   * @type {Boolean}
   */
  get isMinimized () {
    return this.classList.contains(HTML_CLASS_WIN_MINIM)
  }

  /**
   * Specifies if the window is minimized.
   * @type {Boolean}
   */
  set isMinimized (newIsMinimized) {
    if (newIsMinimized && !this.isMinimized) {
      let tmpHandler = ev => {
        ev.target.removeEventListener('transitionend', tmpHandler)
        this.isDisabled = false
        // this._taskBarDrawerBut.parentElement.style.pointerEvents = 'auto'
        this._isInTrans = false
      }
      this._isInTrans = true
      // this._taskBarDrawerBut.parentElement.style.pointerEvents = 'none' // To prevent multiple clicks
      this.isDisabled = true
      this.addEventListener('transitionend', tmpHandler)
      this.classList.add(HTML_CLASS_WIN_MINIM)
      this.isActive = false
    } else if (!newIsMinimized && this.isMinimized) {
      let tmpHandler = ev => {
        ev.target.removeEventListener('transitionend', tmpHandler)
        this.dispatchEvent(new Event(WIN_EVENTS.WIN_FOCUS))
        // this._taskBarDrawerBut.parentElement.style.pointerEvents = 'auto'
        this._isInTrans = false
      }
      this._isInTrans = true
      // this._taskBarDrawerBut.parentElement.style.pointerEvents = 'none' // To prevent multiple clicks
      this.addEventListener('transitionend', tmpHandler)
      this.classList.remove(HTML_CLASS_WIN_MINIM)
    }
  }

  /**
   * Specifies if the window is maximized.
   * @type {Boolean}
   */
  get isMaximized () {
    return !!this._beforeMax
  }

  /**
   * Specifies if the window is maximized.
   * @type {Boolean}
   */
  set isMaximized (newIsMaximized) {
    if (this._beforeMax && !newIsMaximized) { // Already maximized? then restore original size
      let tmpEdges = this.querySelectorAll('.' + HTML_CLASS_EDGE_NOCURSOR)
      tmpEdges.forEach(elem => {
        elem.classList.remove(HTML_CLASS_EDGE_NOCURSOR)
        elem.classList.add(HTML_CLASS_EDGE_WITHCURSOR)
      })
      this.windowLeft = this._beforeMax.x
      this.windowTop = this._beforeMax.y
      this.windowWidth = this._beforeMax.width
      this.windowHeight = this._beforeMax.height
      this._beforeMax = undefined
    } else if (!this._beforeMax && newIsMaximized) { // Not maximized? then maximize
      let tmpEdges = this.querySelectorAll('.' + HTML_CLASS_EDGE_WITHCURSOR)
      tmpEdges.forEach(elem => {
        elem.classList.remove(HTML_CLASS_EDGE_WITHCURSOR)
        elem.classList.add(HTML_CLASS_EDGE_NOCURSOR)
      })
      this._beforeMax = {
        x: this.windowLeft,
        y: this.windowTop,
        width: this.windowWidth,
        height: this.windowHeight
      }
    }
  }

  /**
   * The minimum window width.
   * @type {Number}
   */
  static get minWindowWidth () {
    return CONF_CONSTS.WIN_MIN_WIDTH
  }

  /**
   * The minimum window height.
   * @type {Number}
   */
  static get minWindowHeight () {
    return CONF_CONSTS.WIN_MIN_HEIGHT
  }
}

window.customElements.define(HTML_TAG_WIN, Window)
