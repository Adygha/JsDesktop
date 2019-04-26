if ('customElements' in window) {
  beginStarter()
} else {
  beginCustElems()
}

function beginCustElems () {
  let tmpScr = document.createElement('script')
  tmpScr.type = 'module'
  tmpScr.src = 'js-dtop-libs/custom-elements.min.js'
  tmpScr.addEventListener('load', beginStarter, false)
  document.head.appendChild(tmpScr)
}

function beginStarter () {
  let tmpScr = document.createElement('script')
  tmpScr.type = 'module'
  tmpScr.src = 'js/app.js'
  document.head.appendChild(tmpScr)
}
