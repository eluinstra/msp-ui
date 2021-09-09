import { useBehaviour, useObservableEvent, useStatefulObservable } from '@/common/RxTools';
import { availableBaudrates, closePort, defaultBaudrate, isOpen, openPort, PortInfo, portInfo$, SerialPort } from '@/component/serialport/SerialPortDriver';
import { FormControl, FormControlLabel, FormGroup, NativeSelect, Switch } from '@material-ui/core';
import React, { Fragment, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { filter, map, mergeMap } from 'rxjs/operators';

const portInUse = (v: PortInfo) => v.manufacturer != undefined
const notEmpty = (s: String) => s.length > 0

export const SerialPortConnect = ({ serialPort }) => {
  const { t } = useTranslation()
  const connected = useStatefulObservable<boolean>((serialPort as SerialPort).pipe(map(p => isOpen(p))),false)
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
          openPort(serialPort, state.port, state.baudrate)
        } else {
          closePort(serialPort)
        }
      })
    return () => sub.unsubscribe()
  }, [connectClick$])
  return (
    <Fragment>
      <FormGroup>
        <FormControl>
          <NativeSelect value={state.port} disabled={connected} onClick={_ => portClick()} onChange={e => changeState({ port: e.target.value })}>
            <option value="">{t('lbl.manual')}</option>
            {portInfo?.map(v =>
              <option key={v.path} value={v.path}>{v.path}</option>
            )}
          </NativeSelect>
        </FormControl>
        <FormControl>
          <NativeSelect value={state.baudrate} disabled={connected} onChange={e => changeState({ baudrate: Number(e.target.value) })}>
            {availableBaudrates.map(v =>
              <option key={v} value={v}>{v}</option>
            )}
          </NativeSelect>
        </FormControl>
        <FormControl>
          <FormControlLabel
            control={<Switch checked={connected} onClick={_ => connectClick()}/>}
            label={t('btn.connect')}
          />
        </FormControl>
      </FormGroup>
    </Fragment>
  )
}