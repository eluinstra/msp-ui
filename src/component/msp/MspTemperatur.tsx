import { useObservableBehaviourOf, useStatefulObservable } from '@/common/RxTools'
import { createMspDriver, getMspResponse$, MspCmd, MspMsg, mspRequestNr, useMspDriver } from '@/component/msp/MspDriver'
import { FormControl, FormControlLabel, Switch } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import Thermometer from "react-thermometer"
import { interval, merge, of } from 'rxjs'
import { delayWhen, filter, map, mapTo, startWith, tap } from 'rxjs/operators'
import { parseInt16 } from './MspModel'

const isTrue = (v: any) => v
const isMspCmd = (mspCmd: number) => (msg: MspMsg) => mspCmd == msg.cmd

export const MspTemperature = ({ serialPort }) => {
  const [driver] = useState(createMspDriver(serialPort))
  const [state, changeState, state$] = useObservableBehaviourOf({
    checked: false,
    interval: 200,
  })
  const [cmd] = useState('MSP_READ_TEMP')
  const mspResponse$ = getMspResponse$(driver)
  const temperature = useStatefulObservable<number>(mspResponse$
    .pipe(
      filter(isMspCmd(MspCmd.MSP_READ_TEMP)),
      // map(msg => msg.buffer[0]),
      map(parseInt16)
      //mapTo(Math.random() * 10)
    ))
  const treshold = useStatefulObservable<number>(mspResponse$
      .pipe(
        filter(isMspCmd(MspCmd.MSP_GET_TEMP_HIGH)),
        // map(msg => msg.buffer[0]),
        map(parseInt16)
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
  useEffect(() => {
    const sub = of(1)
    .pipe(
      mapTo(MspCmd['MSP_GET_TEMP_HIGH'])
    )
    .subscribe(v => {
      mspRequestNr(driver, v, '')
    })
    return () => sub.unsubscribe()
  }, [])
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
        max={300}
        width={20}
        height={300}
        backgroundColor='#BDC0BA'
        fillColor={temperature > treshold ? '#D0104C' : '#D0104C'}
        current={temperature}
      />
    </React.Fragment>
  )
}