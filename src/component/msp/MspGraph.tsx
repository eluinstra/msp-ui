import React, { useEffect } from 'react'
import { BehaviorSubject, merge, Subject } from 'rxjs'
import { map, filter, mergeMap, delay, tap } from 'rxjs/operators'
import { useStatefulObservable, useStatefulSubject, useSubject } from '@/common/RxTools'
import { MspMsg, mspRequest, mspResponse$ } from '@/component/msp/MspDriver'
import { mspOutputFunctions } from '@/component/msp/MspView'
import { MspCmd } from '@/component/msp/MspProtocol'
import { Button, NativeSelect, TextField } from '@material-ui/core'

const notEmpty = v => v != ""

export const MspGraph = () => {
  const [ onClick, clickSubject ] = useSubject()
  const [ cmd, onCmdChange ] = useStatefulSubject<string>()
  const mspMsg = useStatefulObservable<MspMsg>(mspResponse$
    .pipe(
      map(mspMsg  => mspOutputFunctions[mspMsg.cmd](mspMsg))
  ))
  useEffect(() => {
    const $ = mspResponse$
      .pipe(
        tap(e => console.log("RES")),
        tap(e => onClick())
      )
    const click$ = merge(clickSubject,$)
      .pipe(
        delay(1000),
        tap(e => console.log("START")),
        map(e => cmd),
        filter(notEmpty)
      )
    const sub = click$
      .subscribe(val => {
        mspRequest(val,[])
      })
    return () => sub.unsubscribe()
  }, [clickSubject, mspResponse$])
  return (
    <React.Fragment>
      {/* <TextField label="cmd" onChange={e => mspCmdChange(e.target.value)} /> */}
      <NativeSelect onChange={e => onCmdChange(e.target.value)}>
        <option aria-label="None" value="">None</option>
        {Object.keys(MspCmd).map(key =>
          <option key={MspCmd[key]} value={MspCmd[key]}>{key}</option>
        )}
      </NativeSelect>
      <Button variant="contained" color="secondary" onClick={e => onClick()}>MSP Go</Button>
      {mspMsg}
    </React.Fragment>
  )
}
