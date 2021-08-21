import React from 'react'
import { MspTemperature } from '@/component/msp/MspTemperatur'

export const MspTemperaturePage = ({ serialPort }) => {
  return (
    <React.Fragment>
      <h2>Temperature</h2>
      <MspTemperature serialPort={serialPort} />
    </React.Fragment>
  )
}
