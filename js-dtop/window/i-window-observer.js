import Interface from '../../libs/interface.js'
// import Window, {WindowGrabType} from './window.js'

export default class IWindowObserver extends Interface {

  /**
   * Used to inform that the specified window is created now.
   * @param {Window} theWindow  the window that is created
   */
  windowCreated (theWindow) { }

  /**
   * Used to inform that the specified window is closed now.
   * @param {Window} theWindow  the window that is closed
   */
  windowClosed (theWindow) { }

  /**
   * Used to inform that the specified window is maximized now.
   * @param {Window} theWindow  the window that is maximized
   */
  windowMaximized (theWindow) { }

  /**
   * Used to inform that the specified window is minimized now.
   * @param {Window} theWindow  the window that is minimized
   */
  windowMinimized (theWindow) { }

  /**
   * Used to inform that the specified window has focus now.
   * @param {Window} theWindow  the window that has focus
   */
  windowFocused (theWindow) { }

  /**
   * Used to inform that the specified window is being grabbed now (for resizing or moving).
   * @param {Window} theWindow          the window that has focus
   * @param {WindowGrabType} grabType   specifies the type of grab (which part of the window is grabbed/moved)
   * @param {MouseEvent} mouseEv        the grabbing mouse-event related to grabbing
   */
  windowGrabbed (theWindow, grabType, mouseEv) { }

  /**
   * Used to inform that the window's working desktop object is requested.
   * @return {Desktop}   the requested desktop object that the window runs on
   */
  desktopObjectRequested () { }
}