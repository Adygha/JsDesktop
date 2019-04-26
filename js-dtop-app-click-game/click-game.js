import AbsDtopApp from '../js-dtop/abs-dtop-app.js'

const APP_PATH = 'js-dtop-app-click-game/' // This app's path
const APP_NAME = 'Click Game' // App's name
const APP_ICON = APP_PATH + 'click-game.png' // App's icon image
const APP_WIDTH = 400   //
const APP_HEIGHT = 425  // App's initial/default size

/**
 * A class that represents the actual game with the most game features (originally 'color-board').
 */
class ColorBoard {

  /**
   * Constructor that takes the output elements as parameters.
   * @param {NodeList} brickList  the list of elements that represents the color display matrix.
   * @param {Element} timerNode   the element to display the timer.
   * @param {Element} outputNode  the element to output the randomly chosen color.
   */
  constructor(brickList, timerNode, outputNode) {
    this.meCOLORS = { GREY: 0, RED: 1, BLUE: 2, YELLOW: 3, 0: 'grey', 1: 'red', 2: 'blue', 3: 'yellow' }
    this.meBricks = brickList
    this.meTimeDisp = timerNode
    this.meOutput = outputNode
    this.meCounter = 0

    this.meClickHandler = (ev) => { // A click event handler to be attached with every block of the color display matrix
      if (ev.target.classList.contains(this.meOutput.innerText)) {
        ev.target.classList.remove(this.meOutput.innerText)
        ev.target.classList.add(this.meCOLORS[0])
        this.meCounter++
        if (this.meCounter === 3) {
          this.endGame()
        }
      } else {
        this._wrongClick()
      }
    }
    this._resetGame()
  }

  /**
   * Starts the click game.
   */
  startGame() {
    this._resetGame()
    for (let i = 1; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        let tmpBrk
        do {
          tmpBrk = this.meBricks[Math.floor(Math.random() * this.meBricks.length)]
        } while (!tmpBrk.classList.contains(this.meCOLORS[0]))
        tmpBrk.classList.remove(this.meCOLORS[0])
        tmpBrk.classList.add(this.meCOLORS[i])
      }
    }
    this.meOutput.innerText = this.meCOLORS[Math.floor(Math.random() * 3) + 1]
    this.meBricks.forEach(brk => brk.addEventListener('click', this.meClickHandler))
    this.meInterval = window.setInterval(() => {
      this.meTime += 0.1
      this.meTimeDisp.innerText = this.meTime.toFixed(1)
    }, 100)
  }

  /**
   * Ends the current running game.
   */
  endGame() {
    this.meCounter = 0
    window.clearInterval(this.meInterval)
    this.meBricks.forEach(brk => brk.removeEventListener('click', this.meClickHandler))
    this.meBricks.forEach(brk => {
      brk.classList.remove(this.meCOLORS[0], this.meCOLORS[1], this.meCOLORS[2], this.meCOLORS[3])
      brk.classList.add(this.meCOLORS[0])
    })
  }

  /**
   * Resets the game to the initial state to start from scratch.
   */
  _resetGame() {
    this.meCounter = 0
    this.meTime = 0.0
    window.clearInterval(this.meInterval)
    this.meBricks.forEach(brk => {
      brk.removeEventListener('click', this.meClickHandler)
      brk.classList.remove(this.meCOLORS[0], this.meCOLORS[1], this.meCOLORS[2], this.meCOLORS[3])
      brk.classList.add(this.meCOLORS[0])
    })
  }

  /**
   * A method to be called when a wrong color is clicked.
   */
  _wrongClick() {
    this.meTimeDisp.classList.add(this.meCOLORS[1])
    this.meTime += 3.0
    this.meTimeDisp.innerText = this.meTime.toFixed(1)
    window.setTimeout(() => this.meTimeDisp.classList.remove(this.meCOLORS[1]), 400)
  }
}

/**
 * A class that represents the click-game (actually, only the HTML representation of it).
 */
export default class ClickGame extends AbsDtopApp {

  /**
   * Default Constructor.
   */
  constructor(appHtmlContainer) {
    super(appHtmlContainer)
    appHtmlContainer.style.flex = '1 1 auto'  //
    appHtmlContainer.style.overflowY = 'auto' // Add style suitable for this app (when resizing for example)
    let tmpStyle = document.createElement('link')
    tmpStyle.setAttribute('rel', 'stylesheet')
    tmpStyle.setAttribute('href', APP_PATH + 'click-game.css')
    this.appendChild(tmpStyle)
    fetch('js-dtop-app-click-game/click-game.html').then(resp => resp.text()).then(docTxt => {
      let tmpDoc = (new DOMParser()).parseFromString(docTxt, 'text/html')
      let tmpBoard = tmpDoc.querySelector('#board').cloneNode(true)
      let tmpBrks = tmpBoard.querySelectorAll('div')
      let tmpMsgs = tmpDoc.querySelector('.messages').cloneNode(true)
      let tmpTime = tmpMsgs.querySelector('#time')
      let tmpColor = document.createElement('span')
      let tmpBut = document.createElement('button')
      this._colBoard = new ColorBoard(tmpBrks, tmpTime, tmpColor)
      tmpBut.innerText = 'Start New Game'
      tmpBut.addEventListener('click', () => this._colBoard.startGame())
      tmpMsgs.querySelector('#colorToClick').appendChild(tmpColor)
      tmpMsgs.appendChild(tmpBut)
      this.appendChild(tmpMsgs)
      this.appendChild(tmpBoard)
    })
  }

  /**
   * Ends the application gracefully.
   */
  endApp() {
    this._colBoard.endGame()
  }

  /**
   * Specifies the app icon's URL (static).
   * @readonly
   * @type {String}
   */
  static get appIconURL() {
    return APP_ICON
  }

  /**
   * Specifies the app name (static).
   * @readonly
   * @type {String}
   */
  static get appName() {
    return APP_NAME
  }

  /**
   * Specifies the app's default/initial size (static).
   * @readonly
   * @type {Object}
   */
  static get defaultAppSize() {
    return {
      width: APP_WIDTH,
      height: APP_HEIGHT
    }
  }
}

window.customElements.define('my-app-click-game', ClickGame)
