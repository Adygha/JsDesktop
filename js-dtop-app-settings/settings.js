import AbsApp from '../js-dtop/app/abs-app.js'
import IAppObserver from '../js-dtop/app/i-app-observer.js'
import {BarPos} from '../js-dtop/desktop.js'

const APP_PATH = 'js-dtop-app-settings/' // This app's path
const APP_NAME = 'JsDesktop Settings' // App's name
const APP_ICON_FILE = APP_PATH + 'settings.png' // App's icon image
const APP_CSS_FILE = APP_PATH + 'settings.css' // App's css file
const APP_TEMPL_FILE = APP_PATH + 'settings.html' // App's template file
const APP_WIDTH = 400   //
const APP_HEIGHT = 425  // App's initial/default size
const APP_HTML_TAG = 'js-dtop-app-settings' // App's HTML tag name
const APP_CSS_SEL_TEMPL_ROOT = '#settings' // App's template root css selector
const APP_CSS_SEL_TEMPL_BAR_POS = '#settings-desktop-bar-position' // App's template desktop-bar position drop-box css selector

export default class Settings extends AbsApp {

  /**
   * Constructor that takes an app observer object as a parameter.
   * @param {typeof IAppObserver} appObserver   the observer object for the app
   */
  constructor (appObserver) {
    super()
    IAppObserver.checkObjectImplements(appObserver)
    this._observer = appObserver
    fetch(APP_TEMPL_FILE).then(resp => resp.text()).then(docTxt => {
      let tmpRoot = (new DOMParser()).parseFromString(docTxt, 'text/html').querySelector(APP_CSS_SEL_TEMPL_ROOT).cloneNode(true)
      this._dtopBarPos = tmpRoot.querySelector(APP_CSS_SEL_TEMPL_BAR_POS)
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
   * Part of the mandatory interface. It is used to end the application gracefully.
   */
  endApp () {
    this._detachRemovableEventHandlers()
  }

  /**
   * Part of the mandatory interface. It is used to specify the app icon's URL (static).
   * @readonly
   * @type {String}
   */
  static get appIconURL () {
    return APP_ICON_FILE
  }

  /**
   * Part of the mandatory interface. It is used to specify the app name (static).
   * @readonly
   * @type {String}
   */
  static get appName () {
    return APP_NAME
  }

  /**
   * Part of the mandatory interface. It is used to specify the app's default/initial size (static).
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
