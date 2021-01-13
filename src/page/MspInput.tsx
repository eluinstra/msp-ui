import React from 'react'
import { MspInput } from '@/component/msp/MspInput'

export const MspInputPage = props => {
  const { serialPort } = props
  return (
    <React.Fragment>
      <h2>MSP</h2>
      <MspInput serialPort={serialPort} />
    </React.Fragment>
  )
}
