import React, { useEffect } from 'react'
import { BehaviorSubject, merge, Subject } from 'rxjs'
import { map, filter, mergeMap, delay, tap } from 'rxjs/operators'
import { useObservable } from '@/common/RxTools'
import { MspMsg, mspRequest, mspResponse$ } from '@/component/msp/MspDriver'
import { mspOutputFunctions } from '@/component/msp/MspView'
import { MspCmd } from '@/component/msp/MspProtocol'
import { Button, NativeSelect, TextField } from '@material-ui/core'

export const MspGraph = () => {
  const mspActionSubject = new Subject()
  const mspActionClick = () => mspActionSubject.next()
  const mspCmdSubject = new Subject()
  const mspCmdChange = v => mspCmdSubject.next(v)
  const mspCmd = useObservable(mspCmdSubject)
  const mspMsg = useObservable(mspResponse$
    .pipe(
      map(mspMsg  => mspOutputFunctions[(mspMsg as MspMsg).cmd](mspMsg))
  ))
  useEffect(() => {
    const click$ = merge(mspActionSubject,mspResponse$)
      .pipe(
        delay(1000),
        tap(e => console.log("START")),
        map(e => mspCmd),
        filter(v => v != "")
      )
    const sub = click$
      .subscribe(val => {
        mspRequest(val,[])
      })
    return () => sub.unsubscribe()
  }, [mspActionSubject]);
  return (
    <React.Fragment>
      {/* <TextField label="cmd" onChange={e => setMspInput(e.target.value)} /> */}
      <NativeSelect onChange={e => mspCmdChange(e.target.value)}>
        <option aria-label="None" value="">None</option>
        {Object.keys(MspCmd).map(key =>
          <option key={MspCmd[key]} value={MspCmd[key]}>{key}</option>
        )}
      </NativeSelect>
      <Button variant="contained" color="secondary" onClick={e => mspActionClick()}>MSP Go</Button>
      {mspMsg}
    </React.Fragment>
  )
}
