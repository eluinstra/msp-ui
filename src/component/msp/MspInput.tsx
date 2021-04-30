import React, { useState, useEffect } from 'react'
import { map, filter, mapTo } from 'rxjs/operators'
import { useStatefulObservable, useObservableEvent, useBehaviour } from '@/common/RxTools'
import { createDriver, getMspResponse$, MspMsg, mspRequest, useDriverEffect } from '@/component/msp/MspDriver'
import { viewMspMsg } from '@/component/msp/MspView'
import { MspCmd } from '@/component/msp/MspProtocol'
import { Button, FormControl, TextField } from '@material-ui/core'
import { useSnackbar } from 'notistack'
import { Autocomplete } from '@material-ui/lab'

const notEmpty = v => !!v

export const MspInput = props => {
  const { serialPort } = props
  const [errorval, setErrorval] = useState(false)
  const [helpertxt, setHelpertxt] = useState('')
  const [driver] = useState(createDriver(serialPort))
  const { enqueueSnackbar } = useSnackbar()
  const [cmd, setCmd] = useState(null)
  const [payload, setPayload] = useState('')
  const [mspClick, mspClick$] = useObservableEvent()
  const mspMsg = useStatefulObservable<MspMsg>(getMspResponse$(driver)
    .pipe(
      map(viewMspMsg)
  ))
  useEffect(useDriverEffect(driver, enqueueSnackbar), [])
  useEffect(() => {
    const sub = mspClick$
      .pipe(
        mapTo(MspCmd[cmd]),
        filter(notEmpty)
      )
      .subscribe(val => {
        try {
            if (Number(payload) >= 0 && Number(payload) <= 65535)
            {
              mspRequest(driver,val,payload)
              setHelpertxt("Waarde verzonden: "+payload)
              setErrorval(false)
            }
            else
            {
              setHelpertxt("Foutieve waarde: 0-65535")
              setErrorval(true)
            }
        } catch(e) {
          console.log(e)
          enqueueSnackbar(e.message, { variant: 'error' })
        }
      })
    return () => sub.unsubscribe()
  }, [mspClick$])
  return (
    <React.Fragment>
      <FormControl>
        <Autocomplete
          value={cmd}
          onChange={(_, v: string) => {setPayload(''); setCmd(v)}}
          options={Object.keys(MspCmd)}
          getOptionLabel={option => option}
          renderInput={params => <TextField label="cmd" {...params} variant="standard" />}
          style={{ width: 350 }}
        />
      </FormControl>
      <FormControl>
          <TextField label="value" helperText={helpertxt} error={errorval} value={payload} onChange={e => setPayload(e.target.value)} variant="standard" />
      </FormControl>
      <FormControl>
        <Button variant="contained" onClick={_ => mspClick()}>MSP Go</Button>
      </FormControl>
      {mspMsg}
    </React.Fragment>
  )
}
