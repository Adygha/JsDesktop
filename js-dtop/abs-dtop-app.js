// const DEF_WINDOW_WIDTH = 400
// const DEF_WINDOW_HEIGHT = 400

/**
 * An abstract (as best as I could to work with the project) class that every js-desktop-app should extend. Normally,
 * we cannot create an object of this class because we did not use 'window.customElements.define' for it, but even if
 * it was used, we cannot create an object from it directly, and we must extend it first.
 */
export default class AbsDtopApp extends HTMLElement {

  /**
   * A constructor that takes this app's HTML element that will contain it as a parameter.
   * @param {HTMLElement} appHtmlContainer  the HTML element that will contain (or its shadow) this app
   */
  constructor (appHtmlContainer) {
    super()
    if (new.target === AbsDtopApp) { // Check if an object begins to instatiate from this abstract class directly
      throw new TypeError('Creating an instance of \'AbsDtopApp\' directly is not permitted. You must inherit it first.')
    }
  }

  /**
   * Part of the mandatory interface. It is used to end the application gracefully.
   */
  endApp () {
    throw new Error('The derived class must override the \'endApp\' method.')
  }

  /**
   * Part of the madatory interface. It is used to specify the app icon's URL (static).
   * @readonly
   * @type {String}
   */
  static get appIconURL () {
    throw new Error('The derived class must override the \'appIconURL\' static getter or provide it as a property/field.')
  }

  /**
   * Part of the mandatory interface. It is used to specify the app name (static).
   * @readonly
   * @type {String}
   */
  static get appName () {
    throw new Error('The derived class must override the \'appName\' static getter or provide it as a property/field.')
  }

  /**
   * Part of the mandatory interface. It is used to specify he app's default/initial size (static).
   * @readonly
   * @type {Object}
   */
  static get defaultAppSize () {
    throw new Error('The derived class must override the \'defaultAppSize\' static getter or provide it as a property/field, to provide an object {width: number, height: number}')
  }
}
