import React from 'react'
import { Line } from 'react-chartjs-2'
import { interval } from 'rxjs'
import { map, sample } from 'rxjs/operators'
import { mspResponse$ } from './msp/MspDriver'
import { viewMspGraph } from './msp/MspGraphView'
import { parseMspMsg } from './msp/MspModel'

export const Graph = props => {
  const data = {
    datasets: props.datasets
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
  mspResponse$
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
  .subscribe(v => {
    const value = Object.values(v);
    value.forEach((v, i) => {
      data.datasets[i].data.push({
          x: Date.now(), 
          y: v
      })
    })
  });
return (
    <Line data={data} options={options} />
  )
}