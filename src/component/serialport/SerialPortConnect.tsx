import React, { useEffect } from 'react'
import { FormControl, FormControlLabel, FormGroup, NativeSelect, Switch } from '@material-ui/core'
import { filter, map, mergeMap } from 'rxjs/operators';
import { baudrates, closePort, defaultBaudrate, openPort, portInfo$ } from '@/component/serialport/SerialPortDriver'
import { useStatefulObservable, useObservableEvent, useBehaviour } from '@/common/RxTools'
import { PortInfo } from 'serialport'
import { registerPort } from '@/component/msp/MspDriver'
import { registerPortIMU } from '@/component/imu/WitMotion/Driver';

const portInUse = (v: PortInfo) => v.manufacturer != undefined
const notEmpty = (s: String) => s.length > 0

export const SerialPortConnect = props => {
  const { connected, setConnected } = props
  const [state, changeState] = useBehaviour({
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
        if (!connected) {
          openPort(state.port, state.baudrate)
          //registerPort()
          registerPortIMU()
        } else {
          closePort()
        }
        setConnected(!connected)
      })
    return () => sub.unsubscribe()
  }, [connectClick$])
  return (
    <React.Fragment>
      <FormGroup>
        <FormControl>
          <NativeSelect value={state.port} disabled={connected} onClick={_ => portClick()} onChange={e => changeState({ port: e.target.value })}>
            <option value="">Manual</option>
            {portInfo?.map(v =>
              <option key={v.path} value={v.path}>{v.path}</option>
            )}
          </NativeSelect>
        </FormControl>
        <FormControl>
          <NativeSelect value={state.baudrate} disabled={connected} onChange={e => changeState({ baudrate: Number(e.target.value) })}>
            {baudrates.map(v =>
              <option key={v} value={v}>{v}</option>
            )}
          </NativeSelect>
        </FormControl>
        <FormControl>
          <FormControlLabel
            control={<Switch checked={connected} onClick={_ => connectClick()}/>}
            label="Connect"
          />
        </FormControl>
      </FormGroup>
    </React.Fragment>
  )
}