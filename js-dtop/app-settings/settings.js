import AbsApp from '../app/abs-app.js'
import {CONF_CONSTS, CONF_KEYS_EVENTS, PositionEdge} from '../config-storage.js'

const APP_PATH = CONF_CONSTS.DTOP_PATH + 'app-settings/' // This app's path
const APP_NAME = 'JsDesktop Settings' // App's name
const APP_ICON_FILE = APP_PATH + 'settings-icon.png' // App's icon image
const APP_CSS_FILE = APP_PATH + 'settings.css' // App's css file
const APP_TEMPL_FILE = APP_PATH + 'settings.html' // App's template file
const APP_WIDTH = 400   //
const APP_HEIGHT = 425  // App's initial/default size
const HTML_TAG_APP = 'js-dtop-app-settings' // App's HTML tag name
const HTML_CLASS_ROOT = 'settings' // HTML class for the template's root element
const HTML_CLASS_TASKBAR_POS = 'settings-taskbar-position' // HTML class for taskbar position drop-box

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
      let tmpCurBarPos = this._conf.taskBarPosition
      this._ctrlTaskBarPos = tmpRoot.querySelector('.' + HTML_CLASS_TASKBAR_POS)
      Object.keys(PositionEdge).forEach(key => {
        let tmpOpt = document.createElement('option')
        if (PositionEdge[key] === tmpCurBarPos) tmpOpt.selected = true
        // tmpOpt.value = PositionEdge[key].toString() // Will use crooked 'Symbol.toString' for now (may fix later)
        // tmpOpt.textContent = key
        tmpOpt.value = key                //
        tmpOpt.textContent = PositionEdge[key]  // They are both the same now (but in case I changed them later)
        this._ctrlTaskBarPos.add(tmpOpt)
      })
      tmpRoot.querySelector('#settings-style').href = APP_CSS_FILE
      this.appendChild(tmpRoot)
      this._ctrlTaskBarPos.addEventListener('change', () => this._conf.taskBarPosition = PositionEdge[this._ctrlTaskBarPos.value])
      this._attachRemovableEventHandlers()
    })
  }

  /**
   * Prepares and attaches the removable event-handlers needed
   * @private
   */
  _attachRemovableEventHandlers () {
    // this._handleTaskBarMoved = ev => this._ctrlTaskBarPos.value = ev.newValue.toString() // Will use crooked 'Symbol.toString' for now (may fix later)
    this._handleTaskBarMoved = () => this._ctrlTaskBarPos.value = this._conf.taskBarPosition
    this._conf.addEventListener(CONF_KEYS_EVENTS.TASKBAR_POS, this._handleTaskBarMoved)
  }

  /**
   * Detaches the removable event-handlers
   * @private
   */
  _detachRemovableEventHandlers () {
    this._conf.removeEventListener(CONF_KEYS_EVENTS.TASKBAR_POS, this._handleTaskBarMoved)
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
