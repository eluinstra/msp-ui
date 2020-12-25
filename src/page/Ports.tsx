import { PortList } from '@/component/serialport/SerialPortList'
import React from 'react'

export const Ports = () => {
  return (
    <React.Fragment>
      <h2>Ports</h2>
      <PortList />
    </React.Fragment>
  )
}
