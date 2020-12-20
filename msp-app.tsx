import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { fromEvent, Subject } from 'rxjs'
import { map, filter } from 'rxjs/operators'
import { mspMsg, mspState, serialPort, command, parseMSPCommand } from './msp.js'
import { mspOutputFunctions } from './msp-view.js'

const renderMspComponent = () => ReactDOM.render(<MspComponent />,document.querySelector('#app'))
const clearMspResult = () => ReactDOM.render(<div/>,document.querySelector('#mspOutput'))
const printMspResult = mspMsg => ReactDOM.render(mspOutputFunctions[mspMsg.cmd](mspMsg),document.querySelector('#mspOutput'))

const MspComponent = (props) => {
  useEffect(() => {
    const subscription = fromEvent(document.getElementById('mspButton'), 'click')
    .pipe(
      // map(event => command(mspInput["value"],[]))
      map(event => command((document.getElementById('mspInput') as HTMLInputElement).value,[])))
    .subscribe(val => {
      clearMspResult()
      serialPort.write(Buffer.from(val))
    })
    return () => subscription.unsubscribe()
  });
  return <div>
    <select id="mspInput">
      <option value="100">MSP_IDENT</option>
      <option value="1">MSP_API_VERSION</option>
      <option value="2">MSP_FC_VARIANT</option>
      <option value="3">MSP_FC_VERSION</option>
    </select>
    <button id="mspButton">MSP Go</button>
    <div id="mspOutput"/>
  </div> 
}

const mspCmdObservable = new Subject();
mspCmdObservable.subscribe(printMspResult)

serialPort.on('data', function (data) {
  for (let i = 0; i < data.length; i++) {
    parseMSPCommand(data.readInt8(i))
    if (mspMsg.state == mspState.MSP_COMMAND_RECEIVED) {
      mspCmdObservable.next(mspMsg)
      mspMsg.state = mspState.MSP_IDLE
    } else if (mspMsg.state == mspState.MSP_ERROR_RECEIVED) {
      mspCmdObservable.error(new Error('MSP error received!'))
      mspMsg.state = mspState.MSP_IDLE
    }
  }
})

renderMspComponent()