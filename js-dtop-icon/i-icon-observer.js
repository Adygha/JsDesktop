import IWindowObserver from '../js-dtop-window/i-window-observer.js';

export default class IIconObserver extends IWindowObserver {

  ///**
  // * Default constructor.
  // */
  //constructor() {
  //  super()
  //  if (new.target === IIconObserver) { // Check if an object begins to instatiate from this abstract class directly
  //    throw new TypeError('Creating an instance of \'IIconObserver\' directly is not permitted. You must extend it first or use the \'implement\' static method.')
  //  }
  //}

  /**
   *
   * @param {HTMLElement} iconElement
   */
  placeDesktopIcon(iconElement) { }

  /**
   *
   * @param {HTMLElement} iconElement
   */
  placeBarIcon(iconElement) { }
}
