import React, { useState, useEffect } from 'react'
import { fromEvent, Subject } from 'rxjs'
import { map, filter, tap, startWith } from 'rxjs/operators'
import { useObservable } from '@/common/rx-tools'
import { MspMsg, mspRequest, mspResponse$ } from '@/component/msp/msp-driver'
import { mspOutputFunctions } from '@/component/msp/msp-view'
import { MspCmd } from '@/component/msp/msp-protocol'
import { Button, NativeSelect } from '@material-ui/core'

export const MspInput = props => {
  const mspOutput = useObservable(mspResponse$
    .pipe(
      map(mspMsg  => mspOutputFunctions[(mspMsg as MspMsg).cmd](mspMsg))))
  useEffect(() => {
    const mspButton = document.getElementById('mspButton')
    const mspInput = document.getElementById('mspInput')
    const click$ = fromEvent(mspButton, 'click')
      .pipe(
        map(event => (mspInput as HTMLInputElement).value),
        filter(value => value != "")
      )
    const sub = click$
      .subscribe(val => {
        mspRequest(val,[])
      })
    return () => sub.unsubscribe()
  });
  return (
    <React.Fragment>
      <NativeSelect id="mspInput">
        <option aria-label="None" value="">None</option>
        {Object.keys(MspCmd).map(key =>
          <option key={MspCmd[key]} value={MspCmd[key]}>{key}</option>
        )}
      </NativeSelect>
      <Button id="mspButton" variant="contained" color="secondary">MSP Go</Button>
      <div>{mspOutput}</div>
    </React.Fragment>
  )
}
