import Window, {WIN_EVENTS} from '../window/window.js'

const DTOP_PATH = 'js-dtop/'
const ICON_CSS_PATH = DTOP_PATH + 'css/icon.css'
const HTML_TAG_BAR_ICON = 'js-dtop-bar-icon' // Desktop's HTML tag name
const HTML_CLASS_ICON = 'js-dtop-icon' // HTML/CSS class for the icon
const HTML_CLASS_DESK_ICON = 'js-dtop-icon-list-icon-frame' // HTML/CSS class for the frame around each desktop icon
const HTML_CLASS_DRAWER = 'js-dtop-bar-drawer-menu' // HTML/CSS class for the open windows' button drawer (default not visible)
const HTML_CLASS_DRAWER_VIS = 'js-dtop-bar-drawer-menu-vis' // HTML/CSS class for the visible open windows' button drawer

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
 * A class that represents an icon (a desktop-bar version) that starts an app.
 */
export default class Icon extends HTMLElement {

  /**
   * Constructor that takes the app-class and and the icon size as parameters.
   * @param {number} iconSize         the size (will be used as width and height) of the icon
   * @param {typeof AbsApp} appClass  the app-class for the app that this icon starts
   * @param {...*} appParams          parameter to pass to the app constructor
   */
  constructor (iconSize, appClass, ...appParams) {
    super()
    this._appClass = appClass
    this._appParams = appParams
    this._drawer = document.createElement('nav') // The icon's taskbar drawer
    this._dtopIcon = document.createElement('li') // The desktop icon container (contains an icon and a label)
    let tmpIcon = document.createElement('div') // The inside picture of the icon
    let tmpLabel = document.createElement('div') // Desktop icon label
    this._dtopIcon.classList.add(HTML_CLASS_DESK_ICON)
    tmpIcon.title = appClass.appName
    tmpIcon.classList.add(HTML_CLASS_ICON)
    tmpIcon.style.width = tmpIcon.style.height = iconSize + 'px'
    tmpIcon.style.backgroundImage = 'url("' + appClass.appIconURL + '")'
    tmpLabel.textContent = appClass.appName
    this._drawer.classList.add(HTML_CLASS_DRAWER)
    this._dtopIcon.appendChild(tmpIcon.cloneNode(true)) // Just a copy
    this._dtopIcon.appendChild(tmpLabel)
    this.appendChild(tmpIcon)
    this.appendChild(this._drawer)
    this.addEventListener(window.PointerEvent ? 'pointerleave' : 'mouseleave', () => this._drawer.classList.remove(HTML_CLASS_DRAWER_VIS))
    this._drawer.addEventListener('click', ev => ev.stopPropagation())
    tmpIcon.addEventListener('click', this._handleClick.bind(this))
    this._dtopIcon.addEventListener('click', this._handleClick.bind(this))
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

  _handleClick (ev) {
    ev.stopPropagation()
    if (ev.target !== this._dtopIcon && this._drawer.children.length && !this._drawer.classList.contains(HTML_CLASS_DRAWER_VIS)) {
      this._drawer.classList.add(HTML_CLASS_DRAWER_VIS)
    } else {
      let tmpWin = new Window(new this._appClass(...this._appParams))
      this._drawer.appendChild(tmpWin.windowBarDrawerButton)
      tmpWin.addEventListener(WIN_EVENTS.WIN_CLOSED, () => this._drawer.removeChild(tmpWin.windowBarDrawerButton))
      this.dispatchEvent(new IconClickEvent(tmpWin, ev))
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
