import { run } from '@cycle/run';
import { div, input, p, makeDOMDriver } from '@cycle/dom';
//const makeMspDriver = require('./msp-driver');

const main = (sources) => {
  const {
    DOM
  } = sources;
  const input$ = DOM.select('input').events('change')
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