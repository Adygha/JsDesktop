import AbsDtopApp from '../js-dtop/abs-dtop-app.js'
import Window from '../js-dtop-window/window.js';
import IIconObserver from './i-icon-observer.js';
// import IWindowObserver from '../js-dtop-window/i-window-observer.js'

// const CSS_CLASS_ICON_LIST = 'js-dtop-icon-list'
const CSS_CLASS_DESK_ICON = 'js-dtop-icon-list-icon'
const CSS_CLASS_BAR_ICON = 'js-dtop-bar-icon'
const CSS_CLASS_ICON = 'js-dtop-icon'
// const CSS_CLASS_WIN_BUT = 'js-dtop-bar-win-but'
const CSS_CLASS_WIN_BUT_DRAWER = 'js-dtop-bar-drawer'
// const CSS_CLASS_WIN_BUT_DRAWER_BUT = 'js-dtop-bar-drawer-but'
// const CSS_CLASS_WIN_BUT_DRAWER_STRIPS = 'js-dtop-bar-drawer-strips'
const CSS_CLASS_WIN_BUT_DRAWER_MENU = 'js-dtop-bar-drawer-menu'
const CSS_CLASS_WIN_BUT_DRAWER_MENU_VIS = 'js-dtop-bar-drawer-menu-vis'

class WindowButDrawer extends HTMLElement {

  /**
   *
   * @param {Function} [firstButCallBack]
   */
  constructor(firstButCallBack) {
    super()
    //let tmpRad = document.createElement('input')
    //let tmpStrips = document.createElement('span')
    let tmpMenu = document.createElement('nav')
    //tmpRad.type = 'radio'
    //tmpRad.classList.add(CSS_CLASS_WIN_BUT_DRAWER_BUT)
    //tmpStrips.classList.add(CSS_CLASS_WIN_BUT_DRAWER_STRIPS)
    tmpMenu.classList.add(CSS_CLASS_WIN_BUT_DRAWER_MENU)
    let tmpDELETEME = document.createElement('a')
    tmpDELETEME.href = 'javascript:'
    tmpDELETEME.textContent = 'Window Title1'
    tmpMenu.appendChild(tmpDELETEME.cloneNode(true))
    tmpDELETEME.textContent = 'Window Title2'
    tmpMenu.appendChild(tmpDELETEME)
    //this.appendChild(tmpRad)
    //this.appendChild(tmpStrips)
    this.appendChild(tmpMenu)
  }
}

window.customElements.define(CSS_CLASS_WIN_BUT_DRAWER, WindowButDrawer)

export default class Icon {

  /**
   * Constructor that takes the icon observer and the app-class as parameters.
   * @param {typeof IIconObserver} iconObserver    the observer of the icon actions.
   * @param {typeof AbsDtopApp} appClass the js-desktop-app class that this 'Icon' will run.
   */
  constructor(iconObserver, appClass) {
    IIconObserver.checkObjectImplements(iconObserver)
    if (!(appClass.prototype instanceof AbsDtopApp)) {
      throw new TypeError('The \'appClass\' argument must be a class that extends the \'AbsDtopApp\' abstract class.')
    }
    this._appClass = appClass
    this._observer = iconObserver
    /** @type {Map<Window, HTMLElement>} */
    this._windows = new Map()

    this._barIcon = document.createElement('div')                               //
    this._barIcon.classList.add(CSS_CLASS_ICON, CSS_CLASS_BAR_ICON)             //
    this._barIcon.style.backgroundImage = 'url("' + appClass.appIconURL + '")'  //
    //this._barIcon.appClass = appClass                                           // Prepare the bar-icon
    //this._barIcon.addWindow = this.addWindow.bind(this)                         //
    //this._barIcon.removeWindow = this.removeWindow.bind(this)                   //
    this._barIcon.appClass = appClass // Assign the app-class to use it in the click event handler later
    this._barIcon.addEventListener('click', this.handleIconClick.bind(this))
    this._observer.placeBarIcon(this._barIcon)

    let tmpIcon = document.createElement('div')
    let tmpLabel = document.createElement('div')
    let tmpHandler = ev => { // An event handler to pass the click event to 'this._dtopIcon' from its children
      ev.stopPropagation()
      this._dtopIcon.click()
      //tmpList.dispatchEvent(new Event('click'))
    }
    this._dtopIcon = document.createElement('li')                         //
    this._dtopIcon.classList.add(CSS_CLASS_ICON, CSS_CLASS_DESK_ICON)     //
    tmpLabel.innerText = appClass.appName                                 //
    tmpIcon.style.backgroundImage = 'url("' + appClass.appIconURL + '")'  //
    tmpIcon.classList.add(CSS_CLASS_BAR_ICON)                             //
    tmpIcon.addEventListener('click', tmpHandler)                         //
    tmpLabel.addEventListener('click', tmpHandler)                        // Prepare the desktop-icon
    //this._dtopIcon.appClass = appClass                                    //
    //this._dtopIcon.addWindow = this.addWindow.bind(this)                 //
    //this._dtopIcon.removeWindow = this.removeWindow.bind(this)           //
    this._dtopIcon.appendChild(tmpIcon)                                   //
    this._dtopIcon.appendChild(tmpLabel)                                  //
    this._dtopIcon.appClass = appClass // Assign the app-class to use it in the click event handler later
    this._dtopIcon.addEventListener('click', this.handleIconClick.bind(this))
    this._observer.placeDesktopIcon(this._dtopIcon)

    //this._drawer = document.createElement('ul')
    this._barIcon.appendChild(new WindowButDrawer())
    this._barIcon.addEventListener('mouseleave', () => {
      this._barIcon.firstElementChild.classList.remove(CSS_CLASS_WIN_BUT_DRAWER_MENU_VIS)
    })

    let tmpStyle = document.querySelector('link[rel="stylesheet"][href="js-dtop-icon/icon.css"]')
    if (!tmpStyle) {
      tmpStyle = document.createElement('link')
      tmpStyle.setAttribute('rel', 'stylesheet')
      tmpStyle.setAttribute('href', 'js-dtop-icon/icon.css')
      // this._shadow = this.attachShadow({mode: 'open'})
      // this._shadow.appendChild(tmpStyle)
      document.head.appendChild(tmpStyle)
    }
  }

  /**
   * Handles the icon click event.
   * @param {MouseEvent} ev
   */
  handleIconClick(ev) {
    let tmpWinBut = document.createElement('div')
    this._windows.set(new Window(this, ev.target.appClass), tmpWinBut)
    this._barIcon.firstElementChild.classList.add(CSS_CLASS_WIN_BUT_DRAWER_MENU_VIS)
  }

  ///**
  // * Add an event listener for this object (only the window new/closing events for now).
  // * @param {String} typeLabel  the event's type label.
  // * @param {Function} callBack the event handler callback to add.
  // */
  //addEventListener(typeLabel, callBack) {
  //  if (typeof typeLabel === 'string' && typeof callBack === 'function') {
  //    this._barIcon.addEventListener(typeLabel, callBack)
  //    if (this._dtopIcon) {
  //      this._dtopIcon.addEventListener(typeLabel, callBack)
  //    }
  //  }
  //}

  ///**
  // * Remove an event listener from this object (only the window new/closing events for now).
  // * @param {String} typeLabel  the event's type label.
  // * @param {Function} callBack the event handler callback to remove.
  // */
  //removeEventListener(typeLabel, callBack) {
  //  if (typeof typeLabel === 'string' && typeof callBack === 'function') {
  //    this._barIcon.removeEventListener(typeLabel, callBack)
  //    if (this._dtopIcon) {
  //      this._dtopIcon.removeEventListener(typeLabel, callBack)
  //    }
  //  }
  //}

  /**
   * The js-desktop-app class that this 'Icon' will initiate.
   * @readonly
   * @type {typeof AbsDtopApp}
   */
  get appClass() {
    return this._appClass
  }

  /**
   *
   * @param {Window} theWindow
   */
  windowCreated(theWindow) {
    // let tmpWinBut = document.createElement('div')
    // this._windows.set(theWindow, tmpWinBut)
    this._observer.windowCreated(theWindow)
  }

  /**
   *
   * @param {Window} theWindow
   */
  windowClosed(theWindow) {
    this._observer.windowClosed(theWindow)
  }

  /**
   *
   * @param {Window} theWindow
   */
  windowMaximized(theWindow) {
    this._observer.windowMaximized(theWindow)
  }

  /**
   *
   * @param {Window} theWindow
   */
  windowMinimized(theWindow) {
    this._observer.windowMinimized(theWindow)
  }

  /**
   *
   * @param {Window} theWindow
   */
  windowFocused(theWindow) {
    this._observer.windowFocused(theWindow)
  }
}
