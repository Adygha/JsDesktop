import Interface from '../js-dtop-libs/interface.js'
// import Window from './window.js'

export default class IWindowObserver extends Interface {

  /**
   *
   * @param {Window} theWindow
   */
  windowCreated (theWindow) { }

  /**
   *
   * @param {Window} theWindow
   */
  windowClosed (theWindow) { }

  /**
   *
   * @param {Window} theWindow
   */
  windowMaximized (theWindow) { }

  /**
   *
   * @param {Window} theWindow
   */
  windowMinimized (theWindow) { }

  /**
   *
   * @param {Window} theWindow
   */
  windowFocused (theWindow) { }
}