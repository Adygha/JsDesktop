import {WIN_EVENTS} from '../window/window.js'

const DTOP_PATH = 'js-dtop/'
const ICON_CSS_PATH = DTOP_PATH + 'css/icon.css'
const HTML_TAG_BAR_ICON = 'js-dtop-bar-icon' // Desktop's HTML tag name
const HTML_CLASS_ICON = 'js-dtop-icon' // HTML/CSS class for the icon
const HTML_CLASS_DRAWER = 'js-dtop-bar-drawer-menu' // HTML/CSS class for the open windows' button drawer (default not visible)
const HTML_CLASS_DRAWER_VIS = 'js-dtop-bar-drawer-menu-vis' // HTML/CSS class for the visible open windows' button drawer

export default class BarIcon extends HTMLElement {
  constructor (iconImageURL, iconSize) {
    super()
    this._drawer = document.createElement('nav')
    let tmpIcon = document.createElement('div')
    tmpIcon.classList.add(HTML_CLASS_ICON)
    tmpIcon.style.width = tmpIcon.style.height = iconSize + 'px'
    tmpIcon.style.backgroundImage = 'url("' + iconImageURL + '")'
    this._drawer.classList.add(HTML_CLASS_DRAWER)
    this.appendChild(tmpIcon)
    this.appendChild(this._drawer)
    this.addEventListener(window.PointerEvent ? 'pointerleave' : 'mouseleave', () => this._drawer.classList.remove(HTML_CLASS_DRAWER_VIS))
    this._drawer.addEventListener('click', ev => ev.stopPropagation())
    tmpIcon.addEventListener('click', ev => {
      if (this._drawer.children.length && !this._drawer.classList.contains(HTML_CLASS_DRAWER_VIS)) {
        ev.stopPropagation()
        this._drawer.classList.add(HTML_CLASS_DRAWER_VIS)
      }
    })
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

  /**
   * @param {Window} theWin
   */
  addWindow (theWin) {
    this._drawer.appendChild(theWin.windowBarDrawerButton)
    theWin.addEventListener(WIN_EVENTS.WIN_CLOSED, ev => this._drawer.removeChild(ev.target.windowBarDrawerButton))
  }
}

window.customElements.define(HTML_TAG_BAR_ICON, BarIcon)
