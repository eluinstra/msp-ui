import { useObservableBehaviourOf, useStatefulObservable } from '@/common/RxTools'
import { createMspDriver, getMspResponse$, MspCmd, MspMsg, mspRequestNr, useMspDriver } from '@/component/msp/MspDriver'
import { viewMspMsg } from '@/component/msp/MspView'
import { FormControl, FormControlLabel, Switch } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { interval, merge, of } from 'rxjs'
import { flatMap, mergeMap } from 'rxjs/operators'
import { delayWhen, filter, map, mapTo, startWith, tap } from 'rxjs/operators'

const isTrue = (v: any) => v
const isMspCmd = (mspCmd: number) => (msg: MspMsg) => mspCmd == msg.cmd

export const MspConfiguration = ({ serialPort }) => {
  const [driver] = useState(createMspDriver(serialPort))
  const [state, changeState, state$] = useObservableBehaviourOf({
    checked: true,
    interval: 2000,
  })
  const [command$] = useState(of('MSP_API_VERSION', 'MSP_FC_VARIANT', 'MSP_FC_VERSION'))
  // const [cmd] = useState('MSP_API_VERSION')
  const mspResponse$ = getMspResponse$(driver)
  const apiVersion = useStatefulObservable<number>(mspResponse$
    .pipe(
      filter(isMspCmd(MspCmd.MSP_API_VERSION)),
      map(viewMspMsg)
  ))
  const mspFcVariant = useStatefulObservable<number>(mspResponse$
    .pipe(
      filter(isMspCmd(MspCmd.MSP_FC_VARIANT)),
      map(viewMspMsg)
  ))
  const mspFcVersion = useStatefulObservable<number>(mspResponse$
    .pipe(
      filter(isMspCmd(MspCmd.MSP_FC_VERSION)),
      map(viewMspMsg)
  ))
  useEffect(() => useMspDriver(driver), [])
  useEffect(() => {
    const sub = merge(state$)
      .pipe(
        startWith(state.checked),
        delayWhen(_ => interval(state.interval)),
        mergeMap(_ => command$),
        tap(console.log),
        map(cmd => MspCmd[cmd])
      )
      .subscribe(v => {
        console.log(v)
        mspRequestNr(driver, v, '')
      })
    return () => sub.unsubscribe()
  }, [state$])
  return (
    <React.Fragment>
      {apiVersion}
      {mspFcVariant}
      {mspFcVersion}
    </React.Fragment>
  )
}