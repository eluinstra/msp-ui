import React from 'react'
import { MspPressure } from '@/component/msp/MspPressure'

export const MspPressurePage = ({ serialPort }) => {
  return (
    <React.Fragment>
      <h2>Pressure</h2>
      <MspPressure serialPort={serialPort} />
    </React.Fragment>
  )
}
