import React from 'react'
import { SerialChart } from '@/component/witmotion/SerialChart'

export const SerialRTChartPage = props => {
  const { serialPort } = props
  return (
    <React.Fragment>
      <h2>SerialRTChart</h2>
      <SerialChart serialPort={serialPort} height={100}/>
    </React.Fragment>
  )
}
