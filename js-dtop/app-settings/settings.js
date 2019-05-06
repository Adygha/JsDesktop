import AbsApp from '../app/abs-app.js'
import IAppObserver from '../app/i-app-observer.js'
import {BarPos} from '../desktop.js'

const DTOP_PATH = 'js-dtop/'
const APP_PATH = DTOP_PATH + 'app-settings/' // This app's path
const APP_NAME = 'JsDesktop Settings' // App's name
const APP_ICON_FILE = APP_PATH + 'settings.png' // App's icon image
const APP_CSS_FILE = APP_PATH + 'settings.css' // App's css file
const APP_TEMPL_FILE = APP_PATH + 'settings.html' // App's template file
const APP_WIDTH = 400   //
const APP_HEIGHT = 425  // App's initial/default size
const APP_HTML_TAG = 'js-dtop-app-settings' // App's HTML tag name
const HTML_CLASS_ROOT = 'settings' // HTML class for the template's root element
const HTML_CLASS_BAR_POS = 'settings-desktop-bar-position' // HTML class for desktop-bar position drop-box

export default class Settings extends AbsApp {

  /**
   * Constructor that takes an app observer object as a parameter.
   * @param {IAppObserver} appObserver   the observer object for the app
   */
  constructor (appObserver) {
    super()
    IAppObserver.checkObjectImplements(appObserver)
    this._observer = appObserver
    fetch(APP_TEMPL_FILE).then(resp => resp.text()).then(docTxt => {
      let tmpRoot = (new DOMParser()).parseFromString(docTxt, 'text/html').querySelector('.' + HTML_CLASS_ROOT).cloneNode(true)
      this._dtopBarPos = tmpRoot.querySelector('.' + HTML_CLASS_BAR_POS)
      Object.keys(BarPos).forEach(key => {
        let tmpOpt = document.createElement('option')
        if (BarPos[key] === this._observer.desktopObjectRequested().desktopBarPosition) {
          tmpOpt.selected = true
        }
        tmpOpt.value = BarPos[key].toString()
        tmpOpt.textContent = key
        this._dtopBarPos.add(tmpOpt)
      })
      tmpRoot.querySelector('#settings-style').href = APP_CSS_FILE
      this.appendChild(tmpRoot)
      this._dtopBarPos.addEventListener('change', () => {
        this._observer.desktopObjectRequested().desktopBarPosition = BarPos[this._dtopBarPos.options[this._dtopBarPos.selectedIndex].textContent]
      })
      this._attachRemovableEventHandlers()
    })
  }

  /**
   * Prepares and attaches the removable event-handlers needed
   * @private
   */
  _attachRemovableEventHandlers () {
    this._handleDtopBarMoved = () => {
      this._dtopBarPos.value = this._observer.desktopObjectRequested().desktopBarPosition.toString()
    }
    this._observer.desktopObjectRequested().addEventListener('desktop-bar-moved', this._handleDtopBarMoved)
  }

  /**
   * Detaches the removable event-handlers
   * @private
   */
  _detachRemovableEventHandlers () {
    this._observer.desktopObjectRequested().removeEventListener('desktop-bar-moved', this._handleDtopBarMoved)
  }

  /**
   * Used to end the application gracefully.
   */
  endApp () {
    this._detachRemovableEventHandlers()
  }

  /**
   * Used to specify the app icon's URL (static).
   * @readonly
   * @type {String}
   */
  static get appIconURL () {
    return APP_ICON_FILE
  }

  /**
   * Used to specify the app name (static).
   * @readonly
   * @type {String}
   */
  static get appName () {
    return APP_NAME
  }

  /**
   * Used to specify the app's default/initial size (static).
   * @readonly
   * @type {Object}
   * @property {Number} width
   * @property {Number} height
   */
  static get defaultAppSize () {
    return {
      width: APP_WIDTH,
      height: APP_HEIGHT
    }
  }
}

window.customElements.define(APP_HTML_TAG, Settings)
