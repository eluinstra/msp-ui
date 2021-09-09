import { useObservableEvent, useStatefulObservable } from '@/common/RxTools'
import { createMspDriver, getMspResponse$, MspCmd, MspDriver, MspMsg, mspRequestNr, useMspDriver } from '@/component/msp/MspDriver'
import { viewMspMsg } from '@/component/msp/MspView'
import { Button, FormControl } from '@material-ui/core'
import React, { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Observable, of } from 'rxjs'
import { filter, map, mergeMap } from 'rxjs/operators'

const isMspCmd = (mspCmd: number) => (msg: MspMsg) => mspCmd == msg.cmd

export const MspConfiguration = ({ serialPort }) => {
  const { t } = useTranslation()
  const [driver] = useState(() => createMspDriver(serialPort))
  const [mspClick, mspClick$] = useObservableEvent()
  const [command$] = useState(of('MSP_API_VERSION', 'MSP_FC_VARIANT', 'MSP_FC_VERSION', 'MSP_BOARD_INFO', 'MSP_BUILD_INFO', 'MSP_NAME', 'MSP_IDENT'))
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
  const mspBoardInfo = useStatefulObservable<number>(mspResponse$
    .pipe(
      filter(isMspCmd(MspCmd.MSP_BOARD_INFO)),
      map(viewMspMsg)
  ))
  const mspBuildInfo = useStatefulObservable<number>(mspResponse$
    .pipe(
      filter(isMspCmd(MspCmd.MSP_BUILD_INFO)),
      map(viewMspMsg)
  ))
  const mspName = useStatefulObservable<number>(mspResponse$
    .pipe(
      filter(isMspCmd(MspCmd.MSP_NAME)),
      map(viewMspMsg)
  ))
  const mspIdent = useStatefulObservable<number>(mspResponse$
    .pipe(
      filter(isMspCmd(MspCmd.MSP_IDENT)),
      map(viewMspMsg)
  ))
  useEffect(() => useMspDriver(driver), [])
  useEffect(() => handleMspRequests(mspClick$, command$, driver), [mspClick$])
  useEffect(() => handleMspRequests(of(1), command$, driver), [])
  return (
    <Fragment>
      {apiVersion}
      {mspFcVariant}
      {mspFcVersion}
      {mspBoardInfo}
      {mspBuildInfo}
      {mspName}
      {mspIdent}
      <FormControl>
        <Button variant="contained" onClick={_ => mspClick()}>{t('btn.refresh')}</Button>
      </FormControl>
    </Fragment>
  )
}

function handleMspRequests(observable: Observable<any>, command$: Observable<string>, driver: MspDriver) {
  const sub = observable
    .pipe(
      mergeMap(_ => command$),
      map((cmd: string) => MspCmd[cmd])
    )
    .subscribe(v => {
      mspRequestNr(driver, v, '')
    })
  return () => sub.unsubscribe()
}
