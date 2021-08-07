import React from 'react'
import { MspInput } from '@/component/msp/MspInput'

export const MspInputPage = ({ serialPort }) => {
  return (
    <React.Fragment>
      <h2>MSP</h2>
      <MspInput serialPort={serialPort} />
    </React.Fragment>
  )
}
