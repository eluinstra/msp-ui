import { MspConfiguration } from '@/component/msp/MspConfiguration'
import React from 'react'

export const ConfigurationPage = ({ serialPort }) => {
  return (
    <React.Fragment>
      <h2>Configuration</h2>
      <MspConfiguration serialPort={serialPort} />
    </React.Fragment>
  )
}
