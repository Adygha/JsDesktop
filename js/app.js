import Desktop from '../js-dtop/desktop.js'
import {BarPos} from '../js-dtop/desktop.js'
import MemGame from '../js-dtop-app-memory-game/memory-game.js'
import ClickGame from '../js-dtop-app-click-game/click-game.js'

startUp()

function startUp () {
  // let tmpDtop = new Desktop(BarPos.TOP)
  // let tmpDtop = new Desktop(BarPos.BOTTOM)
  // let tmpDtop = new Desktop(BarPos.LEFT)
  let tmpDtop = new Desktop(BarPos.RIGHT)
  tmpDtop.addApp(MemGame)
  tmpDtop.addApp(ClickGame)
  document.body.insertBefore(tmpDtop, document.body.firstChild)
}
