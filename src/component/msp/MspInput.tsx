import { Notification } from 'electron'
import React, { useState, useEffect } from 'react'
import { BehaviorSubject, fromEvent, Subject } from 'rxjs'
import { distinctUntilChanged, map, filter, tap, startWith, mergeMap, mapTo } from 'rxjs/operators'
import { useStatefulObservable, useObservableBehaviour, useObservableEvent, useBehaviour } from '@/common/RxTools'
import { MspMsg, mspRequest, mspResponse$ } from '@/component/msp/MspDriver'
import { viewMspMsg } from '@/component/msp/MspView'
import { MspCmd } from '@/component/msp/MspProtocol'
import { Button, NativeSelect, TextField } from '@material-ui/core'
import { useSnackbar } from 'notistack';

const notEmpty = v => v != ""

export const MspInput = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [state, changeState] = useBehaviour({
    cmd: ""
  });
  const [mspClick, mspClick$] = useObservableEvent()
  const mspMsg = useStatefulObservable<MspMsg>(mspResponse$
    .pipe(
      map(mspMsg  => viewMspMsg(mspMsg))
  ))
  useEffect(() => {
    const sub = mspClick$
      .pipe(
        mapTo(state.cmd),
        filter(notEmpty)
      )
      .subscribe(val => {
        try {
          mspRequest(val,[])
        } catch(e) {
          console.log(e)
          enqueueSnackbar(e.message, { variant: 'error' })
        }
      })
    return () => sub.unsubscribe()
  }, [mspClick$]);
  return (
    <React.Fragment>
      {/* <TextField label="cmd" value={state.cmd} onChange={e => changeState({ cmd: e.target.value })} /> */}
      <NativeSelect value={state.cmd} onChange={e => changeState({ cmd: e.target.value })}>
        <option aria-label="None" value="">None</option>
        {Object.keys(MspCmd).map(key =>
          <option key={MspCmd[key]} value={MspCmd[key]}>{key}</option>
        )}
      </NativeSelect>
      <Button variant="contained" color="secondary" onClick={_ => mspClick()}>MSP Go</Button>
      {mspMsg}
    </React.Fragment>
  )
}
