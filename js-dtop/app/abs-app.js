
/**
 * An abstract (as best as I could to work with the project) class that every js-desktop-app should extend. Normally,
 * we cannot create an object of this class because we did not use 'window.customElements.define' for it, but even if
 * it was used, we cannot create an object from it directly, and we must extend it first.
 */
export default class AbsApp extends HTMLElement {

  /**
   * Default Constructor.
   */
  constructor () {
    super()
    if (new.target === AbsApp) { // Check if an object begins to instantiate from this abstract class directly
      throw new TypeError('Creating an instance of \'AbsApp\' directly is not permitted. You must inherit it first.')
    }
  }

  /**
   * Must override. It is used to end the application gracefully.
   */
  endApp () {
    throw new Error('The derived class must override the \'endApp\' method.')
  }

  /**
   * Must override. It is used to specify the app icon's URL (static).
   * @readonly
   * @type {String}
   */
  static get appIconURL () {
    throw new Error('The derived class must override the \'appIconURL\' static getter or provide it as a property/field.')
  }

  /**
   * Must override. It is used to specify the app name (static).
   * @readonly
   * @type {String}
   */
  static get appName () {
    throw new Error('The derived class must override the \'appName\' static getter or provide it as a property/field.')
  }

  /**
   * Must override. It is used to specify the app's default/initial size (static).
   * @readonly
   * @type {Object}
   * @property {Number} width
   * @property {Number} height
   */
  static get defaultAppSize () {
    throw new Error('The derived class must override the \'defaultAppSize\' static getter or provide it as a property/field, to provide an object {width: number, height: number}')
  }
}
