import Window, {WIN_EVENTS, WindowGrabType} from './window/window.js'
import SilhouetteWindow from './window/silhouette-window.js'
import AbsApp from './app/abs-app.js'
import Settings from './app-settings/settings.js'
import ConfigStorage, {CONF_CONSTS, CONF_KEYS_EVENTS, PositionEdge} from './config-storage.js'
import Icon from './icon/icon.js'

const DTOP_CSS_FILE = CONF_CONSTS.DTOP_PATH + 'css/desktop.css'
const DTOP_BGROUND_FILE = CONF_CONSTS.DTOP_PATH + 'img/desktop-background.jpg'
const HTML_TAG_DTOP = 'js-desktop' // Desktop's HTML tag name
const HTML_CLASS_DTOP = 'js-dtop' // HTML/CSS class for the desktop area (excluding the taskbar area)
const HTML_CLASS_TASKBAR = 'js-dtop-taskbar' // HTML/CSS class for the taskbar
const HTML_CLASS_TASKBAR_ICONS_TOP = 'js-dtop-taskbar-icon-container-top' // HTML/CSS class for the top taskbar icon container
const HTML_CLASS_TASKBAR_ICONS_LEFT = 'js-dtop-taskbar-icon-container-left' // HTML/CSS class for the left taskbar icon container
const HTML_CLASS_TASKBAR_ICONS_BOT = 'js-dtop-taskbar-icon-container-bot' // HTML/CSS class for the bottom taskbar icon container
const HTML_CLASS_TASKBAR_ICONS_RIGHT = 'js-dtop-taskbar-icon-container-right' // HTML/CSS class for the right taskbar icon container
const HTML_CLASS_ICON_LIST = 'js-dtop-icon-list' // HTML/CSS class for the list that contains the desktop icons

/**
 * A class that represents the desktop in 'JsDesktop'.
 */
export default class Desktop extends HTMLElement {

  /**
   * Default Constructor.
   */
  constructor () {
    super()
    this._silhWin = undefined // Used to store a rectangle that silhouettes a moved/re-sized window
    this._grabType = undefined // Used to store the type of the pointer grab when a window starts to move/re-size
    this._moveDif = undefined // Used to store the window's move difference when a window is moved
    /** @type {Array<Window>} */
    this._windows = [] // Used to store references to all the visible windows on desktop
    this._conf = new ConfigStorage() // Object that holds the desktop configurations
    let tmpSetIcon = new Icon(this._conf, Settings, this._conf)
    this._nextWinY = this._nextWinX = CONF_CONSTS.WIN_NEW_X_SHIFT // Tracks the next position for the next open window
    this._deskTop = document.createElement('div')
    this._deskTop.classList.add(HTML_CLASS_DTOP)
    this._deskTop.style.backgroundImage = 'url(\'' + DTOP_BGROUND_FILE + '\')'
    this._deskBar = document.createElement('div')
    this._deskBarIconsStart = document.createElement('div')
    this._deskBarIconsCenter = document.createElement('div')
    this._deskBarIconsEnd = document.createElement('div')
    this._deskBar.appendChild(this._deskBarIconsStart)
    this._deskBar.appendChild(this._deskBarIconsCenter)
    this._deskBar.appendChild(this._deskBarIconsEnd)
    this._deskBar.classList.add(HTML_CLASS_TASKBAR)
    this._deskTopIconList = document.createElement('ul')
    this._deskTopIconList.classList.add(HTML_CLASS_ICON_LIST)
    this._deskTop.appendChild(this._deskTopIconList)
    this._deskBar.style.padding = CONF_CONSTS.TASKBAR_PAD + 'px'
    this._updateTaskBarPos()
    this.appendChild(this._deskTop)
    this.appendChild(this._deskBar)
    this._prepareRemovableEventHandlers()
    this._conf.addEventListener(CONF_KEYS_EVENTS.TASKBAR_POS, this._updateTaskBarPos.bind(this)) // Update taskbar position when changed
    window.addEventListener('resize', this._handleWebPageResize.bind(this))
    tmpSetIcon.addEventListener('click', this._handleIconClick.bind(this))
    this._deskBarIconsStart.appendChild(tmpSetIcon)
  }

  connectedCallback () {
    let tmpStyle = document.createElement('link')
    tmpStyle.setAttribute('rel', 'stylesheet')
    tmpStyle.setAttribute('href', DTOP_CSS_FILE)
    document.head.appendChild(tmpStyle)
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
    this._handleDesktopPointerMove = ev => { // A handler function to handle pointer-/mouse-move event for the desktop
      if (this._silhWin) { // Only handle if there is a silhouette window
        let tmpTopGrab = ev => {
          let tmpHtTE = this._silhWin.windowHeight + this._silhWin.windowTop + this._deskTop.offsetTop - ev.clientY
          if (tmpHtTE < Window.minWindowHeight) {
            this._silhWin.windowTop += this._silhWin.windowHeight - Window.minWindowHeight
            this._silhWin.windowHeight = Window.minWindowHeight
          } else {
            this._silhWin.windowTop = ev.clientY - this._deskTop.offsetTop
            this._silhWin.windowHeight = tmpHtTE
          }
        }
        let tmpRightGrab = ev => {
          let tmpWdRE = ev.clientX - this._silhWin.windowLeft - this._deskTop.offsetLeft
          this._silhWin.windowWidth = tmpWdRE < Window.minWindowWidth ? Window.minWindowWidth : tmpWdRE
        }
        let tmpBotGrab = ev => {
          let tmpHtBE = ev.clientY - this._silhWin.windowTop - this._deskTop.offsetTop
          this._silhWin.windowHeight = tmpHtBE < Window.minWindowHeight ? Window.minWindowHeight : tmpHtBE
        }
        let tmpLeftGrab = ev => {
          let tmpWdLE = this._silhWin.windowWidth + this._silhWin.windowLeft + this._deskTop.offsetLeft - ev.clientX
          if (tmpWdLE < Window.minWindowWidth) {
            this._silhWin.windowLeft += this._silhWin.windowWidth - Window.minWindowWidth
            this._silhWin.windowWidth = Window.minWindowWidth
          } else {
            this._silhWin.windowLeft = ev.clientX - this._deskTop.offsetLeft
            this._silhWin.windowWidth = tmpWdLE
          }
        }
        switch (this._grabType) {
          case WindowGrabType.WINDOW_MOVE:
            this._silhWin.windowLeft = ev.clientX - this._moveDif.x //
            this._silhWin.windowTop = ev.clientY - this._moveDif.y  // Move the silhouette window according to difference
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
    this._handleDocPointerUp = () => { // A handler function to handle pointer-/mouse-up event for the 'document'
      // First, we remove the attached listener functions
      this._deskTop.removeEventListener(window.PointerEvent ? 'pointermove' : 'mousemove', this._handleDesktopPointerMove)
      document.removeEventListener(window.PointerEvent ? 'pointerup' : 'mouseup', this._handleDocPointerUp)
      if (this._silhWin) { // Only handle if there is a silhouette window
        let tmpTopRel = () => {
          this._silhWin.originalWindow.windowTop = this._silhWin.windowTop
          this._silhWin.originalWindow.windowHeight = this._silhWin.windowHeight
        }
        let tmpRightRel = () => {
          this._silhWin.originalWindow.windowWidth = this._silhWin.windowWidth
        }
        let tmpBotRel = () => {
          this._silhWin.originalWindow.windowHeight = this._silhWin.windowHeight
        }
        let tmpLeftRel = () => {
          this._silhWin.originalWindow.windowLeft = this._silhWin.windowLeft
          this._silhWin.originalWindow.windowWidth = this._silhWin.windowWidth
        }
        this._silhWin.originalWindow.isDisabled = false // Set original window back to normal
        switch (this._grabType) {
          case WindowGrabType.WINDOW_MOVE:
            this._silhWin.originalWindow.windowLeft = this._silhWin.windowLeft
            this._silhWin.originalWindow.windowTop = this._silhWin.windowTop
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
        this._deskTop.removeChild(this._silhWin)
        this._silhWin = undefined
        this._grabType = undefined // To indicate move/grab end
        if (document.body.style.cursor !== 'default') document.body.style.cursor = 'default'
      }
    }
  }

  /**
   * Supposed to handle resizing the maximized windows inside the desktop when the web-page resize
   * @private
   */
  _handleWebPageResize () {
    // this._windows.forEach(win => {
    //   if (win.isMaximized) { // Loop and update position and size of every maximized window
    //     win.windowLeft = 0
    //     win.windowTop = 0
    //     win.windowWidth = this._deskTop.clientWidth
    //     win.windowHeight = this._deskTop.clientHeight
    //   }
    // })
    Array.from(this._deskTop.children)
      .filter(elem => elem instanceof Window && elem.isMaximized) // Check also if they are windows (just in case)
      .forEach(elem => {
        elem.windowLeft = 0
        elem.windowTop = 0
        elem.windowWidth = this._deskTop.clientWidth
        elem.windowHeight = this._deskTop.clientHeight
      })
  }

  /**
   * Handles changing taskbar position.
   * @private
   */
  _updateTaskBarPos () {
    let tmpHorBar = () => {
      this._deskTop.style.width = '100vw'
      this._deskTop.style.height = 'calc(100vh - ' + (2 * CONF_CONSTS.TASKBAR_PAD + CONF_CONSTS.ICON_SIZE) + 'px)'
      this._deskBar.style.width = '100vw'
      this._deskBar.style.height = CONF_CONSTS.ICON_SIZE + 'px'
      this._deskBar.style.flexDirection = 'row'
    }
    let tmpVerBar = () => {
      this._deskTop.style.width = 'calc(100vw - ' + (2 * CONF_CONSTS.TASKBAR_PAD + CONF_CONSTS.ICON_SIZE) + 'px)'
      this._deskTop.style.height = '100vh'
      this._deskBar.style.width = CONF_CONSTS.ICON_SIZE + 'px'
      this._deskBar.style.height = '100vh'
      this._deskBar.style.flexDirection = 'column'
    }
    switch (this._conf.taskBarPosition) {
      case PositionEdge.TOP:
        tmpHorBar()
        this._deskTop.style.top = ''
        this._deskTop.style.right = ''
        this._deskTop.style.bottom = '0'
        this._deskTop.style.left = ''
        this._deskBar.style.top = '0'
        this._deskBar.style.right = ''
        this._deskBar.style.bottom = ''
        this._deskBar.style.left = ''
        this._deskBarIconsCenter.className = HTML_CLASS_TASKBAR_ICONS_TOP
        break
      case PositionEdge.LEFT:
        tmpVerBar()
        this._deskTop.style.top = ''
        this._deskTop.style.right = '0'
        this._deskTop.style.bottom = ''
        this._deskTop.style.left = ''
        this._deskBar.style.top = ''
        this._deskBar.style.right = ''
        this._deskBar.style.bottom = ''
        this._deskBar.style.left = '0'
        this._deskBarIconsCenter.className = HTML_CLASS_TASKBAR_ICONS_LEFT
        break
      case PositionEdge.BOTTOM:
        tmpHorBar()
        this._deskTop.style.top = '0'
        this._deskTop.style.right = ''
        this._deskTop.style.bottom = ''
        this._deskTop.style.left = ''
        this._deskBar.style.top = ''
        this._deskBar.style.right = ''
        this._deskBar.style.bottom = '0'
        this._deskBar.style.left = ''
        this._deskBarIconsCenter.className = HTML_CLASS_TASKBAR_ICONS_BOT
        break
      case PositionEdge.RIGHT:
        tmpVerBar()
        this._deskTop.style.top = ''
        this._deskTop.style.right = ''
        this._deskTop.style.bottom = ''
        this._deskTop.style.left = '0'
        this._deskBar.style.top = ''
        this._deskBar.style.right = '0'
        this._deskBar.style.bottom = ''
        this._deskBar.style.left = ''
        this._deskBarIconsCenter.className = HTML_CLASS_TASKBAR_ICONS_RIGHT
        break
      default:
        throw new TypeError('The passed new taskbar position value should be one of the \'PositionEdge\' constant values.')
    }
    this._handleWebPageResize()
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
      if (this._windows.length && this._windows[this._windows.length - 1] !== theWindow) this._windows[this._windows.length - 1].isActive = false
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
   * Handles the event when clicking a desktop-icon/bar-icon
   * @param {Event|IconClickEvent} ev   the event ('IconClickEvent') dispatched by the icon
   * @private
   */
  _handleIconClick (ev) {
    if (ev.resultedWindow) {
      ev.resultedWindow.windowLeft = this._nextWinX
      ev.resultedWindow.windowTop = this._nextWinY
      ev.resultedWindow.addEventListener(WIN_EVENTS.WIN_FOCUSED, ev => this._putWinOnTop(ev.target))
      ev.resultedWindow.addEventListener(WIN_EVENTS.WIN_MINIMIZED, this._handleWinMinimized.bind(this))
      ev.resultedWindow.addEventListener(WIN_EVENTS.WIN_MAXIMIZED, this._handleWinMaximized.bind(this))
      ev.resultedWindow.addEventListener(WIN_EVENTS.WIN_CLOSED, this._handleWinClosed.bind(this))
      ev.resultedWindow.addEventListener(WIN_EVENTS.WIN_GRABBED, this._handleWinGrabbed.bind(this))
      this._nextWinX = (this._nextWinX + CONF_CONSTS.WIN_NEW_Y_SHIFT) % (this._deskTop.clientWidth / 3 * 2) // Set next window X
      this._nextWinY = (this._nextWinY + CONF_CONSTS.WIN_NEW_X_SHIFT) % (this._deskTop.clientHeight / 3 * 2) // Set next window Y
      this._deskTop.appendChild(ev.resultedWindow)
    }
  }

  /**
   * Handles the event when a window is minimized.
   * @param {Event} ev    the event dispatched by the window
   * @private
   */
  _handleWinMinimized (ev) {
    this._windows.pop().windowZIndex = 0
    this._putWinOnTop() // Put the other last window on top (if any)
  }

  /**
   * Handles the event when a window is maximized.
   * @param {Event} ev    the event dispatched by the window
   * @private
   */
  _handleWinMaximized (ev) {
    ev.target.windowLeft = 0
    ev.target.windowTop = 0
    ev.target.windowWidth = this._deskTop.clientWidth
    ev.target.windowHeight = this._deskTop.clientHeight
  }

  /**
   * Handles the event when a window is closed.
   * @param {Event} ev    the event dispatched by the window
   * @private
   */
  _handleWinClosed (ev) {
    if (this._windows.length && this._windows[this._windows.length - 1] === ev.target) this._windows.pop() // Remove 'tmpWin' window (it is on top now)
    this._deskTop.removeChild(/** @type {Window} */ev.target)
    this._putWinOnTop() // Put the other last window on top (if any)
  }

  /**
   * Handles the event when a window is grabbed for move/resize.
   * @param {Event|WindowGrabEvent} ev    the event dispatched by the window
   * @private
   */
  _handleWinGrabbed (ev) {
    ev.target.isActive = true
    ev.target.isDisabled = true // Disable the window (until pointer/mouse is up)
    this._silhWin = new SilhouetteWindow(/** @type {Window} */ev.target) // Make a silhouette of the original
    this._deskTop.appendChild(this._silhWin)
    this._grabType = ev.grabType // To indicate that a move/grab in progress
    switch (ev.grabType) {
      case WindowGrabType.WINDOW_MOVE: // The title bar is grabbed (moving)
        document.body.style.cursor = 'move' // To prevent cursor change during move
        this._moveDif = { // Save the initial position difference for a bit later
          x: ev.clientX - ev.target.windowLeft,
          y: ev.clientY - ev.target.windowTop
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
    this._deskTop.addEventListener(window.PointerEvent ? 'pointermove' : 'mousemove', this._handleDesktopPointerMove) // It is better to let the '_deskTop' and not the 'document' handle it
    document.addEventListener(window.PointerEvent ? 'pointerup' : 'mouseup', this._handleDocPointerUp)
  }

  /**
   * Adds an app to put inside the window.
   * @param {typeof AbsApp} appClass  the class for the application to be put in the window (must extend 'AbsApp')
   * @param {...*} appParams          parameter to pass to the app constructor
   */
  addApp (appClass, ...appParams) {
    if (!(appClass.prototype instanceof AbsApp)) throw new TypeError('The passed \'appClass\' argument must be a class that extends the \'AbsApp\' abstract class.') // Check if it is actually a js-desktop-app class
    let tmpIcon = new Icon(this._conf, appClass, ...appParams)
    tmpIcon.addEventListener('click', this._handleIconClick.bind(this))
    this._deskBarIconsCenter.appendChild(tmpIcon) // Add taskbar icon
    this._deskTopIconList.appendChild(tmpIcon.desktopIcon) // Add desktop icon
  }
}

window.customElements.define(HTML_TAG_DTOP, Desktop)
