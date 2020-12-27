import React, { useEffect } from 'react'
import { BehaviorSubject, empty, from, interval, merge, NEVER, of, Subject } from 'rxjs'
import { map, filter, mergeMap, delay, tap, mapTo, startWith, switchMap } from 'rxjs/operators'
import { useStatefulObservable, useObservableBehaviourOf, useObservableEvent, useBehaviour } from '@/common/RxTools'
import { MspMsg, mspRequest, mspResponse$ } from '@/component/msp/MspDriver'
import { mspOutputFunctions } from '@/component/msp/MspView'
import { MspCmd } from '@/component/msp/MspProtocol'
import { Button, FormControlLabel, NativeSelect, Switch, TextField } from '@material-ui/core'

const notEmpty = v => v != ""

export const MspGraph = () => {
  const [state, changeState, state$] = useObservableBehaviourOf({
    checked: false,
    cmd: ""
  });
  const mspMsg = useStatefulObservable<MspMsg>(mspResponse$
    .pipe(
      map(mspMsg  => mspOutputFunctions[mspMsg.cmd](mspMsg))
  ))
  // useEffect(() => {
  //   const sub = state$
  //     .pipe(
  //       delay(1000),
  //       tap(e => console.log("START")),
  //       mapTo(state.cmd),
  //       filter(notEmpty)
  //     )
  //     .subscribe(val => {
  //       mspRequest(val,[])
  //     })
  //   return () => sub.unsubscribe()
  // }, [state$])
  const interval$ = interval(1000).pipe(mapTo(-1));
  useEffect(() => {
    const sub = state$
    .pipe(
      startWith(state.checked),
      switchMap(v => (v ? interval$ : NEVER)),
    )
    .subscribe(v => {
      v => console.log(v)
    })
    return () => sub.unsubscribe()
  }, [state$])
  return (
    <React.Fragment>
      {/* <TextField label="cmd" value={state.cmd} onChange={e => changeState({ cmd: e.target.value })} /> */}
      <NativeSelect value={state.cmd} onChange={e => changeState({ cmd: e.target.value })}>
        <option aria-label="None" value="">None</option>
        {Object.keys(MspCmd).map(key =>
          <option key={MspCmd[key]} value={MspCmd[key]}>{key}</option>
        )}
      </NativeSelect>
      <FormControlLabel
        control={<Switch checked={state.checked} color="secondary" onChange={e => changeState({ checked: !state.checked })}/>}
        label="Connect"
      />
      {mspMsg}
    </React.Fragment>
  )
}
