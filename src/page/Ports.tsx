import { PortList } from '@/component/serialport/SerialPortList'
import React from 'react'

export const PortsPage = () => {
  return (
    <React.Fragment>
      <h2>Ports</h2>
      <PortList />
    </React.Fragment>
  )
}
