import Interface from '../js-dtop-libs/interface.js'
// import Window from '../js-dtop-window/window.js'
// import Desktop from '../js-dtop/desktop.js'

export default class IAppObserver extends Interface {

  /**
   * Used to inform that the app's working window object is requested.
   * @return {Window}   the requested window object that the app runs on
   */
  windowObjectRequested () { }

  /**
   * Used to inform that the app's working desktop object is requested.
   * @return {Desktop}   the requested desktop object that the app runs on
   */
  desktopObjectRequested () { }
}