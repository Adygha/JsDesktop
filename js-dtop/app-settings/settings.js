import AbsApp from '../app/abs-app.js'
import {BarPos} from '../desktop.js'
import {CONF_KEYS_EVENTS} from '../config-storage.js'

const DTOP_PATH = 'js-dtop/'
const APP_PATH = DTOP_PATH + 'app-settings/' // This app's path
const APP_NAME = 'JsDesktop Settings' // App's name
const APP_ICON_FILE = APP_PATH + 'settings-icon.png' // App's icon image
const APP_CSS_FILE = APP_PATH + 'settings.css' // App's css file
const APP_TEMPL_FILE = APP_PATH + 'settings.html' // App's template file
const APP_WIDTH = 400   //
const APP_HEIGHT = 425  // App's initial/default size
const HTML_TAG_APP = 'js-dtop-app-settings' // App's HTML tag name
const HTML_CLASS_ROOT = 'settings' // HTML class for the template's root element
const HTML_CLASS_BAR_POS = 'settings-desktop-bar-position' // HTML class for desktop-bar position drop-box

export default class Settings extends AbsApp {

  /**
   * Constructor that takes a ConfigStorage object as a parameter.
   * @param {ConfigStorage} confObj   the ConfigStorage object
   */
  constructor (confObj) {
    super()
    this._conf = confObj
    fetch(APP_TEMPL_FILE).then(resp => resp.text()).then(docTxt => {
      let tmpRoot = (new DOMParser()).parseFromString(docTxt, 'text/html').querySelector('.' + HTML_CLASS_ROOT).cloneNode(true)
      let tmpCurBarPos = this._conf.desktopBarPosition
      this._ctrlBarPos = tmpRoot.querySelector('.' + HTML_CLASS_BAR_POS)
      Object.keys(BarPos).forEach(key => {
        let tmpOpt = document.createElement('option')
        if (BarPos[key] === tmpCurBarPos) tmpOpt.selected = true
        // tmpOpt.value = BarPos[key].toString() // Will use crooked 'Symbol.toString' for now (may fix later)
        // tmpOpt.textContent = key
        tmpOpt.value = key                //
        tmpOpt.textContent = BarPos[key]  // They are both the same now (but in case I changed them later)
        this._ctrlBarPos.add(tmpOpt)
      })
      tmpRoot.querySelector('#settings-style').href = APP_CSS_FILE
      this.appendChild(tmpRoot)
      // this._ctrlBarPos.addEventListener('change', () => this._conf.desktopBarPosition = BarPos[this._ctrlBarPos.options[this._ctrlBarPos.selectedIndex].textContent])
      this._ctrlBarPos.addEventListener('change', () => this._conf.desktopBarPosition = BarPos[this._ctrlBarPos.value])
      this._attachRemovableEventHandlers()
    })
  }

  /**
   * Prepares and attaches the removable event-handlers needed
   * @private
   */
  _attachRemovableEventHandlers () {
    // this._handleDtopBarMoved = ev => this._ctrlBarPos.value = ev.newValue.toString() // Will use crooked 'Symbol.toString' for now (may fix later)
    this._handleDtopBarMoved = () => this._ctrlBarPos.value = this._conf.desktopBarPosition
    this._conf.addEventListener(CONF_KEYS_EVENTS.DTOP_BAR_POS, this._handleDtopBarMoved)
  }

  /**
   * Detaches the removable event-handlers
   * @private
   */
  _detachRemovableEventHandlers () {
    this._conf.removeEventListener(CONF_KEYS_EVENTS.DTOP_BAR_POS, this._handleDtopBarMoved)
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

window.customElements.define(HTML_TAG_APP, Settings)
