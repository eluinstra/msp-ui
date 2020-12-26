import React, { useEffect } from 'react'
import { BehaviorSubject, merge, Subject } from 'rxjs'
import { map, filter, mergeMap, delay, tap } from 'rxjs/operators'
import { useStatefulObservable, useObservableBehaviour, useObservableEvent, useBehaviour } from '@/common/RxTools'
import { MspMsg, mspRequest, mspResponse$ } from '@/component/msp/MspDriver'
import { mspOutputFunctions } from '@/component/msp/MspView'
import { MspCmd } from '@/component/msp/MspProtocol'
import { Button, NativeSelect, TextField } from '@material-ui/core'

const notEmpty = v => v != ""

export const MspGraph = () => {
  const [state, changeState] = useBehaviour({
    cmd: ""
  });
  const [mspClick, mspClick$] = useObservableEvent()
  const mspMsg = useStatefulObservable<MspMsg>(mspResponse$
    .pipe(
      map(mspMsg  => mspOutputFunctions[mspMsg.cmd](mspMsg))
  ))
  useEffect(() => {
    const sub = mspClick$
      .pipe(
        delay(1000),
        tap(e => console.log("START")),
        map(e => state.cmd),
        filter(notEmpty)
      )
      .subscribe(val => {
        mspRequest(val,[])
      })
    return () => sub.unsubscribe()
  }, [mspClick$])
  return (
    <React.Fragment>
      {/* <TextField label="cmd" value={state.cmd} onChange={e => changeState({ cmd: e.target.value })} /> */}
      <NativeSelect value={state.cmd} onChange={e => changeState({ cmd: e.target.value })}>
        <option aria-label="None" value="">None</option>
        {Object.keys(MspCmd).map(key =>
          <option key={MspCmd[key]} value={MspCmd[key]}>{key}</option>
        )}
      </NativeSelect>
      <Button variant="contained" color="secondary" onClick={e => mspClick()}>MSP Go</Button>
      {mspMsg}
    </React.Fragment>
  )
}
