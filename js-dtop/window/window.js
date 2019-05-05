import IWindowObserver from './i-window-observer.js'
import AbsApp from '../app/abs-app.js'

const DTOP_PATH = 'js-dtop/'
const WIN_CSS_PATH = DTOP_PATH + 'css/window.css'
const WIN_TMPL_PATH = DTOP_PATH + 'tmpl/window.html'
const WIN_MIN_WIDTH = 300
const WIN_MIN_HEIGHT = 300

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
 * A class that represents a window that can contain an application
 */
export default class Window extends HTMLElement {

  /**
   * Constructor that takes the app and its position and size as parameters.
   * @param {typeof IWindowObserver} windowObserver   the observer object for the window
   * @param {typeof AbsApp} appClass              the js-desktop-app that is to be run in this window object
   * @param {Object} [winSize]                        the app's window size {width: number, height: number}
   * @param {Number} winSize.width                    the app's window width
   * @param {Number} winSize.height                   the app's window height
   * @param {Object} [winPos]                         the app's window position {x: number, y: number}
   * @param {Number} winPos.x                         the app's window X position
   * @param {Number} winPos.y                         the app's window Y position
   */
  constructor (windowObserver, appClass, winSize, winPos) {
    super()
    IWindowObserver.checkObjectImplements(windowObserver)
    /** @type {typeof IWindowObserver} */
    this._observer = windowObserver
    ///** @type {Map<HTMLElement, Function>} */
    // this._evLsn = new Map()
    if (winSize && winSize.width && winSize.height) {
      this.windowWidth = winSize.width
      this.windowHeight = winSize.height
    } else {
      this.windowWidth = appClass.defaultAppSize.width
      this.windowHeight = appClass.defaultAppSize.height
    }
    if (winPos && winPos.x && winPos.y) {
      this.windowLeft = winPos.x
      this.windowTop = winPos.y
    } else {
      this.windowLeft = 0
      this.windowTop = 0
    }
    this._winApp = new appClass(this)
    fetch(WIN_TMPL_PATH).then(resp => resp.text()).then(docTxt => { // fetch the window html template
      this._windowOuter = (new DOMParser()).parseFromString(docTxt, 'text/html').querySelector('div.js-dtop-win').cloneNode(true)
      this._windowButClose = this._windowOuter.querySelector('label.js-dtop-win-close')
      let tmpInner = this._windowOuter.querySelector('div.js-dtop-win-content')
      this._windowOuter.querySelector('div.js-dtop-win-title').textContent = appClass.appName
      if (tmpInner.attachShadow) { // If 'Shadow Dom' is supported then replace 'tmpInner' with its shadow
        tmpInner = tmpInner.attachShadow({mode: 'closed'})
      }
      tmpInner.appendChild(this._winApp)
      this._windowOuter.querySelector('img.js-dtop-win-icon').setAttribute('src', appClass.appIconURL)
      // this.appendChild(this._windowOuter)
      this.appendChild(this._windowOuter)
      this.addEventListener('click', this._handleWinClick.bind(this))
      this.addEventListener('mousedown', this._handleWinMouseDown.bind(this))
      this._windowOuter.querySelector('label.js-dtop-win-max').addEventListener('click', this._handleWinMaximize.bind(this))
      this._windowButClose.addEventListener('click', this._handleWinClose.bind(this))
    })
    this._observer.windowCreated(this)
  }

  connectedCallback () {
    let tmpStyle = document.querySelector('link[rel="stylesheet"][href="' + WIN_CSS_PATH + '"]')
    if (!tmpStyle) {
      tmpStyle = document.createElement('link')
      tmpStyle.setAttribute('rel', 'stylesheet')
      tmpStyle.setAttribute('href', WIN_CSS_PATH)
      document.head.appendChild(tmpStyle)
    }
  }

  /**
   * Supposed to handle the event of window close.
   * @private
   */
  _handleWinClose () {
    // this._evLsn.forEach((lsn, elem) => {
    //   elem.removeEventListener()
    // })
    this._winApp.endApp()
    this._observer.windowClosed(this)
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
      this._observer.windowMaximized(this)
    }
  }

  /**
   * Supposed to handle the event of window click.
   * @private
   */
  _handleWinClick () {
    if (!this.isActive) {
      this._observer.windowFocused(this)
    }
  }

  /**
   * Supposed to handle the event of window mouse-down.
   * @param {MouseEvent} ev   the mouse-event related to mouse-down
   * @private
   */
  _handleWinMouseDown (ev) {
    if (!this._beforeMax && ev.target.classList.contains('js-dtop-win-moveresize')) { // Check if not maximized and in move-resize
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
      this._observer.windowGrabbed(this, tmpGrabType, ev)
    }
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

  // /**
  //  * Specifies if the window is transparent (can be set when moving).
  //  * @type {Boolean}
  //  */
  // get isTransparent () {
  //   return this.classList.contains('app-transp')
  // }
  //
  // /**
  //  * Specifies if the window is transparent (can be set when moving).
  //  * @type {Boolean}
  //  */
  // set isTransparent (newIsTransparent) {
  //   if (newIsTransparent) {
  //     this.classList.add('app-transp')
  //   } else {
  //     this.classList.remove('app-transp')
  //   }
  // }

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

  /**
   * Used to inform that the app's working window object is requested.
   * @return {Window}   the requested window object that the app runs on
   */
  windowObjectRequested () {
    return this
  }

  /**
   * Used to inform that the app's working desktop object is requested.
   * @return {Desktop}   the requested desktop object that the app runs on
   */
  desktopObjectRequested () {
    return this._observer.desktopObjectRequested()
  }
}

window.customElements.define('js-dtop-window', Window)
