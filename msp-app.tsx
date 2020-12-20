import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { fromEvent, Subject } from 'rxjs'
import { map, filter, startWith } from 'rxjs/operators'
import { serialPort, command, mspCmdResponse$, mspMsg } from './msp.js'
import { mspOutputFunctions } from './msp-view.js'
import { MspCmd } from './protocol';

const renderMspComponent = () => ReactDOM.render(<MspComponent />,document.querySelector('#app'))

const useObservable = observable => {
  const [state, setState] = useState();
  useEffect(() => {
    const sub = observable.subscribe(setState);
    return () => sub.unsubscribe();
  }, [observable]);
  return state;
};

const MspComponent = (props) => {
  const mspOutput = useObservable(mspCmdResponse$
    .pipe(
      map(mspMsg  => mspOutputFunctions[mspMsg['cmd']](mspMsg))))
  useEffect(() => {
    const mspButton = document.getElementById('mspButton')
    const mspInput = document.getElementById('mspInput')
    const click$ = fromEvent(mspButton, 'click')
      .pipe(
        map(event => command(mspInput["value"],[])))
    const sub = click$
      .subscribe(val => {
        serialPort.write(Buffer.from(val))
      })
    return () => sub.unsubscribe()
  });
  return <div>
    <select id="mspInput">
      {Object.keys(MspCmd).map(key =>
        <option key={MspCmd[key]} value={MspCmd[key]}>{key}</option>
      )}
    </select>
    <button id="mspButton">MSP Go</button>
    <div>{mspOutput}</div>
  </div> 
}

renderMspComponent()