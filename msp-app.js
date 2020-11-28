import xs from 'xstream';
import {run} from '@cycle/run';
import {div, makeDOMDriver} from '@cycle/dom';
import {makeMspDriver} from './msp-driver';

function main(sources) {
  const sinks = {DOM: null};
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
  msp: makeMspDriver('/dev/ttyUSB0', 11520)
};

run(main, drivers);