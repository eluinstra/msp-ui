import React, { useEffect, useState } from 'react'
import { Button, FormControlLabel, NativeSelect, Switch } from '@material-ui/core'
import { MspCmd } from '@/component/msp/MspProtocol'
import { from, fromEvent, Observable, Subject } from 'rxjs'
import { filter, map, mergeMap, startWith } from 'rxjs/operators';
import { baudrates, closePort, defaultBaudrate, openPort, portInfo$ } from '@/component/serialport/SerialPortDriver'
import { useStatefulObservable, useSubject } from '@/common/RxTools'
import { PortInfo } from 'serialport'
import { registerPort } from '@/component/msp/MspDriver';

export const usedPort = v => v.manufacturer != undefined

export const SerialPortConnect = () => {
  const [state, setState] = useState({
    checked: false,
    port: "",
    baudrate: defaultBaudrate
  });
  const [ onPortClick, portSubject ] = useSubject()
  const portInfo = useStatefulObservable(portSubject
    .pipe(
      mergeMap(_ => portInfo$()),
      map(p => (p as PortInfo[])
        .filter(usedPort)
  )))
  const [ onConnectClick, connectSubject ] = useSubject()
  useEffect(() => {
    const click$ = connectSubject
      .pipe(
        filter(event => state.port != "")
      )
    const sub = click$
      .subscribe(val => {
        if (!state.checked) {
          openPort(state.port, state.baudrate)
          registerPort()
        } else {
          closePort()
        }
        setState({ ...state, checked: !state.checked })
      })
    return () => sub.unsubscribe()
  })
  return (
    <React.Fragment>
      <NativeSelect value={state.port} onClick={_ => onPortClick()} onChange={e => setState({ ...state, port: e.target.value })}>
        <option aria-label="Manual" value="">Manual</option>
        {portInfo?.map(v =>
          <option key={v.path} value={v.path}>{v.path}</option>
        )}
      </NativeSelect>
      <NativeSelect value={state.baudrate} onChange={e => setState({ ...state, baudrate: Number(e.target.value) })}>
        {baudrates.map(v =>
          <option key={v} value={v}>{v}</option>
        )}
      </NativeSelect>
      <FormControlLabel
        control={<Switch checked={state.checked} color="secondary" onClick={_ => onConnectClick()}/>}
        label="Connect"
      />
    </React.Fragment>
  )
}