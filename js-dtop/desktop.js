import Window, {WindowGrabType} from './window/window.js'
import AbsApp from './app/abs-app.js'
import Settings from './app-settings/settings.js'

const DTOP_PATH = 'js-dtop/'
const DTOP_CSS_FILE = DTOP_PATH + 'css/desktop.css'
const DTOP_BGROUND_FILE = DTOP_PATH + 'img/desktop-background.jpg'
const DTOP_BAR_ICON_THICK = 40 // Desktop-bar/icon thickness in pixels
const DTOP_BAR_PAD = 5 // Desktop-bar padding in pixels
const DTOP_WIN_X_SHIFT = 15 // New window X position shift from the previous window
const DTOP_WIN_Y_SHIFT = 30 // New window Y position shift from the previous window
const DTOP_TAG = 'js-desktop'
const DTOP_FAKE_WIN_TAG = 'js-dtop-fake-window'
const CSS_CLASS_DTOP = 'js-dtop' // CSS class for the desktop area
const CSS_CLASS_DTOP_BAR = 'js-dtop-bar' // CSS class for the desktop-bar
const CSS_CLASS_DTOP_BAR_ICONS_TOP = 'js-dtop-bar-icon-container-center-top' // CSS class for the top desktop-bar icon container
const CSS_CLASS_DTOP_BAR_ICONS_LEFT = 'js-dtop-bar-icon-container-center-left' // CSS class for the left desktop-bar icon container
const CSS_CLASS_DTOP_BAR_ICONS_BOT = 'js-dtop-bar-icon-container-center-bot' // CSS class for the bottom desktop-bar icon container
const CSS_CLASS_DTOP_BAR_ICONS_RIGHT = 'js-dtop-bar-icon-container-center-right' // CSS class for the right desktop-bar icon container
const CSS_CLASS_ICON_LIST = 'js-dtop-icon-list' // CSS class for the list that contains the desktop icons
const CSS_CLASS_ICON = 'js-dtop-icon'
const CSS_CLASS_DESK_ICON = 'js-dtop-icon-list-icon-container'
const EVENT_DESKBAR_MOVED = 'desktop-bar-moved'

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
 * A class that represents a fake window to show when an actual window is resized.
 */
class FakeWindow extends HTMLElement {

  /**
   * Constructor that takes the actual window to fake as a parameter (made just
   * to handle the size and position easily).
   * @param {Window} windowToFake  the actual window to fake
   */
  constructor (windowToFake) {
    super()
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
  get windowHeight () {
    return parseInt(this.style.height, 10)
  }

  /**
   * The fake window's height.
   * @type {Number}
   */
  set windowHeight (newHeight) {
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

window.customElements.define(DTOP_FAKE_WIN_TAG, FakeWindow)

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
    this._nextWinX = this._nextWinY = DTOP_WIN_X_SHIFT // Tracks the next position for the next open window
    let tmpStyle = document.createElement('link')
    tmpStyle.setAttribute('rel', 'stylesheet')
    tmpStyle.setAttribute('href', DTOP_CSS_FILE)
    // this._shadow = this.attachShadow({mode: 'open'})
    this._deskTop = document.createElement('div')
    this._deskTop.classList.add(CSS_CLASS_DTOP)
    this._deskTop.style.backgroundImage = 'url(\'' + DTOP_BGROUND_FILE + '\')'
    this._deskBar = document.createElement('div')
    this._deskBarIconsStart = document.createElement('div')
    this._deskBarIconsCenter = document.createElement('div')
    this._deskBarIconsEnd = document.createElement('div')
    this._deskBar.appendChild(this._deskBarIconsStart)
    this._deskBar.appendChild(this._deskBarIconsCenter)
    this._deskBar.appendChild(this._deskBarIconsEnd)
    this._deskBar.classList.add(CSS_CLASS_DTOP_BAR)
    this._deskTopIconList = document.createElement('ul')
    document.head.appendChild(tmpStyle)
    this._deskTopIconList.classList.add(CSS_CLASS_ICON_LIST)
    this._deskTop.appendChild(this._deskTopIconList)
    this._deskBar.style.padding = DTOP_BAR_PAD + 'px'
    this.desktopBarPosition = barPosition
    this.appendChild(this._deskTop)
    this.appendChild(this._deskBar)
    this._prepareRemovableEventHandlers()
    window.addEventListener('resize', this._handleWebPageResize.bind(this))
    this._deskBarIconsStart.appendChild(this._iconFactory(Settings, true))
  }

  // /**
  //  * Composes the path if not supported for the event. From:
  //  *  https://stackoverflow.com/questions/39245488
  //  * @param {Element} forElem second window to compare
  //  * @returns {Array} An array of elements for the path up-tp the 'window' element
  //  * @private
  //  */
  // static _composedPath (forElem) {
  //   let outPath = []
  //   while (forElem) {
  //     outPath.push(forElem)
  //     if (forElem.tagName === 'HTML') {
  //       outPath.push(document)
  //       outPath.push(window)
  //       return outPath
  //     }
  //     forElem = forElem.parentElement
  //   }
  // }

  /**
   * Prepares the desktop's removable event-handlers needed (intended as private)
   * @private
   */
  _prepareRemovableEventHandlers () {
    this._handleDesktopMouseMove = ev => { // A handler function to handle 'mousemove' event for the desktop
      if (this._fakeWindow) { // Only handle if there is a fake window
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
        switch (this._winGrab) {
          case WindowGrabType.WINDOW_MOVE:
            this._fakeWindow.windowLeft = ev.clientX - this._moveDif.x //
            this._fakeWindow.windowTop = ev.clientY - this._moveDif.y  // Move the fake window according to difference
            break
          case WindowGrabType.TOP_EDGE:
            tmpTopGrab(ev)
            break
          case WindowGrabType.RIGHT_EDGE:
            tmpRightGrab(ev)
            break
          case WindowGrabType.BOTTOM_EDGE:
            tmpBotGrab(ev)
            break
          case WindowGrabType.LEFT_EDGE:
            tmpLeftGrab(ev)
            break
          case WindowGrabType.TOP_LEFT_CORNER:
            tmpTopGrab(ev)
            tmpLeftGrab(ev)
            break
          case WindowGrabType.TOP_RIGHT_CORNER:
            tmpTopGrab(ev)
            tmpRightGrab(ev)
            break
          case WindowGrabType.BOTTOM_RIGHT_CORNER:
            tmpBotGrab(ev)
            tmpRightGrab(ev)
            break
          case WindowGrabType.BOTTOM_LEFT_CORNER:
            tmpBotGrab(ev)
            tmpLeftGrab(ev)
        }
      }
    }
    this._handleDocMouseUp = () => { // A handler function to handle 'mouseup' event for the 'document'
      // First, we remove the attached listener functions
      this._deskTop.removeEventListener('mousemove', this._handleDesktopMouseMove)
      document.removeEventListener('mouseup', this._handleDocMouseUp)
      if (this._fakeWindow) { // Only handle if there is a fake window
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
        this._fakeWindow.originalWindow.isDisabled = false // Set original window back to normal
        switch (this._winGrab) {
          case WindowGrabType.WINDOW_MOVE:
            this._fakeWindow.originalWindow.windowLeft = this._fakeWindow.windowLeft
            this._fakeWindow.originalWindow.windowTop = this._fakeWindow.windowTop
            this._moveDif = undefined
            break
          case WindowGrabType.TOP_EDGE:
            tmpTopRel()
            break
          case WindowGrabType.RIGHT_EDGE:
            tmpRightRel()
            break
          case WindowGrabType.BOTTOM_EDGE:
            tmpBotRel()
            break
          case WindowGrabType.LEFT_EDGE:
            tmpLeftRel()
            break
          case WindowGrabType.TOP_LEFT_CORNER:
            tmpTopRel()
            tmpLeftRel()
            break
          case WindowGrabType.TOP_RIGHT_CORNER:
            tmpTopRel()
            tmpRightRel()
            break
          case WindowGrabType.BOTTOM_RIGHT_CORNER:
            tmpRightRel()
            tmpBotRel()
            break
          case WindowGrabType.BOTTOM_LEFT_CORNER:
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
  }

  /**
   * Supposed to handle resizing the maximized windows inside the desktop when the web-page resize
   * @private
   */
  _handleWebPageResize () {
    this._windows.forEach(win => {
      if (win.isMaximized) { // Loop and update position and size of every maximized window
        win.windowLeft = 0
        win.windowTop = 0
        win.windowWidth = this._deskTop.clientWidth
        win.windowHeight = this._deskTop.clientHeight
      }
    })
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
   * Used to create an icon to start an app.
   * @param {typeof AbsApp} appClass    the app's class that the created icon will run
   * @param {Boolean} isBarIcon         'true' to create a desktop-bar icon ('false' for desktop icon)
   * @return {HTMLElement}              the created icon for the specified app
   * @private
   */
  _iconFactory (appClass, isBarIcon) {
    let outIcon = document.createElement('div')// (isBarIcon ? 'div' : 'li')
    outIcon.classList.add(CSS_CLASS_ICON)
    outIcon.style.width = outIcon.style.height = DTOP_BAR_ICON_THICK + 'px'
    outIcon.style.backgroundImage = 'url("' + appClass.appIconURL + '")'
    outIcon.appClass = appClass
    if (isBarIcon) {
    } else {
      let tmpOuter = document.createElement('li') // An outer container for the desktop icon
      let tmpLabel = document.createElement('div') // Desktop icon label
      tmpLabel.innerText = appClass.appName
      tmpOuter.classList.add(CSS_CLASS_DESK_ICON)
      tmpOuter.appendChild(outIcon)
      tmpOuter.appendChild(tmpLabel)
      outIcon = tmpOuter
    }
    outIcon.addEventListener('click', () => {
      new Window(this, appClass) // TODO: Make it better
    })
    return outIcon
  }

  /**
   * Specifies the desktop-bar position on the desktop.
   * @type {BarPos}
   */
  get desktopBarPosition () {
    return this._deskBarPos
  }

  /**
   * Specifies the desktop-bar position on the desktop.
   * @type {BarPos}
   */
  set desktopBarPosition (newPos) {
    let tmpHorBar = () => {
      this._deskTop.style.width = '100vw'
      this._deskTop.style.height = 'calc(100vh - ' + (2 * DTOP_BAR_PAD + DTOP_BAR_ICON_THICK) + 'px)'
      this._deskBar.style.width = '100vw'
      this._deskBar.style.height = DTOP_BAR_ICON_THICK + 'px'
      this._deskBar.style.flexDirection = 'row'
    }
    let tmpVerBar = () => {
      this._deskTop.style.width = 'calc(100vw - ' + (2 * DTOP_BAR_PAD + DTOP_BAR_ICON_THICK) + 'px)'
      this._deskTop.style.height = '100vh'
      this._deskBar.style.width = DTOP_BAR_ICON_THICK + 'px'
      this._deskBar.style.height = '100vh'
      this._deskBar.style.flexDirection = 'column'
    }
    switch (newPos) {
      case BarPos.TOP:
        tmpHorBar()
        this._deskTop.style.top = ''
        this._deskTop.style.right = ''
        this._deskTop.style.bottom = '0'
        this._deskTop.style.left = ''
        this._deskBar.style.top = '0'
        this._deskBar.style.right = ''
        this._deskBar.style.bottom = ''
        this._deskBar.style.left = ''
        this._deskBarIconsCenter.className = CSS_CLASS_DTOP_BAR_ICONS_TOP
        break
      case BarPos.LEFT:
        tmpVerBar()
        this._deskTop.style.top = ''
        this._deskTop.style.right = '0'
        this._deskTop.style.bottom = ''
        this._deskTop.style.left = ''
        this._deskBar.style.top = ''
        this._deskBar.style.right = ''
        this._deskBar.style.bottom = ''
        this._deskBar.style.left = '0'
        this._deskBarIconsCenter.className = CSS_CLASS_DTOP_BAR_ICONS_LEFT
        break
      case BarPos.BOTTOM:
        tmpHorBar()
        this._deskTop.style.top = '0'
        this._deskTop.style.right = ''
        this._deskTop.style.bottom = ''
        this._deskTop.style.left = ''
        this._deskBar.style.top = ''
        this._deskBar.style.right = ''
        this._deskBar.style.bottom = '0'
        this._deskBar.style.left = ''
        this._deskBarIconsCenter.className = CSS_CLASS_DTOP_BAR_ICONS_BOT
        break
      case BarPos.RIGHT:
        tmpVerBar()
        this._deskTop.style.top = ''
        this._deskTop.style.right = ''
        this._deskTop.style.bottom = ''
        this._deskTop.style.left = '0'
        this._deskBar.style.top = ''
        this._deskBar.style.right = '0'
        this._deskBar.style.bottom = ''
        this._deskBar.style.left = ''
        this._deskBarIconsCenter.className = CSS_CLASS_DTOP_BAR_ICONS_RIGHT
        break
      default:
        throw new TypeError('The passed new \'desktopBarPosition\' value should be one of the \'BarPos\' constant values.')
    }
    this._handleWebPageResize()
    this._deskBarPos = newPos
    this.dispatchEvent(new Event(EVENT_DESKBAR_MOVED))
  }

  /**
   * Adds an app to put inside the window.
   * @param {typeof AbsApp} appClass  the class for the application to be put in the window (must extend 'AbsApp')
   */
  addApp (appClass) {
    if (!(appClass.prototype instanceof AbsApp)) { // Check if it is actually a js-desktop-app class
      throw new TypeError('The passed \'appClass\' argument must be a class that extends the \'AbsApp\' abstract class.')
    }
    this._deskBarIconsCenter.appendChild(this._iconFactory(appClass, true)) // Add desktop-bar icon
    this._deskTopIconList.appendChild(this._iconFactory(appClass, false)) // Add desktop icon
  }

  /**
   * Used to inform that the specified window is created now.
   * @param {Window} theWindow  the window that is created
   */
  windowCreated (theWindow) {
    if (this._windows.indexOf(theWindow) === -1) { // Extra check just in case
      theWindow.windowLeft = this._nextWinX
      theWindow.windowTop = this._nextWinY
      this._nextWinX = (this._nextWinX + DTOP_WIN_Y_SHIFT) % (this._deskTop.clientWidth / 3 * 2) // Set next window X
      this._nextWinY = (this._nextWinY + DTOP_WIN_X_SHIFT) % (this._deskTop.clientHeight / 3 * 2) // Set next window Y
      this._deskTop.appendChild(theWindow)
      this._putWinOnTop(theWindow)
    }
  }

  /**
   * Used to inform that the specified window is closed now.
   * @param {Window} theWindow  the window that is closed
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
   * Used to inform that the specified window is maximized now.
   * @param {Window} theWindow  the window that is maximized
   */
  windowMaximized (theWindow) {
    theWindow.windowLeft = 0
    theWindow.windowTop = 0
    theWindow.windowWidth = this._deskTop.clientWidth
    theWindow.windowHeight = this._deskTop.clientHeight
  }

  /**
   * Used to inform that the specified window is minimized now.
   * @param {Window} theWindow  the window that is minimized
   */
  windowMinimized (theWindow) { }

  /**
   * Used to inform that the specified window has focus now.
   * @param {Window} theWindow  the window that has focus
   */
  windowFocused (theWindow) {
    if (!theWindow.isActive) {
      this._putWinOnTop(theWindow)
    }
  }

  /**
   * Used to inform that the specified window is being grabbed now (for resizing or moving).
   * @param {Window} theWindow          the window that has focus
   * @param {WindowGrabType} grabType   specifies the type of grab (which part of the window is grabbed/moved)
   * @param {MouseEvent} mouseEv        the grabbing mouse-event related to grabbing
   */
  windowGrabbed (theWindow, grabType, mouseEv) {
    this._putWinOnTop(theWindow) // First put window on top
    theWindow.isDisabled = true // Disable the window (until mouseup)
    this._fakeWindow = new FakeWindow(theWindow) // Make a fake of the original
    this._deskTop.appendChild(this._fakeWindow)
    this._winGrab = grabType // To indicate that a move/grab in progress
    switch (grabType) {
      case WindowGrabType.WINDOW_MOVE: // The title bar is grabbed (moving)
        document.body.style.cursor = 'move' // To prevent cursor change during move
        this._moveDif = { // Save the initial position difference for a bit later
          x: mouseEv.clientX - theWindow.windowLeft,
          y: mouseEv.clientY - theWindow.windowTop
        }
        break
      case WindowGrabType.TOP_EDGE: // The top edge is grabbed
      case WindowGrabType.BOTTOM_EDGE: // The bottom edge is grabbed
        document.body.style.cursor = 'ns-resize' // To prevent cursor change during grab
        break
      case WindowGrabType.LEFT_EDGE: // The left edge is grabbed
      case WindowGrabType.RIGHT_EDGE: // The right edge is grabbed
        document.body.style.cursor = 'ew-resize' // To prevent cursor change during grab
        break
      case WindowGrabType.TOP_LEFT_CORNER: // The top-left corner is grabbed
      case WindowGrabType.BOTTOM_RIGHT_CORNER: // The bottom-right corner is grabbed
        document.body.style.cursor = 'nwse-resize' // To prevent cursor change during grab
        break
      case WindowGrabType.TOP_RIGHT_CORNER: // The top-right corner is grabbed
      case WindowGrabType.BOTTOM_LEFT_CORNER: // The bottom-left corner is grabbed
        document.body.style.cursor = 'nesw-resize' // To prevent cursor change during grab
    }
    this._deskTop.addEventListener('mousemove', this._handleDesktopMouseMove) // It is better to let the '_deskTop' and not the 'document' handle it
    document.addEventListener('mouseup', this._handleDocMouseUp)
  }

  /**
   * Used to inform that the window's working desktop object is requested.
   * @return {Desktop}   the requested desktop object that the window runs on
   */
  desktopObjectRequested () {
    return this
  }
}

window.customElements.define(DTOP_TAG, Desktop)
