import AbsApp from '../js-dtop/app/abs-app.js'

const APP_PATH = 'js-dtop-app-click-game/' // This app's path
const APP_NAME = 'Click Game' // App's name
const APP_ICON_FILE = APP_PATH + 'click-game-icon.png' // App's icon image
const APP_CSS_FILE = APP_PATH + 'click-game.css' // App's css file
const APP_TEMPL_FILE = APP_PATH + 'click-game.html' // App's template file
const APP_WIDTH = 400   //
const APP_HEIGHT = 425  // App's initial/default size
const HTML_TAG_APP = 'js-dtop-app-click-game' // App's HTML tag name
const HTML_ID_BOARD = 'board' // HTML ID for main game board
const HTML_CLASS_MSGS = 'messages' // HTML class for messages-board
const HTML_ID_TIME = 'time' // HTML ID for timer placeholder
const HTML_ID_COLOR_MSG = 'color-to-click' // HTML ID for chosen color-message
const HTML_CLASS_COLORS = {GREY: 0, RED: 1, BLUE: 2, YELLOW: 3, 0: 'grey', 1: 'red', 2: 'blue', 3: 'yellow'} // HTML classes for different square color

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
  constructor (brickList, timerNode, outputNode) {
    this.meBricks = brickList
    this.meTimeDisp = timerNode
    this.meOutput = outputNode
    this.meCounter = 0
    this.meHandleClick = (ev) => { // A click event handler to be attached with every block of the color display matrix
      if (ev.target.classList.contains(this.meOutput.innerText)) {
        ev.target.classList.remove(this.meOutput.innerText)
        ev.target.classList.add(HTML_CLASS_COLORS[0])
        this.meCounter++
        if (this.meCounter === 3) this.endGame()
      } else {
        this._wrongClick()
      }
    }
    this._resetGame()
  }

  /**
   * Starts the click game.
   */
  startGame () {
    this._resetGame()
    for (let i = 1; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        let tmpBrk
        do {
          tmpBrk = this.meBricks[Math.floor(Math.random() * this.meBricks.length)]
        } while (!tmpBrk.classList.contains(HTML_CLASS_COLORS[0]))
        tmpBrk.classList.remove(HTML_CLASS_COLORS[0])
        tmpBrk.classList.add(HTML_CLASS_COLORS[i])
      }
    }
    this.meOutput.innerText = HTML_CLASS_COLORS[Math.floor(Math.random() * 3) + 1]
    this.meBricks.forEach(brk => brk.addEventListener('click', this.meHandleClick))
    this.meInterval = window.setInterval(() => {
      this.meTime += 0.1
      this.meTimeDisp.innerText = this.meTime.toFixed(1)
    }, 100)
  }

  /**
   * Ends the current running game.
   */
  endGame () {
    this.meCounter = 0
    window.clearInterval(this.meInterval)
    this.meBricks.forEach(brk => brk.removeEventListener('click', this.meHandleClick))
    this.meBricks.forEach(brk => {
      brk.classList.remove(HTML_CLASS_COLORS[0], HTML_CLASS_COLORS[1], HTML_CLASS_COLORS[2], HTML_CLASS_COLORS[3])
      brk.classList.add(HTML_CLASS_COLORS[0])
    })
  }

  /**
   * Resets the game to the initial state to start from scratch.
   * @private
   */
  _resetGame () {
    this.meCounter = 0
    this.meTime = 0.0
    window.clearInterval(this.meInterval)
    this.meBricks.forEach(brk => {
      brk.removeEventListener('click', this.meHandleClick)
      brk.classList.remove(HTML_CLASS_COLORS[0], HTML_CLASS_COLORS[1], HTML_CLASS_COLORS[2], HTML_CLASS_COLORS[3])
      brk.classList.add(HTML_CLASS_COLORS[0])
    })
  }

  /**
   * A method to be called when a wrong color is clicked.
   * @private
   */
  _wrongClick () {
    this.meTimeDisp.classList.add(HTML_CLASS_COLORS[1])
    this.meTime += 3.0
    this.meTimeDisp.innerText = this.meTime.toFixed(1)
    window.setTimeout(() => this.meTimeDisp.classList.remove(HTML_CLASS_COLORS[1]), 400)
  }
}

/**
 * A class that represents the click-game (actually, only the HTML representation of it).
 */
export default class ClickGame extends AbsApp {

  /**
   * Default Constructor.
   */
  constructor () {
    super()
    let tmpStyle = document.createElement('link')
    tmpStyle.setAttribute('rel', 'stylesheet')
    tmpStyle.setAttribute('href', APP_CSS_FILE)
    this.appendChild(tmpStyle)
    fetch(APP_TEMPL_FILE).then(resp => resp.text()).then(docTxt => {
      let tmpDoc = (new DOMParser()).parseFromString(docTxt, 'text/html')
      let tmpBoard = tmpDoc.querySelector('#' + HTML_ID_BOARD).cloneNode(true)
      let tmpBrks = tmpBoard.querySelectorAll('div')
      let tmpMsgs = tmpDoc.querySelector('.' + HTML_CLASS_MSGS).cloneNode(true)
      let tmpTime = tmpMsgs.querySelector('#' + HTML_ID_TIME)
      let tmpColor = document.createElement('span')
      let tmpBut = document.createElement('button')
      this._colBoard = new ColorBoard(tmpBrks, tmpTime, tmpColor)
      tmpBut.innerText = 'Start New Game'
      tmpBut.addEventListener('click', () => this._colBoard.startGame())
      tmpMsgs.querySelector('#' + HTML_ID_COLOR_MSG).appendChild(tmpColor)
      tmpMsgs.appendChild(tmpBut)
      this.appendChild(tmpMsgs)
      this.appendChild(tmpBoard)
    })
  }

  /**
   * Ends the application gracefully.
   */
  endApp () {
    this._colBoard.endGame()
  }

  /**
   * Specifies the app icon's URL (static).
   * @readonly
   * @type {String}
   */
  static get appIconURL () {
    return APP_ICON_FILE
  }

  /**
   * Specifies the app name (static).
   * @readonly
   * @type {String}
   */
  static get appName () {
    return APP_NAME
  }

  /**
   * Specifies the app's default/initial size (static).
   * @readonly
   * @type {Object}
   * @property {Number} width
   * @property {Number} height
   */
  static get defaultAppSize () {
    return {
      width: APP_WIDTH,
      height: APP_HEIGHT
    }
  }
}

window.customElements.define(HTML_TAG_APP, ClickGame)
