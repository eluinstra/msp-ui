import { useObservableBehaviourOf, useStatefulObservable } from '@/common/RxTools'
import { createMspDriver, getMspResponse$, MspCmd, mspRequestNr, useMspDriver } from '@/component/msp/MspDriver'
import { FormControl, FormControlLabel, Switch } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import Thermometer from "react-thermometer"
import { interval, merge } from 'rxjs'
import { delayWhen, filter, map, mapTo, startWith } from 'rxjs/operators'

const isTrue = (v: any) => v

export const MspTemperature = ({ serialPort }) => {
  const [driver] = useState(createMspDriver(serialPort))
  const [state, changeState, state$] = useObservableBehaviourOf({
    checked: false,
    interval: 200,
  })
  const [cmd] = useState('MSP_READ_TEMP')
  const mspResponse$ = getMspResponse$(driver)
  const mspMsg = useStatefulObservable<number>(mspResponse$
    .pipe(
      map(msg => msg.buffer[0]),
      //mapTo(Math.random() * 10)
    ))
  useEffect(() => useMspDriver(driver), [])
  useEffect(() => {
    const sub = merge(state$, mspResponse$)
      .pipe(
        startWith(state.checked),
        filter(isTrue),
        delayWhen(_ => interval(state.interval)),
        mapTo(MspCmd[cmd])
      )
      .subscribe(v => {
        mspRequestNr(driver, v, '1')
      })
    return () => sub.unsubscribe()
  }, [state$, mspResponse$])
  return (
    <React.Fragment>
      <FormControl>
        <FormControlLabel
          control={<Switch checked={state.checked} onChange={_ => changeState({ checked: !state.checked })} />}
          label={!state.checked ? 'On' : 'Off'}
        />
      </FormControl>
      <Thermometer
        min={0}
        max={30}
        width={20}
        height={300}
        backgroundColor='#BDC0BA'
        fillColor='#D0104C'
        current={mspMsg}
      />
    </React.Fragment>
  )
}