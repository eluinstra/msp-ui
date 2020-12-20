import React, { useState, useEffect } from 'react'
import { fromEvent, Subject } from 'rxjs'
import { map, filter, startWith } from 'rxjs/operators'
import { useObservable } from './rx-tools'
import { serialPort, command, mspCmdResponse$, mspMsg } from './msp-driver'
import { mspOutputFunctions } from './msp-view'
import { MspCmd } from './msp-protocol';
import { Button, NativeSelect } from '@material-ui/core';

export const MspComponent = (props) => {
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
      <NativeSelect id="mspInput">
        {Object.keys(MspCmd).map(key =>
          <option key={MspCmd[key]} value={MspCmd[key]}>{key}</option>
        )}
      </NativeSelect>
      <Button id="mspButton" color="primary">MSP Go</Button>
      <div>{mspOutput}</div>
    </div> 
}
