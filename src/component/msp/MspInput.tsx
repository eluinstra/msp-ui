import React, { useState, useEffect } from 'react'
import { BehaviorSubject, fromEvent, Subject } from 'rxjs'
import { distinctUntilChanged, map, filter, tap, startWith, mergeMap } from 'rxjs/operators'
import { useStatefulObservable, useStatefulSubject, useSubject } from '@/common/RxTools'
import { MspMsg, mspRequest, mspResponse$ } from '@/component/msp/MspDriver'
import { mspOutputFunctions } from '@/component/msp/MspView'
import { MspCmd } from '@/component/msp/MspProtocol'
import { Button, NativeSelect, TextField } from '@material-ui/core'

const notEmpty = v => v != ""

export const MspInput = () => {
  const [ onClick, clickSubject ] = useSubject()
  const [ cmd, onCmdChange ] = useStatefulSubject<string>()
  const mspMsg = useStatefulObservable<MspMsg>(mspResponse$
    .pipe(
      map(mspMsg  => mspOutputFunctions[mspMsg.cmd](mspMsg))
  ))
  useEffect(() => {
    const click$ = clickSubject
      .pipe(
        map(_ => cmd),
        filter(notEmpty)
      )
    const sub = click$
      .subscribe(val => {
        mspRequest(val,[])
      })
    return () => sub.unsubscribe()
  }, [clickSubject]);
  return (
    <React.Fragment>
      {/* <TextField label="cmd" onChange={e => onCmdChange(e.target.value)} /> */}
      <NativeSelect onChange={e => onCmdChange(e.target.value)}>
        <option aria-label="None" value="">None</option>
        {Object.keys(MspCmd).map(key =>
          <option key={MspCmd[key]} value={MspCmd[key]}>{key}</option>
        )}
      </NativeSelect>
      <Button variant="contained" color="secondary" onClick={_ => onClick()}>MSP Go</Button>
      {mspMsg}
    </React.Fragment>
  )
}
