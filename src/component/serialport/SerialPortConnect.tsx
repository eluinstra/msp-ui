import React, { useEffect, useState } from 'react'
import { Button, FormControlLabel, NativeSelect, Switch } from '@material-ui/core'
import { MspCmd } from '@/component/msp/MspProtocol'
import { from, fromEvent, Observable, Subject } from 'rxjs'
import { filter, map, mergeMap, startWith } from 'rxjs/operators';
import { baudrates, closePort, defaultBaudrate, openPort, portInfo$ } from '@/component/serialport/SerialPortDriver'
import { useStatefulObservable, useObservableEvent, useBehaviour } from '@/common/RxTools'
import { PortInfo } from 'serialport'
import { registerPort } from '@/component/msp/MspDriver'

const portInUse = (v: PortInfo) => v.manufacturer != undefined
const notEmpty = (s: String) => s.length > 0

export const SerialPortConnect = () => {
  const [state, changeState] = useBehaviour({
    checked: false,
    port: "",
    baudrate: defaultBaudrate
  })
  const [portClick, portClick$] = useObservableEvent()
  const portInfo = useStatefulObservable(portClick$
    .pipe(
      mergeMap(_ => portInfo$()),
      map(p => p.filter(portInUse))
  ))
  const [connectClick, connectClick$] = useObservableEvent()
  useEffect(() => {
    const sub = connectClick$
      .pipe(
        filter(_ => notEmpty(state.port))
      )
      .subscribe(val => {
        if (!state.checked) {
          openPort(state.port, state.baudrate)
          registerPort()
        } else {
          closePort()
        }
        changeState({ checked: !state.checked })
      })
    return () => sub.unsubscribe()
  }, [connectClick$])
  return (
    <React.Fragment>
      <NativeSelect value={state.port} disabled={state.checked} onClick={_ => portClick()} onChange={e => changeState({ port: e.target.value })}>
        <option value="">Manual</option>
        {portInfo?.map(v =>
          <option key={v.path} value={v.path}>{v.path}</option>
        )}
      </NativeSelect>
      <NativeSelect value={state.baudrate} disabled={state.checked} onChange={e => changeState({ baudrate: Number(e.target.value) })}>
        {baudrates.map(v =>
          <option key={v} value={v}>{v}</option>
        )}
      </NativeSelect>
      <FormControlLabel
        control={<Switch checked={state.checked} onClick={_ => connectClick()}/>}
        label="Connect"
      />
    </React.Fragment>
  )
}