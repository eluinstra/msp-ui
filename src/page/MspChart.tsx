import React from 'react'
import { MspChart } from '@/component/msp/MspChart'

export const MspChartPage = ({ serialPort }) => {
  return (
    <React.Fragment>
      <h2>MSP</h2>
      <MspChart serialPort={serialPort} />
    </React.Fragment>
  )
}
