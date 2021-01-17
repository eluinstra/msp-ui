import React from 'react'
import { Line } from 'react-chartjs-2'
import 'chartjs-plugin-streaming'
import { interval } from 'rxjs'
import { map, sample } from 'rxjs/operators'
import { createMspResponse$ } from './msp/MspDriver'
import { parseMspMsg } from './msp/MspModel'

export const Chart = props => {
  const { datasets } = props
  const data = {
    datasets: datasets
  }
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    tooltips: {
      enabled: true
    },
    plugins: {
      streaming: {
          delay: 2000,
      }
    },
    events: ['click'],
    scales: {
      xAxes: [{
          type: "realtime"
      }]
    }
  }
  createMspResponse$()
  .pipe(
    sample(interval(500)),
    map(mspMsg  => parseMspMsg(mspMsg)),
    map(mspModel => {
      return {
        roll: mspModel.giro_x,
        pitch: mspModel.giro_y,
        yaw: mspModel.giro_z
      }
    })
  )
  .subscribe(value => {
    const values = Object.values(value)
    const time = Date.now()
    values.forEach((v, i) => {
      data.datasets[i].data.push({
          x: time, 
          y: v
      })
    })
  })
return (
    <Line data={data} options={options} height={150} />
  )
}