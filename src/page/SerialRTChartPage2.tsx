import React from 'react'
import { SerialChart } from '@/component/witmotion/SerialChart'

export const SerialRTChartPage2 = props => {
  const { id, serialPort } = props
  return (
    <React.Fragment>
      <h2>SerialRTChart2</h2>
      <SerialChart id={id} serialPort={serialPort} height={100}/>
    </React.Fragment>
  )
}
