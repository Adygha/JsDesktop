import AbsDtopApp from '../abs-dtop-app.js'
import Window from '../window/window.js';
import IIconObserver from './i-icon-observer.js';
// import IWindowObserver from '../window/i-window-observer.js'

// const CSS_CLASS_ICON_LIST = 'js-dtop-icon-list'
const CSS_CLASS_DESK_ICON = 'js-dtop-icon-list-icon-container'
// const CSS_CLASS_BAR_ICON = 'js-dtop-bar-icon'
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
  constructor (firstButCallBack) {
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
   * @param {typeof IIconObserver} iconObserver   the observer of the icon actions.
   * @param {typeof AbsDtopApp} appClass          the js-desktop-app class that this 'Icon' will run.
   * @param {number} iconSize                     the size (used for width and height) of the icon in pixels
   */
  constructor (iconObserver, appClass, iconSize) {
    IIconObserver.checkObjectImplements(iconObserver)
    if (!(appClass.prototype instanceof AbsDtopApp)) {
      throw new TypeError('The \'appClass\' argument must be a class that extends the \'AbsDtopApp\' abstract class.')
    }
    this._appClass = appClass
    /** @type {typeof IIconObserver} */
    this._observer = iconObserver
    /** @type {Map<Window, HTMLElement>} */
    this._windows = new Map() // TODO: Drawer related need completion

    this._barIcon = document.createElement('div')                      //
    this._barIcon.classList.add(CSS_CLASS_ICON)                                 //
    this._barIcon.style.width = iconSize + 'px'                                 // Prepare the bar-icon
    this._barIcon.style.height = iconSize + 'px'                                //
    this._barIcon.style.backgroundImage = 'url("' + appClass.appIconURL + '")'  //
    this._barIcon.appClass = appClass // Assign the app-class to use it in the click event handler later
    this._barIcon.addEventListener('click', this._handleIconClick.bind(this))
    this._observer.placeBarIcon(this._barIcon)

    let tmpIcon = document.createElement('div')
    let tmpLabel = document.createElement('div')
    let tmpHandler = ev => { // An event handler to pass the click event to 'this._dtopIcon' from its children
      ev.stopPropagation()
      this._dtopIcon.click()
    }
    this._dtopIcon = document.createElement('li')                  //
    this._dtopIcon.classList.add(CSS_CLASS_DESK_ICON)                       //
    tmpLabel.innerText = appClass.appName                                   //
    tmpIcon.style.backgroundImage = 'url("' + appClass.appIconURL + '")'    //
    tmpIcon.classList.add(CSS_CLASS_ICON)                                   //
    tmpIcon.style.width = iconSize + 'px'                                   //
    tmpIcon.style.height = iconSize + 'px'                                  //
    tmpIcon.addEventListener('click', tmpHandler)                     //
    tmpLabel.addEventListener('click', tmpHandler)                    // Prepare the desktop-icon
    this._dtopIcon.appendChild(tmpIcon)                                     //
    this._dtopIcon.appendChild(tmpLabel)                                    //
    this._dtopIcon.appClass = appClass // Assign the app-class to use it in the click event handler later
    this._dtopIcon.addEventListener('click', this._handleIconClick.bind(this))
    this._observer.placeDesktopIcon(this._dtopIcon)

    // TODO: Drawer related need completion
    // this._barIcon.appendChild(new WindowButDrawer())
    // this._barIcon.addEventListener('mouseleave', () => {
    //   this._barIcon.firstElementChild.classList.remove(CSS_CLASS_WIN_BUT_DRAWER_MENU_VIS)
    // })

    let tmpStyle = document.querySelector('link[rel="stylesheet"][href="js-dtop/icon/icon.css"]')
    if (!tmpStyle) {
      tmpStyle = document.createElement('link')
      tmpStyle.setAttribute('rel', 'stylesheet')
      tmpStyle.setAttribute('href', 'js-dtop/icon/icon.css')
      // this._shadow = this.attachShadow({mode: 'open'})
      // this._shadow.appendChild(tmpStyle)
      document.head.appendChild(tmpStyle)
    }
  }

  /**
   * Handles the icon click event.
   * @param {MouseEvent} ev   the mouse-event related to click
   * @private
   */
  _handleIconClick (ev) {
    let tmpWinBut = document.createElement('div') // TODO: Drawer related need completion
    this._windows.set(new Window(this, ev.target.appClass), tmpWinBut) // TODO: Drawer related need completion
    // this._barIcon.firstElementChild.classList.add(CSS_CLASS_WIN_BUT_DRAWER_MENU_VIS) // TODO: Drawer related need completion
  }

  /**
   * The js-desktop-app class that this 'Icon' will initiate.
   * @readonly
   * @type {typeof AbsDtopApp}
   */
  get appClass () {
    return this._appClass
  }

  /**
   * Used to inform that the specified window is created now.
   * @param {Window} theWindow  the window that is created
   */
  windowCreated (theWindow) {
    this._observer.windowCreated(theWindow)
  }

  /**
   * Used to inform that the specified window is closed now.
   * @param {Window} theWindow  the window that is closed
   */
  windowClosed (theWindow) {
    this._observer.windowClosed(theWindow)
  }

  /**
   * Used to inform that the specified window is maximized now.
   * @param {Window} theWindow  the window that is maximized
   */
  windowMaximized (theWindow) {
    this._observer.windowMaximized(theWindow)
  }

  /**
   * Used to inform that the specified window is minimized now.
   * @param {Window} theWindow  the window that is minimized
   */
  windowMinimized (theWindow) {
    this._observer.windowMinimized(theWindow)
  }

  /**
   * Used to inform that the specified window has focus now.
   * @param {Window} theWindow  the window that has focus
   */
  windowFocused (theWindow) {
    this._observer.windowFocused(theWindow)
  }

  /**
   * Used to inform that the specified window is being grabbed now (for resizing or moving).
   * @param {Window} theWindow          the window that has focus
   * @param {WindowGrabType} grabType   specifies the type of grab (which part of the window is grabbed/moved)
   * @param {MouseEvent} mouseEv        the grabbing mouse-event related to grabbing
   */
  windowGrabbed (theWindow, grabType, mouseEv) {
    this._observer.windowGrabbed(theWindow, grabType, mouseEv)
  }

  /**
   * Used to inform that the window's working desktop object is requested.
   * @return {Desktop}   the requested desktop object that the window runs on
   */
  desktopObjectRequested () {
    return this._observer.desktopObjectRequested()
  }
}
