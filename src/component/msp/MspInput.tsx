import { Notification } from 'electron'
import React, { useState, useEffect } from 'react'
import { BehaviorSubject, fromEvent, Subject } from 'rxjs'
import { distinctUntilChanged, map, filter, tap, startWith, mergeMap, mapTo } from 'rxjs/operators'
import { useStatefulObservable, useObservableBehaviour, useObservableEvent, useBehaviour } from '@/common/RxTools'
import { createDriver, MspMsg, mspRequest, useDriverEffect } from '@/component/msp/MspDriver'
import { viewMspMsg } from '@/component/msp/MspView'
import { MspCmd } from '@/component/msp/MspProtocol'
import { Button, createStyles, FormControl, makeStyles, NativeSelect, TextField, Theme } from '@material-ui/core'
import { useSnackbar } from 'notistack';
import { Autocomplete } from '@material-ui/lab'

const notEmpty = v => v != ""

export const MspInput = props => {
  const { serialPort } = props
  const [driver] = useState(createDriver(serialPort))
  const { enqueueSnackbar } = useSnackbar();
  const [cmd, setCmd] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [mspClick, mspClick$] = useObservableEvent()
  const mspMsg = useStatefulObservable<MspMsg>(driver.mspResponse$
    .pipe(
      map(mspMsg  => viewMspMsg(mspMsg))
  ))
  useEffect(useDriverEffect(driver), [])
  useEffect(() => {
    const sub = mspClick$
      .pipe(
        mapTo(MspCmd[cmd]),
        filter(notEmpty)
      )
      .subscribe(val => {
        try {
          mspRequest(driver,val,'')
        } catch(e) {
          console.log(e)
          enqueueSnackbar(e.message, { variant: 'error' })
        }
      })
    return () => sub.unsubscribe()
  }, [mspClick$]);
  return (
    <React.Fragment>
      <FormControl>
        <Autocomplete
          value={cmd}
          onChange={(_, v: string) => { setCmd(v) }}
          inputValue={inputValue}
          onInputChange={(_, v) => setInputValue(v)}
          options={Object.keys(MspCmd)}
          getOptionLabel={option => option}
          renderInput={params => <TextField {...params} variant="standard" />}
          style={{ width: 350 }}
        />
      </FormControl>
      <FormControl>
        <Button variant="contained" onClick={_ => mspClick()}>MSP Go</Button>
      </FormControl>
      {mspMsg}
    </React.Fragment>
  )
}
