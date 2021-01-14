import React from 'react'
import { MspChart } from '@/component/msp/MspChart'

export const MspChartPage = props => {
  const { serialPort } = props
  return (
    <React.Fragment>
      <h2>MSP</h2>
      <MspChart serialPort={serialPort} />
    </React.Fragment>
  )
}
