import React, { useState, useEffect } from 'react'
import { BehaviorSubject, fromEvent, Subject } from 'rxjs'
import { map, filter, tap, startWith, mergeMap } from 'rxjs/operators'
import { useObservable } from '@/common/RxTools'
import { MspMsg, mspRequest, mspResponse$ } from '@/component/msp/MspDriver'
import { mspOutputFunctions } from '@/component/msp/MspView'
import { MspCmd } from '@/component/msp/MspProtocol'
import { Button, NativeSelect, TextField } from '@material-ui/core'

export const MspInput = () => {
  const mspButtonSubject = new Subject()
  const mspButtonClick = () => mspButtonSubject.next()
  const mspInputSubject = new BehaviorSubject("")
  const MspInputChange = v => mspInputSubject.next(v)
  const mspOutput = useObservable(mspResponse$
    .pipe(
      map(mspMsg  => mspOutputFunctions[(mspMsg as MspMsg).cmd](mspMsg))))
  useEffect(() => {
    const click$ = mspButtonSubject
      .pipe(
        mergeMap(e => mspInputSubject),
        filter(v => v != "")
      )
    const sub = click$
      .subscribe(val => {
        mspRequest(val,[])
      })
    return () => sub.unsubscribe()
  }, [mspButtonSubject]);
  return (
    <React.Fragment>
      {/* <TextField label="cmd" onChange={e => setMspInput(e.target.value)} /> */}
      <NativeSelect onChange={e => MspInputChange(e.target.value)}>
        <option aria-label="None" value="">None</option>
        {Object.keys(MspCmd).map(key =>
          <option key={MspCmd[key]} value={MspCmd[key]}>{key}</option>
        )}
      </NativeSelect>
      <Button variant="contained" color="secondary" onClick={e => mspButtonClick()}>MSP Go</Button>
      {mspOutput}
    </React.Fragment>
  )
}
