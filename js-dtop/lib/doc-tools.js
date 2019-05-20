
export default {
  /**
   * Used to append a single stylesheet link to the document (to avoid multiple append of the same stylesheet file)
   * @param {String} hrefPath
   * @return {HTMLLinkElement}
   */
  singleCss: hrefPath => {
    /** @type {HTMLLinkElement} */
    let tmpStyle = document.querySelector('link[rel="stylesheet"][href="' + hrefPath + '"]')
    if (!tmpStyle) {
      tmpStyle = document.createElement('link')
      tmpStyle.setAttribute('rel', 'stylesheet')
      tmpStyle.setAttribute('href', hrefPath)
      document.head.appendChild(tmpStyle)
    }
    return tmpStyle
  }
}