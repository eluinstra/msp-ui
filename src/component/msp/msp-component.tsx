import React, { useState, useEffect } from 'react'
import { fromEvent, Subject } from 'rxjs'
import { map, filter, tap, startWith } from 'rxjs/operators'
import { useObservable } from '@/common/rx-tools'
import { serialPort, command, mspCmdResponse$, mspMsg } from '@/component/msp/msp-driver'
import { mspOutputFunctions } from '@/component/msp/msp-view'
import { MspCmd } from '@/component/msp/msp-protocol';
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
        map(event => mspInput["value"]),
        filter(value => value != ""),
        map(value => command(value,[]))
      )
    const sub = click$
      .subscribe(val => {
        serialPort.write(Buffer.from(val))
      })
    return () => sub.unsubscribe()
  });
  return <React.Fragment>
      <NativeSelect id="mspInput">
        <option aria-label="None" value="">None</option>
        {Object.keys(MspCmd).map(key =>
          <option key={MspCmd[key]} value={MspCmd[key]}>{key}</option>
        )}
      </NativeSelect>
      <Button id="mspButton" variant="contained" color="secondary">MSP Go</Button>
      <div>{mspOutput}</div>
    </React.Fragment>
}
