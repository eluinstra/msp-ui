import React, { useState, useEffect } from 'react'
import { map, filter, mapTo, tap } from 'rxjs/operators'
import { useStatefulObservable, useObservableEvent, useBehaviour } from '@/common/RxTools'
import { clearMspResponse$, createMspDriver, getMspError$, getMspResponse$, MspCmd, MspMsg, mspRequestNr, useMspDriver } from '@/component/msp/MspDriver'
import { viewMspMsg } from '@/component/msp/MspView'
import { Button, FormControl, TextField } from '@material-ui/core'
import { useSnackbar } from 'notistack'
import { Autocomplete } from '@material-ui/lab'

const notEmpty = (v: any) => !!v

export const MspInput = ({ serialPort }) => {
  const [driver] = useState(createMspDriver(serialPort))
  const { enqueueSnackbar } = useSnackbar()
  const [cmd, setCmd] = useState(null)
  const [payload, setPayload] = useState('')
  const [mspClick, mspClick$] = useObservableEvent()
  const mspMsg = useStatefulObservable<MspMsg>(getMspResponse$(driver)
    .pipe(
      tap(console.log),
      map(viewMspMsg)
  ))
  const mspError$ = getMspError$(driver)
  useEffect(() => useMspDriver(driver), [])
  useEffect(() => {
    const sub = mspClick$
      .pipe(
        mapTo(MspCmd[cmd]),
        filter(notEmpty)
      )
      .subscribe(val => {
        try {
          mspRequestNr(driver,val,payload)
        } catch(e) {
          console.log(e)
          enqueueSnackbar(e.message, { variant: 'error' })
        }
      })
    return () => sub.unsubscribe()
  }, [mspClick$])
  useEffect(() => {
    const sub = mspError$
      .subscribe(e => {
          console.log(e.message)
          enqueueSnackbar(e.message, { variant: 'error' })
        }
      )
    return () => sub.unsubscribe()
  }, [mspError$])
  return (
    <React.Fragment>
      <FormControl>
        <Autocomplete
          value={cmd}
          onChange={(_, v: string) => { setPayload(''); setCmd(v) }}
          options={Object.keys(MspCmd)}
          getOptionLabel={option => option}
          renderInput={params => <TextField label="cmd" {...params} variant="standard" />}
          style={{ width: 350 }}
        />
      </FormControl>
      <FormControl>
        <TextField label="value" value={payload} onChange={e => setPayload(e.target.value)} variant="standard" />
      </FormControl>
      <FormControl>
        <Button variant="contained" onClick={_ => { mspClick(); clearMspResponse$(driver) }}>MSP Go</Button>
      </FormControl>
      {mspMsg}
    </React.Fragment>
  )
}
