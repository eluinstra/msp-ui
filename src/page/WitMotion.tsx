import React from 'react'
import { Chart } from '@/component/imu/WitMotion/Chart'

export const WitMotion = props => {
  const { serialPort } = props
  return (
    <React.Fragment>
      <h2>Wit Motion</h2>
      <Chart serialPort={serialPort} />
    </React.Fragment>
  )
}
