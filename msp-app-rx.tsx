import React from 'react'
import ReactDOM from 'react-dom'
import { fromEvent, Subject } from 'rxjs'
import { map, filter } from 'rxjs/operators'
import { mspMsg, mspState, port, command, parseMSPCommand } from './msp.js'
import { mspOutputFunctions } from './msp-view.js'

const clearMspResult = () => ReactDOM.render(<div/>,document.querySelector('#mspOutput'))
const printMspResult = mspMsg => ReactDOM.render(mspOutputFunctions[mspMsg.cmd](mspMsg),document.querySelector('#mspOutput'))

const click$ = fromEvent(document.getElementById('mspButton'), 'click')
  .pipe(
    // map(event => command(mspInput["value"],[]))
    map(event => command((document.getElementById('mspInput') as HTMLInputElement).value,[])))
  .subscribe(val => {
    clearMspResult()
    port.write(Buffer.from(val))
  })

const mspObservable = new Subject();
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
