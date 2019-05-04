import Interface from './libs/interface.js'

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