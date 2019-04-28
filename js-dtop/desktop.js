import Window from '../js-dtop-window/window.js'
import AbsDtopApp from './abs-dtop-app.js'
import Icon from '../js-dtop-icon/icon.js'

//const CSS_ICON = 'js-dtop-bar-icon'
// const CSS_MINMAXCLOSE = 'js-dtop-win-minmaxclose'
// const CSS_MIN = 'js-dtop-win-min'
// const CSS_MAX = 'js-dtop-win-max'
// const CSS_CLOSE = 'js-dtop-win-close'
// const FLAG_ELEMS_HANDLE_EVENT = false
const CSS_CLASS_ICON_LIST = 'js-dtop-icon-list' //
const DESK_BAR_ICON_THICK = 40 // Desktop-bar thickness in pixels
const DESK_BAR_PAD = 5 // Desktop-bar padding in pixels

/**
 * An Enum used to position the desktop-bar on the desktop.
 * @readonly
 * @enum {Symbol}
 */
export const BarPos = Object.freeze({

  /** Position the bar on top */
  TOP: Symbol('TOP'),

  /** Position the bar on left */
  LEFT: Symbol('LEFT'),

  /** Position the bar on bottom */
  BOTTOM: Symbol('BOTTOM'),

  /** Position the bar on right */
  RIGHT: Symbol('RIGHT')
})

/**
 * An Enum used to specify which part of the window is grabbed/moved
 * @readonly
 * @enum {Symbol}
 */
const WindowGrab = Object.freeze({

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
 * A class that represents a fake window to show when an actual window is resized.
 */
class FakeWindow extends HTMLElement {

  /**
   * Constructor that takes the actual window to fake as a parameter (made just
   * to handle the size and position easily).
   * @param {Window} windowToFake  the actual window to fake
   */
  constructor(windowToFake) {
    super()
    this.classList.add('js-dtop-fake-window')
    this.windowLeft = windowToFake.windowLeft
    this.windowTop = windowToFake.windowTop
    this.windowWidth = windowToFake.windowWidth
    this.windowHeight = windowToFake.windowHeight
    this.style.zIndex = windowToFake.windowZIndex + 1
    this._origWindow = windowToFake
  }

  /**
   * The fake window's left.
   * @type {Number}
   */
  get windowLeft () {
    return parseInt(this.style.left, 10)
  }

  /**
   * The fake window's left.
   * @type {Number}
   */
  set windowLeft (newLeft) {
    this.style.left = newLeft + 'px'
  }

  /**
   * The fake window's top.
   * @type {Number}
   */
  get windowTop () {
    return parseInt(this.style.top, 10)
  }

  /**
   * The fake window's top.
   * @type {Number}
   */
  set windowTop (newTop) {
    this.style.top = newTop + 'px'
  }

  /**
   * The fake window's width.
   * @type {Number}
   */
  get windowWidth () {
    return parseInt(this.style.width, 10)
  }

  /**
   * The fake window's width.
   * @type {Number}
   */
  set windowWidth (newWidth) {
    this.style.width = newWidth + 'px'
  }

  /**
   * The fake window's height.
   * @type {Number}
   */
  get windowHeight() {
    return parseInt(this.style.height, 10)
  }

  /**
   * The fake window's height.
   * @type {Number}
   */
  set windowHeight(newHeight) {
    this.style.height = newHeight + 'px'
  }

  /**
   * The original window that this fake object imitates.
   * @readonly
   * @type {Window}
   */
  get originalWindow () {
    return this._origWindow
  }
}

window.customElements.define('js-dtop-fake-window', FakeWindow)

/**
 * A class that represents the desktop in 'JsDesktop'.
 */
export default class Desktop extends HTMLElement {

  /**
   * Constructor that takes the desktop-bar position as a parameter.
   * @param {BarPos} [barPosition]  the position of the desktop-bar on the desktop (default is BOTTOM)
   */
  constructor (barPosition = BarPos.BOTTOM) {
    super()
    /** @type {Array<Window>} */
    this._windows = new Array(0) // Holds references to all the open windows on desktop
    this._nextWinX = this._nextWinY = 10 // Tracks the next position for the next open window
    let tmpStyle = document.createElement('link')
    tmpStyle.setAttribute('rel', 'stylesheet')
    tmpStyle.setAttribute('href', 'js-dtop/desktop.css')
    // this._shadow = this.attachShadow({mode: 'open'})
    this._deskTop = document.createElement('div')
    this._deskTop.classList.add('js-dtop')
    this._deskBar = document.createElement('div')
    this._deskBarIconsStart = document.createElement('div')
    this._deskBarIconsCenter = document.createElement('div')
    this._deskBarIconsEnd = document.createElement('div')
    this._deskBar.appendChild(this._deskBarIconsStart)
    this._deskBar.appendChild(this._deskBarIconsCenter)
    this._deskBar.appendChild(this._deskBarIconsEnd)
    this._deskBar.classList.add('js-dtop-bar')
    this._deskTopIconList = document.createElement('ul')
    // this._shadow.appendChild(tmpStyle)
    // this._shadow.appendChild(this._deskTop)
    // this._shadow.appendChild(this._deskBar)
    document.head.appendChild(tmpStyle)
    this._deskTopIconList.classList.add(CSS_CLASS_ICON_LIST)
    this._deskTop.appendChild(this._deskTopIconList)
    this._deskBar.style.padding = DESK_BAR_PAD + 'px'
    this.changeBarPosition(barPosition)
    this.appendChild(this._deskTop)
    this.appendChild(this._deskBar)
    this._prepareEvents()
    this._attachEvents()
  }

  //_addDesktopIcon(theIcon) {
  //  let tmpLisItem = document.createElement('li')
  //  let tmpLabel = document.createElement('div')
  //  tmpLisItem.classList.add('js-dtop-icon-list-icon-container')
  //  tmpLisItem.appendChild(theIcon)
  //  tmpLabel.innerText = theIcon.ApplicationClass.appName
  //  tmpLisItem.appendChild(tmpLabel)
  //  this._deskTopList.appendChild(tmpLisItem)
  //}

  /**
   * Composes the path if not supported for the event. From:
   *  https://stackoverflow.com/questions/39245488
   * @param {Element} forElem second window to compare
   * @returns {Array} An array of elements for the path up-tp the 'window' element
   * @private
   */
  static _composedPath (forElem) {
    let outPath = []
    while (forElem) {
      outPath.push(forElem)
      if (forElem.tagName === 'HTML') {
        outPath.push(document)
        outPath.push(window)
        return outPath
      }
      forElem = forElem.parentElement
    }
  }

  /**
   * Prepares the desktop's events needed (intended as private)
   * @private
   */
  _prepareEvents () {
    // this._eventTopClickHandler = ev => { // A handler function to handle 'click' event for the desktop
    //   let tmpPath = ev.path || (ev.composedPath && ev.composedPath()) || Desktop._composedPath(ev.target)
    //   if (ev.target.parentElement.classList.contains(CSS_MINMAXCLOSE)) {
    //     //if (ev.target.classList.contains(CSS_MAX)) {
    //     //  if (tmpPath[4].beforeMax) {
    //     //    let tmpEdges = tmpPath[4].querySelectorAll('.js-dtop-win-moveresize-nocursor')
    //     //    tmpEdges.forEach(elem => {
    //     //      elem.classList.remove('js-dtop-win-moveresize-nocursor')
    //     //      elem.classList.add('js-dtop-win-moveresize')
    //     //    })
    //     //    tmpPath[4].windowLeft = tmpPath[4].beforeMax.x
    //     //    tmpPath[4].windowTop = tmpPath[4].beforeMax.y
    //     //    tmpPath[4].windowWidth = tmpPath[4].beforeMax.width
    //     //    tmpPath[4].windowHeight = tmpPath[4].beforeMax.height
    //     //    tmpPath[4].beforeMax = undefined // delete tmpPath[4].beforeMax
    //     //  } else {
    //     //    let tmpEdges = tmpPath[4].querySelectorAll('.js-dtop-win-moveresize')
    //     //    tmpEdges.forEach(elem => {
    //     //      elem.classList.remove('js-dtop-win-moveresize')
    //     //      elem.classList.add('js-dtop-win-moveresize-nocursor')
    //     //    })
    //     //    tmpPath[4].beforeMax = {
    //     //      x: tmpPath[4].windowLeft,
    //     //      y: tmpPath[4].windowTop,
    //     //      width: tmpPath[4].windowWidth,
    //     //      height: tmpPath[4].windowHeight
    //     //    }
    //     //    tmpPath[4].windowLeft = 0
    //     //    tmpPath[4].windowTop = 0
    //     //    tmpPath[4].windowWidth = this._deskTop.clientWidth
    //     //    tmpPath[4].windowHeight = this._deskTop.clientHeight
    //     //  }
    //     //} else if (ev.target.classList.contains(CSS_MIN)) { // Hope I can continue this
    //     //}
    //   }
    // }
    this._eventTopMouseDownHandler = ev => { // A handler function to handle 'mousedown' event for the desktop
      let tmpPath = ev.path || (ev.composedPath && ev.composedPath()) || Desktop._composedPath(ev.target)
      for (let i = 0; i < tmpPath.length; i++) {  // Check if the event was for inside a window,
        if (tmpPath[i] instanceof Window) {    // then put the window on top (and then handle
          this._putWinOnTop(tmpPath[i])           // the event)
          if (!tmpPath[i].beforeMax && ev.target.classList.contains('js-dtop-win-moveresize')) { // Check if not maximized and in move-resize
            tmpPath[i].isDisabled = true // Disable the window (until mouseup)
            this._fakeWindow = new FakeWindow(tmpPath[i]) // Make a fake of the original
            this._deskTop.appendChild(this._fakeWindow)
            if (ev.target.classList.contains('js-dtop-win-bar')) { // The title bar is grabbed
              document.body.style.cursor = 'move' // To prevent cursor change during move
              this._winGrab = WindowGrab.WINDOW_MOVE // To indicate that a move in progress
              this._moveDif = { // Save the initial position difference for a bit later
                x: ev.clientX - tmpPath[i].windowLeft,
                y: ev.clientY - tmpPath[i].windowTop
              }
            } else if (ev.target.classList.contains('js-dtop-win-topedge')) { // The top edge is grabbed
              document.body.style.cursor = 'ns-resize' // To prevent cursor change during grab
              this._winGrab = WindowGrab.TOP_EDGE // To indicate that top resize in progress
            } else if (ev.target.classList.contains('js-dtop-win-rightedge')) { // The right edge is grabbed
              document.body.style.cursor = 'ew-resize' // To prevent cursor change during grab
              this._winGrab = WindowGrab.RIGHT_EDGE // To indicate that right resize in progress
            } else if (ev.target.classList.contains('js-dtop-win-botedge')) { // The bottom edge is grabbed
              document.body.style.cursor = 'ns-resize' // To prevent cursor change during grab
              this._winGrab = WindowGrab.BOTTOM_EDGE // To indicate that bottom resize in progress
            } else if (ev.target.classList.contains('js-dtop-win-leftedge')) { // The left edge is grabbed
              document.body.style.cursor = 'ew-resize' // To prevent cursor change during grab
              this._winGrab = WindowGrab.LEFT_EDGE // To indicate that left resize in progress
            } else if (ev.target.classList.contains('js-dtop-win-topleftcorner')) { // The top-left corner is grabbed
              document.body.style.cursor = 'nwse-resize' // To prevent cursor change during grab
              this._winGrab = WindowGrab.TOP_LEFT_CORNER
            } else if (ev.target.classList.contains('js-dtop-win-toprightcorner')) { // The top-left corner is grabbed
              document.body.style.cursor = 'nesw-resize' // To prevent cursor change during grab
              this._winGrab = WindowGrab.TOP_RIGHT_CORNER
            } else if (ev.target.classList.contains('js-dtop-win-botrightcorner')) { // The top-left corner is grabbed
              document.body.style.cursor = 'nwse-resize' // To prevent cursor change during grab
              this._winGrab = WindowGrab.BOTTOM_RIGHT_CORNER
            } else if (ev.target.classList.contains('js-dtop-win-botleftcorner')) { // The top-left corner is grabbed
              document.body.style.cursor = 'nesw-resize' // To prevent cursor change during grab
              this._winGrab = WindowGrab.BOTTOM_LEFT_CORNER
            }
            this._deskTop.addEventListener('mousemove', this._eventTopMouseMoveHandler) // It is better to let the '_deskTop' and not the 'document' to handle it
            document.addEventListener('mouseup', this._eventDocMouseUpHandler)
          }
          break
        }
      }
    }
    let tmpTopGrab = ev => {
      let tmpHtTE = this._fakeWindow.windowHeight + this._fakeWindow.windowTop + this._deskTop.offsetTop - ev.clientY
      if (tmpHtTE < Window.minWindowHeight) {
        this._fakeWindow.windowTop += this._fakeWindow.windowHeight - Window.minWindowHeight
        this._fakeWindow.windowHeight = Window.minWindowHeight
      } else {
        this._fakeWindow.windowTop = ev.clientY - this._deskTop.offsetTop
        this._fakeWindow.windowHeight = tmpHtTE
      }
    }
    let tmpRightGrab = ev => {
      let tmpWdRE = ev.clientX - this._fakeWindow.windowLeft - this._deskTop.offsetLeft
      this._fakeWindow.windowWidth = tmpWdRE < Window.minWindowWidth ? Window.minWindowWidth : tmpWdRE
    }
    let tmpBotGrab = ev => {
      let tmpHtBE = ev.clientY - this._fakeWindow.windowTop - this._deskTop.offsetTop
      this._fakeWindow.windowHeight = tmpHtBE < Window.minWindowHeight ? Window.minWindowHeight : tmpHtBE
    }
    let tmpLeftGrab = ev => {
      let tmpWdLE = this._fakeWindow.windowWidth + this._fakeWindow.windowLeft + this._deskTop.offsetLeft - ev.clientX
      if (tmpWdLE < Window.minWindowWidth) {
        this._fakeWindow.windowLeft += this._fakeWindow.windowWidth - Window.minWindowWidth
        this._fakeWindow.windowWidth = Window.minWindowWidth
      } else {
        this._fakeWindow.windowLeft = ev.clientX - this._deskTop.offsetLeft
        this._fakeWindow.windowWidth = tmpWdLE
      }
    }
    this._eventTopMouseMoveHandler = ev => { // A handler function to handle 'mousemove' event for the desktop
      if (this._fakeWindow) { // Only handle if there is a fake window
        switch (this._winGrab) {
          case WindowGrab.WINDOW_MOVE:
            this._fakeWindow.windowLeft = ev.clientX - this._moveDif.x //
            this._fakeWindow.windowTop = ev.clientY - this._moveDif.y  // Move the fake window according to difference
            break
          case WindowGrab.TOP_EDGE:
            tmpTopGrab(ev)
            break
          case WindowGrab.RIGHT_EDGE:
            tmpRightGrab(ev)
            break
          case WindowGrab.BOTTOM_EDGE:
            tmpBotGrab(ev)
            break
          case WindowGrab.LEFT_EDGE:
            tmpLeftGrab(ev)
            break
          case WindowGrab.TOP_LEFT_CORNER:
            tmpTopGrab(ev)
            tmpLeftGrab(ev)
            break
          case WindowGrab.TOP_RIGHT_CORNER:
            tmpTopGrab(ev)
            tmpRightGrab(ev)
            break
          case WindowGrab.BOTTOM_RIGHT_CORNER:
            tmpBotGrab(ev)
            tmpRightGrab(ev)
            break
          case WindowGrab.BOTTOM_LEFT_CORNER:
            tmpBotGrab(ev)
            tmpLeftGrab(ev)
        }
      }
    }
    let tmpTopRel = () => {
      this._fakeWindow.originalWindow.windowTop = this._fakeWindow.windowTop
      this._fakeWindow.originalWindow.windowHeight = this._fakeWindow.windowHeight
    }
    let tmpRightRel = () => {
      this._fakeWindow.originalWindow.windowWidth = this._fakeWindow.windowWidth
    }
    let tmpBotRel = () => {
      this._fakeWindow.originalWindow.windowHeight = this._fakeWindow.windowHeight
    }
    let tmpLeftRel = () => {
      this._fakeWindow.originalWindow.windowLeft = this._fakeWindow.windowLeft
      this._fakeWindow.originalWindow.windowWidth = this._fakeWindow.windowWidth
    }
    this._eventDocMouseUpHandler = () => { // A handler function to handle 'mouseup' event for the 'document'
      // First, we remove the attached listener functions
      this._deskTop.removeEventListener('mousemove', this._eventTopMouseMoveHandler)
      document.removeEventListener('mouseup', this._eventDocMouseUpHandler)
      if (this._fakeWindow) { // Only handle if there is a fake window
        this._fakeWindow.originalWindow.isDisabled = false // Set original window back to normal
        switch (this._winGrab) {
          case WindowGrab.WINDOW_MOVE:
            this._fakeWindow.originalWindow.windowLeft = this._fakeWindow.windowLeft
            this._fakeWindow.originalWindow.windowTop = this._fakeWindow.windowTop
            this._moveDif = undefined
            break
          case WindowGrab.TOP_EDGE:
            tmpTopRel()
            break
          case WindowGrab.RIGHT_EDGE:
            tmpRightRel()
            break
          case WindowGrab.BOTTOM_EDGE:
            tmpBotRel()
            break
          case WindowGrab.LEFT_EDGE:
            tmpLeftRel()
            break
          case WindowGrab.TOP_LEFT_CORNER:
            tmpTopRel()
            tmpLeftRel()
            break
          case WindowGrab.TOP_RIGHT_CORNER:
            tmpTopRel()
            tmpRightRel()
            break
          case WindowGrab.BOTTOM_RIGHT_CORNER:
            tmpRightRel()
            tmpBotRel()
            break
          case WindowGrab.BOTTOM_LEFT_CORNER:
            tmpBotRel()
            tmpLeftRel()
        }
        this._deskTop.removeChild(this._fakeWindow)
        this._fakeWindow = undefined
        this._winGrab = undefined // To indicate move/grab end
        if (document.body.style.cursor !== 'default') {
          document.body.style.cursor = 'default'
        }
      }
    }
    this._eventWinResizeHandlerHandler = () => { // A handler function to handle 'resize' event for the 'window'
      this._windows.forEach(win => {
        if (win.isMaximized) { // Loop and update position and size of every maximized window
          win.windowLeft = 0
          win.windowTop = 0
          win.windowWidth = this._deskTop.clientWidth
          win.windowHeight = this._deskTop.clientHeight
        }
      })
    }
  }

  /**
   * Attach the desktop's events.
   * @private
   */
  _attachEvents () {
    // My idea was to let every window handle its own events, but it seems that dispaching the event and
    // handle it here is better as recomended (while letting the window handle it seems more organized)
    // this._deskTop.addEventListener('click', this._eventTopClickHandler)
    this._deskTop.addEventListener('mousedown', this._eventTopMouseDownHandler)
    window.addEventListener('resize', this._eventWinResizeHandlerHandler)
  }

  /**
   * Puts a window on top of all other windows (or add it to the other windows and put it on top)
   * @param {Window} [theWindow] the window to be put on top (or added on top). If omitted, the last window will be used.
   * @private
   */
  _putWinOnTop (theWindow) {
    theWindow = !theWindow && this._windows.length ? this._windows[this._windows.length - 1] : theWindow // If 'theWindow' is omitted, use the last window
    if (theWindow) {
      let tmpIndex = this._windows.indexOf(theWindow)
      if (this._windows.length && this._windows[this._windows.length - 1].isActive) {
        this._windows[this._windows.length - 1].isActive = false
      }
      if (tmpIndex === -1) {
        theWindow.windowZIndex = 100 + this._windows.length
        this._windows.push(theWindow)
      } else {
        theWindow.windowZIndex = 99 + this._windows.length
        for (let i = tmpIndex; i < this._windows.length - 1; i++) { // Loop and decrease the zIndex of the rest of windows
          this._windows[i] = this._windows[i + 1]
          this._windows[i].windowZIndex--
        }
        this._windows[this._windows.length - 1] = theWindow
        // this._windows.sort((win1, win2) => win1.windowZIndex - win2.windowZIndex) // Sort with provided comparer (according to zIndex)
      }
      theWindow.isActive = true
    }
  }

  /**
   * Changes the desktop-bar position on the desktop.
   * @param {BarPos} barPosition  the new position of the desktop-bar on the desktop
   */
  changeBarPosition (barPosition) {
    let tmpHorBar = () => {
      this._deskTop.style.width = '100vw'
      this._deskTop.style.height = 'calc(100vh - ' + (2 * DESK_BAR_PAD + DESK_BAR_ICON_THICK) + 'px)'
      this._deskBar.style.width = '100vw'
      this._deskBar.style.height = DESK_BAR_ICON_THICK + 'px'
      this._deskBar.style.flexDirection = 'row'
    }
    let tmpVerBar = () => {
      this._deskTop.style.width = 'calc(100vw - ' + (2 * DESK_BAR_PAD + DESK_BAR_ICON_THICK) + 'px)'
      this._deskTop.style.height = '100vh'
      this._deskBar.style.width = DESK_BAR_ICON_THICK + 'px'
      this._deskBar.style.height = '100vh'
      this._deskBar.style.flexDirection = 'column'
    }
    switch (barPosition) {
      case BarPos.TOP:
        tmpHorBar()
        this._deskTop.style.bottom = '0'
        break
      case BarPos.LEFT:
        tmpVerBar()
        this._deskTop.style.right = '0'
        break
      case BarPos.BOTTOM:
        tmpHorBar()
        this._deskBar.style.bottom = '0'
        break
      case BarPos.RIGHT:
        tmpVerBar()
        this._deskBar.style.right = '0'
        break
      default:
        throw new TypeError('The passed \'barPosition\' value should be one of the \'BarPos\' constant values.')
    }
  }

  /**
   * Adds an app to put inside the window.
   * @param {typeof AbsDtopApp} AppClass the class for the application to be put in the window (must extend 'AbsDtopApp')
   */
  addApp (AppClass) {
    if (!(AppClass.prototype instanceof AbsDtopApp)) { // Check if it is actually a js-desktop-app class
      throw new TypeError('The passed \'appClass\' argument must be a class that extends the \'AbsDtopApp\' abstract class.')
    }
    /*let tmpIcon =*/ new Icon(this, AppClass, DESK_BAR_ICON_THICK) // Prepare the app-icon (on bar and desktop) // TODO: make it better
  }

  /**
   *
   * @param {HTMLElement} iconElement
   */
  placeDesktopIcon (iconElement) {
    this._deskTopIconList.appendChild(iconElement)
  }

  /**
   *
   * @param {HTMLElement} iconElement
   */
  placeBarIcon (iconElement) {
    // this._deskBar.appendChild(iconElement)
    this._deskBarIconsCenter.appendChild(iconElement)
  }

  /**
   *
   * @param {Window} theWindow
   */
  windowCreated (theWindow) {
    if (this._windows.indexOf(theWindow) === -1) { // Extra check just in case
      theWindow.windowLeft = this._nextWinX
      theWindow.windowTop = this._nextWinY
      this._nextWinX = (this._nextWinX + 20) % (this._deskTop.clientWidth / 3 * 2)
      this._nextWinY = (this._nextWinY + 10) % (this._deskTop.clientHeight / 3 * 2)
      // theWindow.windowZIndex = 100
      this._deskTop.appendChild(theWindow)
      // this._windows.push(theWindow)
      // this._windows.unshift(theWindow)
      this._putWinOnTop(theWindow)
    }
  }

  /**
   *
   * @param {Window} theWindow
   */
  windowClosed (theWindow) {
    this._putWinOnTop(theWindow)
    if (this._windows.length && this._windows[this._windows.length - 1] === theWindow) {
      this._windows.pop() // Remove 'theWindow' window (it is on top now)
    }
    this._deskTop.removeChild(theWindow)
    this._putWinOnTop() // Put the other last window on top (if any)
  }

  /**
   *
   * @param {Window} theWindow
   */
  windowMaximized (theWindow) {
    theWindow.windowLeft = 0
    theWindow.windowTop = 0
    theWindow.windowWidth = this._deskTop.clientWidth
    theWindow.windowHeight = this._deskTop.clientHeight
  }

  /**
   *
   * @param {Window} theWindow
   */
  windowMinimized (theWindow) { }

  /**
   *
   * @param {Window} theWindow
   */
  windowFocused (theWindow) {
    if (!theWindow.isActive) {
      this._putWinOnTop(theWindow)
    }
  }
}

window.customElements.define('js-desktop', Desktop)
