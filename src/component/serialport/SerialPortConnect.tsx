import React, { useEffect } from 'react'
import { Button, FormControlLabel, NativeSelect, Switch } from '@material-ui/core'
import { MspCmd } from '@/component/msp/MspProtocol'
import { from, fromEvent, Observable, Subject } from 'rxjs'
import { filter, map, mergeMap, startWith } from 'rxjs/operators';
import { baudrates, closePort, defaultBaudrate, openPort, portInfo$ } from '@/component/serialport/SerialPortDriver'
import { useObservable } from '@/common/RxTools'
import { PortInfo } from 'serialport'
import { registerPort } from '@/component/msp/MspDriver';

export const SerialPortConnect = () => {
  const [state, setState] = React.useState({
    checked: false
  });
  const mspButtonSubject = new Subject()
  const mspButtonClick = () => mspButtonSubject.next()
  const portInfo = useObservable(mspButtonSubject
    .pipe(
      mergeMap(e => portInfo$()),
      map(p => (p as PortInfo[])
        .filter(o => o.manufacturer != undefined)
  )))
  useEffect(() => {
    const connected = document.getElementById('connected')
    const port = document.getElementById('port')
    const baudrate = document.getElementById('baudrate')
    const click$ = fromEvent(connected, 'click')
      .pipe(
        filter(event => port != undefined)
      )
    const sub = click$
      .subscribe(val => {
        if (!state.checked) {
          openPort((port as HTMLInputElement).value, Number((baudrate as HTMLInputElement).value))
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
      <NativeSelect id="port" onClick={e => mspButtonClick()}>
        <option aria-label="Manual" value="">Manual</option>
        {portInfo?.map(o =>
          <option key={o.path} value={o.path}>{o.path}</option>
        )}
      </NativeSelect>
      <NativeSelect id="baudrate" value={defaultBaudrate}>
        {baudrates.map(val =>
          <option key={val} value={val}>{val}</option>
        )}
      </NativeSelect>
      <FormControlLabel
        control={<Switch id="connected" checked={state.checked} color="secondary" />}
        label="Connect"
      />
    </React.Fragment>
  )
}