import AbsDtopApp from '../js-dtop/abs-dtop-app.js';

const APP_PATH = 'js-dtop-app-memory-game/' // This app's path
const TIMER_INCORRECT = 1000 // Timer interval when an incorrect match chosen
const TIMER_CORRECT = 300 // Timer interval when a correct match chosen
const APP_NAME = 'Memory Game' // App's name
const APP_ICON = APP_PATH + 'memory-game.png' // App's icon image
const APP_WIDTH = 320   //
const APP_HEIGHT = 420  // App's initial/default size
const CLASS_IMAGE = 'img'       //
const CLASS_CARD = 'game-card-' // CSS classes for the cardsW
const CLASS_ERR = 'img-error'   //

/**
 * A class that represents a flipping card in the memory-game
 */
class GameCard extends HTMLElement {

  /**
   * Constructor that takes the card's properties as parameters
   * @param {number} insideValue    the card's value that represent the picture that it represents.
   * @param {number} percentage     the percentage to split the cards to in each row (either 25 or 50 -make it better later-).
   * @param {boolean} [isNotActive] 'true' to specify if the card is not active (default is 'false').
   */
  constructor(insideValue, percentage, isNotActive) {
    super()
    this.meInVal = insideValue
    this.mePercent = percentage
    let tmpStyle = document.createElement('link')
    tmpStyle.setAttribute('rel', 'stylesheet')
    tmpStyle.setAttribute('href', APP_PATH + 'game-card.css')
    this.appendChild(tmpStyle)
    this.meAnch = document.createElement('div')
    this.meAnch.classList.add(CLASS_CARD + this.mePercent)
    this.meAnch.classList.add(CLASS_IMAGE + 0)
    this.appendChild(this.meAnch)
    if (isNotActive) {
      this.flipCard(false)
      // this.meAnch.removeAttribute('href')
    }
  }

  /**
   * Flips this card object to shown/hidden/toggle state depending on specification.
   * @param {Boolean} [isHidden]  'true' to specify whether to flip the card to a hidden state.
   */
  flipCard(isHidden) {
    if (isHidden === true) { // If hidden is requested
      this.meAnch.classList.add(CLASS_IMAGE + 0)
      this.meAnch.classList.remove(CLASS_IMAGE + this.meInVal)
    } else if (isHidden === false) { // If hidden is not requested
      this.meAnch.classList.add(CLASS_IMAGE + this.meInVal)
      this.meAnch.classList.remove(CLASS_IMAGE + 0)
    } else { // Else, if neither is requested, just switch/toggle
      this.meAnch.classList.toggle(CLASS_IMAGE + 0)
      this.meAnch.classList.toggle(CLASS_IMAGE + this.meInVal)
    }
  }

  /**
   * Flips this card object to error/no-error/toggle state depending on specification.
   * @param {boolean} isError 'true' to specify whether to flip the card to an error state.
   */
  flipError(isError) {
    if (isError === true) { // If error state is requested
      this.meAnch.classList.add(CLASS_ERR)
    } else if (isError === false) { // If error state is not requested
      this.meAnch.classList.remove(CLASS_ERR)
    } else { // Else, if neither is requested, just switch/toggle
      this.meAnch.classList.toggle(CLASS_ERR)
    }
  }

  /**
   * Deactivates this card object so that no image to display (make it dissapear but its place still taken).
   */
  deactivate() {
    this.meAnch.classList.remove(CLASS_IMAGE + 0)
    this.meAnch.classList.remove(CLASS_IMAGE + this.meInVal)
  }

  /**
   * The numerical inside value of this card object.
   * @readonly
   * @type {Number}
   */
  get insideValue() {
    return this.meInVal
  }

  /**
   * To check if this card object is shown.
   * @readonly
   * @type {Boolean}
   */
  get isShown() {
    return this.meAnch.classList.contains(CLASS_IMAGE + this.meInVal)
  }

  /**
   * To check if this card object is deactivated.
   * @readonly
   * @type {Boolean}
   */
  get isDeactivated() {
    for (let i = 0; i < this.meAnch.classList.length; i++) {
      if (this.meAnch.classList.item(i).startsWith(CLASS_IMAGE)) {
        return false
      }
    }
    return true
  }
}

window.customElements.define('js-dtop-app-game-card', GameCard)

/**
 * A class that represents a memory-game app.
 */
export default class MemoryGame extends AbsDtopApp {

  /**
   * A constructor that takes this app's HTML element that will contain it as a parameter.
   * @param {HTMLElement} appHtmlContainer  the HTML element that will contain (or its shadow) this app
   */
  constructor (appHtmlContainer) {
    super(appHtmlContainer)
    appHtmlContainer.style.flex = '1 1 auto'  //
    appHtmlContainer.style.overflowY = 'auto' // Add style suitable for this app (when resizing for example)
    this.meCardCount = 8
    this._renderApp()
  }

  /**
   * Ends the application gracefully.
   */
  endApp () {
    window.clearInterval(this.meInterval)
  }

  /**
   * Specifies the app icon's URL (static).
   * @readonly
   * @type {String}
   */
  static get appIconURL () {
    return APP_ICON
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
   */
  static get defaultAppSize() {
    return {
      width: APP_WIDTH,
      height: APP_HEIGHT
    }
  }

  /**
   * Renders the app components
   */
  _renderApp() {
    this.meCounter = 0
    let tmpStyle = document.createElement('link')
    let tmpLeg = document.createElement('legend')
    this.mePlayBoard = document.createElement('fieldset')
    this.meMatchBoard = document.createElement('fieldset')
    this.meScoreBoard = document.createElement('fieldset')

    tmpStyle.setAttribute('rel', 'stylesheet')
    tmpStyle.setAttribute('href', APP_PATH + 'memory-game.css')
    this.appendChild(tmpStyle)
    tmpLeg.innerText = 'Play Board'
    this.mePlayBoard.appendChild(tmpLeg)
    this.mePlayBoard.classList.add(this.meCardCount === 4 ? 'game-board-2' : 'game-board-4')
    tmpLeg = document.createElement('legend')
    tmpLeg.innerText = 'Match Board'
    this.meMatchBoard.appendChild(tmpLeg)
    this.meMatchBoard.classList.add(this.meCardCount === 4 ? 'game-board-2' : 'game-board-4')
    tmpLeg = document.createElement('legend')
    tmpLeg.innerText = 'Score'
    this.meScoreBoard.appendChild(tmpLeg)
    this.meScoreBoard.classList.add(this.meCardCount === 4 ? 'game-board-2' : 'game-board-4')
    this.meScoreBoard.appendChild(document.createElement('div'))

    this.meCards = new Array(this.meCardCount)
    for (let i = 0; i < this.meCards.length; i++) {
      this.meCards[i] = new GameCard(Math.floor(i / 2) + 1, this.meCardCount === 4 ? 50 : 25)
    }
    this.mePlayBoard.addEventListener('click', ev => {
      if (ev.target.parentNode instanceof GameCard &&
        !ev.target.parentNode.isDeactivated && !ev.target.parentNode.isShown) {
        if (!this.meInterval) {
          this.meInterval = window.setInterval(() => {
            this.meTime += 0.1
            this.meTimeBoard.innerText = this.meTime.toFixed(1)
          }, 100)
        }
        ev.target.parentNode.flipCard()
        let tmpShown = this.meCards.filter(elem => elem.isShown)
        if (tmpShown.length > 1) {
          this.meCounter++
          if (tmpShown[0].insideValue === tmpShown[1].insideValue) {
            this._correctTimer(tmpShown)
          } else {
            this._wrongTimer(tmpShown)
          }
        }
      }
    })
    this._shuffleCards()
    this.meCards.forEach(elem => this.mePlayBoard.appendChild(elem))
    this.appendChild(this.meScoreBoard)
    this.meScoreBoard = this.meScoreBoard.lastElementChild
    this.meScoreBoard.appendChild(document.createTextNode('Time: '))
    this.meTimeBoard = document.createElement('span')
    this.meScoreBoard.appendChild(this.meTimeBoard)
    this.meScoreBoard.appendChild(document.createTextNode(' Tries: '))
    this.meScoreBoard.appendChild(document.createElement('span'))
    this.meScoreBoard = this.meScoreBoard.lastElementChild
    this.meTimeBoard.innerText = '0.0'
    this.meScoreBoard.innerText = '0'
    this.appendChild(this.mePlayBoard)
    this.appendChild(this.meMatchBoard)
    this.meTime = 0.0
    this._addControlBoard()
  }

  /**
   * Shuffles the cards' array
   */
  _shuffleCards() {
    for (let i = this.meCards.length - 1; i > 0; i--) { // Shuffle the array. From 'https://www.frankmitchell.org/2015/01/fisher-yates/'
      let tmpRand = Math.floor(Math.random() * (i + 1))
      let tmpElem = this.meCards[i]
      this.meCards[i] = this.meCards[tmpRand]
      this.meCards[tmpRand] = tmpElem
    }
  }

  /**
   * Starts a timeout timer when the player flips a match pair.
   * @param {Array<GameCard>} shownCards an array of shown cards (it is of size two)
   */
  _correctTimer(shownCards) {
    this.mePlayBoard.disabled = true
    window.setTimeout(() => {
      shownCards[0].deactivate()
      shownCards[1].deactivate()
      this.meMatchBoard.appendChild(new GameCard(shownCards[0].insideValue, this.meCardCount === 4 ? 50 : 25, true))
      this.meMatchBoard.appendChild(new GameCard(shownCards[1].insideValue, this.meCardCount === 4 ? 50 : 25, true))
      let tmpIsFin = true
      for (let i = 0; i < this.meCards.length; i++) {
        if (!this.meCards[i].isDeactivated) {
          tmpIsFin = false
          break
        }
      }
      this.meScoreBoard.innerText = this.meCounter
      if (tmpIsFin) {
        this.meScoreBoard.innerText += ' HAYY... You Win.'
        window.clearInterval(this.meInterval)
        this.meInterval = null
        this.meTime = 0.0
      }
      this.mePlayBoard.disabled = false
    }, TIMER_CORRECT)
  }

  /**
   * Starts a timeout timer when the player flips a mismatch pair
   * @param {GameCard[]} shownCards an array of shown cards (it is of size two)
   */
  _wrongTimer(shownCards) {
    this.mePlayBoard.disabled = true
    this.meScoreBoard.innerText = this.meCounter
    shownCards.forEach(elem => elem.flipError(true))
    window.setTimeout(() => {
      shownCards.forEach(elem => {
        elem.flipError(false)
        elem.flipCard(true)
      })
      this.mePlayBoard.disabled = false
    }, TIMER_INCORRECT)
  }

  /**
   * This method is for adding the game control board.
   */
  _addControlBoard() {
    fetch('js-dtop-app-memory-game/memory-game.html').then(resp => resp.text()).then(docTxt => { // fetch the game html template
      let tmpBoard = (new DOMParser()).parseFromString(docTxt, 'text/html').querySelector('#control-board').cloneNode(true)
      let tmpBut = tmpBoard.querySelector('#game-start-but')
      let tmpChoice = tmpBoard.querySelector('#game-choice')
      switch (this.meCardCount) {
        case 16:
          tmpChoice.selectedIndex = 0
          break
        case 8:
          tmpChoice.selectedIndex = 1
          break
        default:
          tmpChoice.selectedIndex = 2
      }
      tmpBut.addEventListener('click', () => {
        if (this.meInterval) {
          window.clearInterval(this.meInterval)
          this.meInterval = null
        }
        while (this.lastChild) {
          this.removeChild(this.lastChild)
        }
        this.meCardCount = parseInt(tmpChoice.options[tmpChoice.selectedIndex].value, 10)
        console.log(this.meCardCount)
        this._renderApp()
      })
      this.insertBefore(tmpBoard, this.firstElementChild)
    })
  }
}

window.customElements.define('js-dtop-app-memory-game', MemoryGame)