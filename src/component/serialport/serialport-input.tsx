import React from 'react'
import { Button, NativeSelect } from '@material-ui/core'
import { MspCmd } from '@/component/msp/msp-protocol'
import { from, Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators';
import { baudrates, defaultBaudrate, portInfo$ } from '@/component/serialport/serialport-driver'
import { useObservable } from '@/common/rx-tools'
import { PortInfo } from 'serialport'

export const SerialPortInput = () => {
  const portInfo = useObservable(portInfo$()
    .pipe(
      // startWith([]),
      map(p => (p as PortInfo[])
        .filter(o => o.manufacturer != undefined)
        .map(o =>
          <option key={o.path} value={o.path}>{o.path}</option>
        )
  )))
  return (
    <React.Fragment>
      <NativeSelect id="port">
        <option aria-label="Manual" value="">Manual</option>
        {/* {portInfo.map(o =>
          <option key={o.path} value={o.path}>{o.path}</option>
        )} */}
        {portInfo}
      </NativeSelect>
      <NativeSelect id="baudrate" value={defaultBaudrate}>
        {baudrates.map(val =>
          <option key={val} value={val}>{val}</option>
        )}
      </NativeSelect>
    </React.Fragment>
  )
}