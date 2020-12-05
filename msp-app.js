const xs = require('xstream').default;
const run = require('@cycle/run').default;
const div = require('@cycle/dom').div;
const input = require('@cycle/dom').input;
const p = require('@cycle/dom').p;
const makeDOMDriver = require('@cycle/dom').makeDOMDriver;
//const makeMspDriver = require('./msp-driver');

function main(sources) {
  const input$ = sources.DOM.select('input').events('change')
    .map(ev => ev.target.checked)
    .startWith(false);
  const sinks = {
    DOM: input$.map(toggled =>
      div([
        input({attrs: {type: 'checkbox'}}), 'Toggle me',
        p(toggled ? 'ON' : 'off')
      ])
    )
  };
  return sinks;
}

// function main(sources) {
//   const incoming$ = sources.msp;
//   // Create outgoing$ (stream of string messages)
//   // ...
//   return {
//     msp: outgoing$
//   };
// }

const drivers = {
  DOM: makeDOMDriver('#app'),
 // msp: makeMspDriver('/dev/ttyUSB0', 11520)
};
run(main, drivers);
alert('cyclejs')