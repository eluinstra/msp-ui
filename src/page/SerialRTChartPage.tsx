import React from 'react'
import { SerialChartCOM1 } from '@/component/witmotion/SerialChartCOM1'
import { SerialChartCOM2 } from '@/component/witmotion/SerialChartCOM2'

export const SerialRTChartPage = props => {
  const { id, serialPort1, serialPort2 } = props
  return (
    <React.Fragment>
      <h2>SerialRTChart</h2>
      <SerialChartCOM1 serialPort={serialPort1} height={100}/>
      <SerialChartCOM2 serialPort={serialPort2} height={100}/>
    </React.Fragment>
  )
}
