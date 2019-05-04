import IWindowObserver from '../../js-dtop-window/i-window-observer.js';

export default class IIconObserver extends IWindowObserver {

  /**
   * Used to request placing the specified icon (an HTML element) on the desktop.
   * @param {HTMLElement} iconElement   the HTML element that represent the icon
   */
  placeDesktopIcon (iconElement) { }

  /**
   * Used to request placing the specified icon (an HTML element) on the desktop-bar.
   * @param {HTMLElement} iconElement   the HTML element that represent the icon
   */
  placeBarIcon (iconElement) { }
}
