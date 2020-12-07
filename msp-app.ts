import xs from 'xstream'
import { run } from '@cycle/run'
import {div, input, p, makeDOMDriver } from '@cycle/dom'
import { makeMspDriver } from './msp-driver.js'
import { mspCMD, mspCMDHeader, mspMessageType } from './protocol.js';

function main(sources) {
  const input$ =  sources.DOM.select('input').events('change')
  .map(ev => ev.target.checked)
  .startWith(false)
  const sinks = {
    DOM: input$.map(toggled =>
      div([
        input({attrs: {type: 'checkbox'}}), 'Toggle me',
        p(toggled ? 'ON' : 'off')
      ])
    ),
    msp: xs.of({
      cmd: mspCMD.MSP_IDENT,
      payload: []
    })
  }
  return sinks
}

// function main(sources) {
//   const incoming$ = sources.msp
//   // Create outgoing$ (stream of string messages)
//   // ...
//   return {
//     msp: outgoing$
//   }
// }

const drivers = {
  DOM: makeDOMDriver('#app'),
  msp: makeMspDriver('/dev/ttyUSB0', 11520)
}
run(main, drivers)
alert('cyclejs')