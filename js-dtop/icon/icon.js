import {CONF_CONSTS, CONF_KEYS_EVENTS, PositionEdge} from '../config-storage.js'
import Window, {WIN_EVENTS} from '../window/window.js'

const ICON_CSS_PATH = CONF_CONSTS.DTOP_PATH + 'css/icon.css'
const HTML_TAG_BAR_ICON = 'js-dtop-taskbar-icon' // Icon's HTML tag name
const HTML_CLASS_ICON = 'js-dtop-icon' // HTML/CSS class for the icon
const HTML_CLASS_DESK_ICON = 'js-dtop-icon-list-icon-frame' // HTML/CSS class for the frame around each desktop icon
const HTML_CLASS_DRAWER = 'js-dtop-taskbar-drawer-menu' // HTML/CSS class for the open windows' button drawer (default not visible)
const HTML_CLASS_DRAWER_VIS = 'js-dtop-taskbar-drawer-menu-vis' // HTML/CSS class for the visible open windows' button drawer
const HTML_CLASS_COUNTER_HID = 'js-dtop-taskbar-icon-after-hidden' // HTML/CSS class used to hide the '::after' pseudo element for the bar icon that contains the window counter
const HTML_CLASS_BAR_ICON_TOP = 'js-dtop-taskbar-icon-top' // HTML/CSS class for the top taskbar icon
const HTML_CLASS_BAR_ICON_LEFT = 'js-dtop-taskbar-icon-left' // HTML/CSS class for the left taskbar icon
const HTML_CLASS_BAR_ICON_BOT = 'js-dtop-taskbar-icon-bot' // HTML/CSS class for the bottom taskbar icon
const HTML_CLASS_BAR_ICON_RIGHT = 'js-dtop-taskbar-icon-right' // HTML/CSS class for the right taskbar icon

/**
 * A class that represents an event dispatched when an icon is clicked. It holds the 'Window' object resulted from the click event.
 * @extends {Event}
 */
export class IconClickEvent extends (window.PointerEvent ? PointerEvent : MouseEvent) {
  constructor (resultedWindow, eventInit) {
    super('click', eventInit)
    this._reslWin = resultedWindow
  }

  /**
   * The 'Window' object that resulted from clicking the icon.
   * @return {Window}
   */
  get resultedWindow () {
    return this._reslWin
  }
}

/**
 * A class that represents an icon that starts an app.
 */
export default class Icon extends HTMLElement {

  /**
   * Constructor that takes the app-class and and the icon size as parameters.
   * @param {ConfigStorage} confObj   the ConfigStorage object
   * @param {typeof AbsApp} appClass  the app-class for the app that this icon starts
   * @param {...*} appParams          parameter to pass to the app constructor
   */
  constructor (confObj, appClass, ...appParams) {
    super()
    this._conf = confObj
    this._appClass = appClass
    this._appParams = appParams
    this._drawer = document.createElement('nav') // The icon's taskbar drawer
    this._dtopIcon = document.createElement('li') // The desktop icon container (contains an icon and a label)
    let tmpIcon = document.createElement('div') // The inside picture of the icon
    let tmpLabel = document.createElement('div') // Desktop icon label
    this._dtopIcon.classList.add(HTML_CLASS_DESK_ICON)
    tmpIcon.title = appClass.appName
    tmpIcon.classList.add(HTML_CLASS_ICON)
    tmpIcon.style.width = tmpIcon.style.height = CONF_CONSTS.ICON_SIZE + 'px'
    tmpIcon.style.backgroundImage = 'url("' + appClass.appIconURL + '")'
    tmpLabel.textContent = appClass.appName
    this._drawer.classList.add(HTML_CLASS_DRAWER)
    let tmpIconClone = tmpIcon.cloneNode(true)
    this._dtopIcon.appendChild(tmpIconClone) // Just a copy
    this._dtopIcon.appendChild(tmpLabel)
    this.appendChild(tmpIcon)
    this.appendChild(this._drawer)
    this.addEventListener(window.PointerEvent ? 'pointerleave' : 'mouseleave', () => this._drawer.classList.remove(HTML_CLASS_DRAWER_VIS))
    this._drawer.addEventListener('click', ev => ev.stopPropagation())
    tmpIcon.addEventListener('click', this._handleClick.bind(this))
    tmpIconClone.style.pointerEvents = 'none' // Thought it's better to set 'none' here in
    tmpLabel.style.pointerEvents = 'none'     // case accidentally removed from css file
    this._dtopIcon.addEventListener('click', this._handleClick.bind(this))
    this._conf.addEventListener(CONF_KEYS_EVENTS.TASKBAR_POS, this._handleTaskbarPosChange.bind(this))
    this._handleTaskbarPosChange()
    this._winCount()
  }

  connectedCallback () {
    let tmpStyle = document.querySelector('link[rel="stylesheet"][href="' + ICON_CSS_PATH + '"]')
    if (!tmpStyle) {
      tmpStyle = document.createElement('link')
      tmpStyle.setAttribute('rel', 'stylesheet')
      tmpStyle.setAttribute('href', ICON_CSS_PATH)
      document.head.appendChild(tmpStyle)
    }
  }

  _handleTaskbarPosChange () {
    switch (this._conf.taskBarPosition) {
      case PositionEdge.TOP:
        this.classList.add(HTML_CLASS_BAR_ICON_TOP)
        this.classList.remove(HTML_CLASS_BAR_ICON_RIGHT, HTML_CLASS_BAR_ICON_BOT, HTML_CLASS_BAR_ICON_LEFT)
        break
      case PositionEdge.LEFT:
        this.classList.add(HTML_CLASS_BAR_ICON_LEFT)
        this.classList.remove(HTML_CLASS_BAR_ICON_TOP, HTML_CLASS_BAR_ICON_RIGHT, HTML_CLASS_BAR_ICON_BOT)
        break
      case PositionEdge.BOTTOM:
        this.classList.add(HTML_CLASS_BAR_ICON_BOT)
        this.classList.remove(HTML_CLASS_BAR_ICON_TOP, HTML_CLASS_BAR_ICON_RIGHT, HTML_CLASS_BAR_ICON_LEFT)
        break
      case PositionEdge.RIGHT:
        this.classList.add(HTML_CLASS_BAR_ICON_RIGHT)
        this.classList.remove(HTML_CLASS_BAR_ICON_TOP, HTML_CLASS_BAR_ICON_BOT, HTML_CLASS_BAR_ICON_LEFT)
        break
      default:
        throw new TypeError('The passed new taskbar position value should be one of the \'PositionEdge\' constant values.')
    }
  }

  /**
   * Updates the window count data property of this icon
   * @private
   */
  _winCount () {
    this.dataset.wincount = this._drawer.children.length.toString()
    if (this._drawer.children.length) {
      this.classList.remove(HTML_CLASS_COUNTER_HID)
    } else {
      this.classList.add(HTML_CLASS_COUNTER_HID)
    }
  }

  /**
   * Handles clicking the bar or the desktop icon (dispatches our custom event instead)
   * @param {PointerEvent|MouseEvent} ev  the event that was dispatched
   * @private
   */
  _handleClick (ev) {
    ev.stopPropagation()
    if (ev.target !== this._dtopIcon && this._drawer.children.length && !this._isDrawerVisible) {
      this._isDrawerVisible = true
    } else {
      let tmpWin = new Window(new this._appClass(...this._appParams))
      this._drawer.appendChild(tmpWin.taskBarDrawerButton)
      tmpWin.addEventListener(WIN_EVENTS.WIN_CLOSED, () => {
        this._drawer.removeChild(tmpWin.taskBarDrawerButton)
        this._winCount()
      })
      this._winCount()
      if (ev.target !== this._dtopIcon) this._isDrawerVisible = true
      this.dispatchEvent(new IconClickEvent(tmpWin, ev))
    }
  }

  get _isDrawerVisible () {
    return this._drawer.classList.contains(HTML_CLASS_DRAWER_VIS)
  }

  set _isDrawerVisible (newIsDrawerVisible) {
    if (newIsDrawerVisible && !this._isDrawerVisible) {
      this._drawer.classList.add(HTML_CLASS_DRAWER_VIS)
    } else if (!newIsDrawerVisible && this._isDrawerVisible) {
      this._drawer.classList.remove(HTML_CLASS_DRAWER_VIS)
    }
  }

  /**
   * Used to get the icon element that represents a desktop version of the icon (no need to add a listener for
   * the 'click' event for the returned element element; it was redirected to this 'Icon' object).
   * @type {HTMLElement}
   */
  get desktopIcon () {
    return this._dtopIcon
  }
}

window.customElements.define(HTML_TAG_BAR_ICON, Icon)
