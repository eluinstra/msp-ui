import { Stream, MemoryStream } from 'xstream';
import { run } from '@cycle/run';
import { MainDOMSource, VNode, div, input, p, makeDOMDriver } from '@cycle/dom';
//const makeMspDriver = require('./msp-driver');

interface Sources {
  DOM: MainDOMSource;
}

interface Sinks {
  DOM: Stream<VNode>;
}

const main = (sources: Sources): Sinks => {
  const {
    DOM
  } = sources;
  const input$: Stream<boolean> = DOM.select('input').events('change')
    .map(ev => (ev.target as HTMLInputElement).checked)
    .startWith(false);
  const sinks: Sinks = {
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