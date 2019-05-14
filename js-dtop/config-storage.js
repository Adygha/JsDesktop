import {BarPos} from './desktop.js'

export const CONF_KEYS_EVENTS = {
  DTOP_BAR_POS: 'desktop-bar-position'
}

export default class ConfigStorage extends EventTarget {
  constructor () {
    super()
    this._defVals = { // Holds default values for settings (can't be made outside constant)
      [CONF_KEYS_EVENTS.DTOP_BAR_POS]: JSON.stringify(BarPos.BOTTOM)
    }
    if (!window.localStorage.getItem(CONF_KEYS_EVENTS.DTOP_BAR_POS)) window.localStorage.setItem(CONF_KEYS_EVENTS.DTOP_BAR_POS, this._defVals[CONF_KEYS_EVENTS.DTOP_BAR_POS])
    window.addEventListener('storage', ev => this.dispatchEvent(new Event(ev.key))) // This is in case there was other browser pages changing
  }

  /**
   * Specifies the desktop-bar position on the desktop.
   * @type {BarPos}
   */
  get desktopBarPosition () {
    return JSON.parse(window.localStorage.getItem(CONF_KEYS_EVENTS.DTOP_BAR_POS))
  }

  /**
   * Specifies the desktop-bar position on the desktop.
   * @type {BarPos}
   */
  set desktopBarPosition (newPos) {
    // TODO: Check new position type
    window.localStorage.setItem(CONF_KEYS_EVENTS.DTOP_BAR_POS, JSON.stringify(newPos))
    this.dispatchEvent(new Event(CONF_KEYS_EVENTS.DTOP_BAR_POS))
  }
}
