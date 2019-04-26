import IWindowObserver from './i-window-observer.js'
import AbsDtopApp from '../js-dtop/abs-dtop-app.js'

const MIN_WIDTH = 300
const MIN_HEIGHT = 300
//const LABEL_CLOSE_EVENT = 'window-close'

/**
 * A class that represents a window that can contain an application
 */
export default class Window extends HTMLElement {

  /**
   * Constructor that takes the app and its position and size as parameters.
   * @param {typeof IWindowObserver} windowObserver  the observer object for the window
   * @param {typeof AbsDtopApp} appClass               the js-desktop-app that is to be run in this window object
   * @param {Object} [winSize]                the app's window size {width: number, height: number}
   * @param {Number} winSize.width            the app's window width
   * @param {Number} winSize.height           the app's window height
   * @param {Object} [winPos]                 the app's window position {x: number, y: number}
   * @param {Number} winPos.x                 the app's window X position
   * @param {Number} winPos.y                 the app's window Y position
   */
  constructor(windowObserver, appClass, winSize, winPos) {
    IWindowObserver.checkObjectImplements(windowObserver)
    super()
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
    fetch('js-dtop-window/window.html').then(resp => resp.text()).then(docTxt => { // fetch the window html template
      this._windowOuter = (new DOMParser()).parseFromString(docTxt, 'text/html').querySelector('div.js-dtop-win').cloneNode(true)
      this._windowButClose = this._windowOuter.querySelector('label.js-dtop-win-close')
      this._windowOuter.querySelector('label.js-dtop-win-max').addEventListener('click', () => {
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
      })
      // this._windowInner = this._windowOuter.querySelector('div.js-dtop-win-content')
      let tmpInner = this._windowOuter.querySelector('div.js-dtop-win-content')
      this._winApp = new appClass(tmpInner)
      this._windowOuter.querySelector('div.js-dtop-win-title').textContent = appClass.appName
      if (tmpInner.attachShadow) {
        tmpInner = tmpInner.attachShadow({mode: 'closed'})
      }
      tmpInner.appendChild(this._winApp)
      this._windowOuter.querySelector('img.js-dtop-win-icon').setAttribute('src', appClass.appIconURL)
      // this.appendChild(this._windowOuter)
      this.appendChild(this._windowOuter)
      this.addEventListener('click', () => {
        if (!this.isActive) {
          this._observer.windowFocused(this)
        }
      })
      this._windowButClose.addEventListener('click', this.handleClose.bind(this))
    })
    this._observer.windowCreated(this)
    // this._observer.windowFocused(this)
  }

  connectedCallback() {
    let tmpStyle = document.querySelector('link[rel="stylesheet"][href="js-dtop-window/window.css"]')
    if (!tmpStyle) {
      tmpStyle = document.createElement('link')
      tmpStyle.setAttribute('rel', 'stylesheet')
      tmpStyle.setAttribute('href', 'js-dtop-window/Window.css')
      // this._shadow = this.attachShadow({mode: 'open'})
      // this._shadow.appendChild(tmpStyle)
      document.head.appendChild(tmpStyle)
    }
    // this._observer.windowCreated(this)
    // this._observer.windowFocused(this)
  }

  handleClose() {
    // this._evLsn.forEach((lsn, elem) => {
    //   elem.removeEventListener()
    // })
    this._winApp.endApp()
    this._observer.windowClosed(this)
  }

  //_prepareEvents() {
  //  this._windowButClose.addEventListener('click', () => this._winApp.endApp())
  //}

  ///**
  // * Closes this running window.
  // */
  //closeWindow () {
  //  this._winApp.endApp()
  //  this.dispatchEvent(new CustomEvent(LABEL_CLOSE_EVENT, { detail: this }))
  //}

  ///**
  // * The event label for the window closing event.
  // * @readonly
  // * @type {String}
  // */
  //static get closeWindowEventTypeLabel() {
  //  return LABEL_CLOSE_EVENT
  //}

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
  set windowTop(newTop) {
    this.style.top = newTop + 'px'
  }

  /**
   * The left of the window.
   * @type {Number}
   */
  get windowLeft() {
    return parseInt(this.style.left, 10)
  }

  /**
   * The left of the window.
   * @type {Number}
   */
  set windowLeft(newLeft) {
    this.style.left = newLeft + 'px'
  }

  /**
   * The width of this window.
   * @type {Number}
   */
  get windowWidth() {
    return parseInt(this.style.width, 10)
  }

  /**
   * The width of this window.
   * @type {Number}
   */
  set windowWidth(newWidth) {
    if (newWidth >= MIN_WIDTH) {
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
    if (newHeight >= MIN_HEIGHT) {
      this.style.height = newHeight + 'px'
    }
  }

  /**
   * The z-index of the window.
   * @type {Number}
   */
  get windowZIndex() {
    return this.style.zIndex ? parseInt(this.style.zIndex, 10) : 0
  }

  /**
   * The z-index of the window.
   * @type {Number}
   */
  set windowZIndex(newZIndex) {
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
  get isDisabled() {
    return !this.classList.contains('app-disabled')
  }

  /**
   * Specifies if the window is disabled.
   * @type {Boolean}
   */
  set isDisabled(newIsDisabled) {
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
  get isMaximized() {
    return !!this._beforeMax
  }

  /**
   * The minimum window width.
   * @type {Number}
   */
  static get minWindowWidth () {
    return MIN_WIDTH
  }

  /**
   * The minimum window height.
   * @type {Number}
   */
  static get minWindowHeight() {
    return MIN_HEIGHT
  }
}

window.customElements.define('js-dtop-window', Window)
