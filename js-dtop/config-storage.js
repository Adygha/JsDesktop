
export const CONF_CONSTS = {
  DTOP_PATH: 'js-dtop/', // Path to desktop-environment's main directory
  TASKBAR_PAD: 5, // Taskbar padding in pixels
  ICON_SIZE: 40, // Icon size (used for width and height) in pixels
  WIN_MIN_WIDTH: 300, // Minimum window width
  WIN_MIN_HEIGHT: 300, // Minimum window height
  WIN_NEW_X_SHIFT: 15, // New window X position shift from the previous window
  WIN_NEW_Y_SHIFT: 30 // New window Y position shift from the previous window
}

export const CONF_KEYS_EVENTS = {
  TASKBAR_POS: 'taskbar-position'
}

/**
 * An Enum used to position Based on the edges.
 * @readonly
 * @enum {Symbol}
 */
export const PositionEdge = Object.freeze({ // Some sites recommended 'freeze' to prevent accidentally adding properties

  /** Position on top edge */
  TOP: 'TOP',
  // TOP: Symbol('TOP'),

  /** Position on left edge */
  LEFT: 'LEFT',
  // LEFT: Symbol('LEFT'),

  /** Position on bottom edge */
  BOTTOM: 'BOTTOM',
  // BOTTOM: Symbol('BOTTOM'),

  /** Position on right edge */
  RIGHT: 'RIGHT'
  // RIGHT: Symbol('RIGHT')
})

export default class ConfigStorage extends EventTarget {
  constructor () {
    super()
    this._defVals = { // Holds default values for settings (can't be made outside constant)
      [CONF_KEYS_EVENTS.TASKBAR_POS]: JSON.stringify(PositionEdge.BOTTOM)
    }
    if (!window.localStorage.getItem(CONF_KEYS_EVENTS.TASKBAR_POS)) window.localStorage.setItem(CONF_KEYS_EVENTS.TASKBAR_POS, this._defVals[CONF_KEYS_EVENTS.TASKBAR_POS])
    window.addEventListener('storage', ev => this.dispatchEvent(new Event(ev.key))) // This is in case there was other browser pages changing
  }

  /**
   * Specifies the taskbar position on the desktop.
   * @type {PositionEdge}
   */
  get taskBarPosition () {
    return JSON.parse(window.localStorage.getItem(CONF_KEYS_EVENTS.TASKBAR_POS))
  }

  /**
   * Specifies the taskbar position on the desktop.
   * @type {PositionEdge}
   */
  set taskBarPosition (newPos) {
    // TODO: Check new position type
    window.localStorage.setItem(CONF_KEYS_EVENTS.TASKBAR_POS, JSON.stringify(newPos))
    this.dispatchEvent(new Event(CONF_KEYS_EVENTS.TASKBAR_POS))
  }
}
