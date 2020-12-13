import { fromEvent, Subject } from 'rxjs'
import { map, filter } from 'rxjs/operators'
import { mspMsg, mspState, port, command, parseMSPCommand } from './msp.js'
// import { mspOutputFunctions } from './msp-view.jsx'

const hexInt = (num, width) => num.toString(16).padStart(width,"0").toUpperCase();
const hexInt8 = num => hexInt(num & 0xFF,2);

const clearMspResult = () => document.getElementById('mspOutput').innerHTML = ""
const printMspResult = mspMsg => document.getElementById('mspOutput').innerHTML = "SUCCESS " + mspMsg.buffer.map(v => hexInt8(v))
// const printMspResult = mspMsg => document.getElementById('mspOutput').innerHTML = "SUCCESS " + mspOutputFunctions[mspMsg.cmd](mspMsg)

const click$ = fromEvent(document.getElementById('mspButton'), 'click')
  .pipe(
    // map(event => command(mspInput["value"],[]))
    map(event => command((document.getElementById('mspInput') as HTMLInputElement).value,[])))
  .subscribe(val => {
    clearMspResult()
    console.log(Buffer.from(val))
    port.write(Buffer.from(val))
  })

var mspObservable = new Subject();
mspObservable.subscribe(printMspResult)

port.on('data', function (data) {
  for (let i = 0; i < data.length; i++) {
    parseMSPCommand(data.readInt8(i))
    if (mspMsg.state == mspState.MSP_COMMAND_RECEIVED) {
      mspObservable.next(mspMsg)
      mspMsg.state = mspState.MSP_IDLE
    } else if (mspMsg.state == mspState.MSP_ERROR_RECEIVED) {
      mspObservable.error(new Error('MSP error received!'))
      mspMsg.state = mspState.MSP_IDLE
    }
  }
})
