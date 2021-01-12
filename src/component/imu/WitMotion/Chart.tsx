import React, { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import 'chartjs-plugin-streaming'
import { interval } from "rxjs"
import { map } from "rxjs/operators"
import { sample } from "rxjs/operators"
import { imuResponseAngle1$ } from '@/component/imu/WitMotion/Driver'

const imuAcc = (v: number) => ((v.valueOf() << 8)| v.valueOf())/32768*16*9.8;
const imuAnlge = (v: number) => ((v.valueOf() << 8) | v.valueOf()) / 32768 * 180

export const Chart = props => {
  const [state] = useState({
    labels: [],
    datasets: [
      {
        type: "line",
        label: "Roll",
        backgroundColor: "green",
        borderWidth: "2",
        lineTension: 0.45,
        data: []
      },
      {
        type: "line",
        label: "Pitch",
        backgroundColor: "blue",
        borderWidth: "2",
        lineTension: 0.45,
        data: []
      },
      {
        type: "line",
        label: "Yaw",
        backgroundColor: "cyan",
        borderWidth: "2",
        lineTension: 0.45,
        data: []
      }
    ]
  })
  const [options] = useState({
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
  })
  const [imu$] = useState(imuResponseAngle1$
    .pipe(
      sample(interval(500)),
      map(imuMsgAngle => {
        return {
          roll: imuAnlge(imuMsgAngle.RollH),
          pitch: imuAnlge(imuMsgAngle.PitchH),
          yaw: imuAnlge(imuMsgAngle.YawH)
        }
      })
    )
  )
  useEffect(() => {
    const sub = imu$.subscribe(value => {
      const values = Object.values(value);
      const time = Date.now()
      values.forEach((v, i) => {
        state.datasets[i].data.push({
          x: time,
          y: v
        })
      })
    })
    return () => sub.unsubscribe()
  }, [imu$])
  return (
    <Line data={state} options={options} height={150} />
  )
}
