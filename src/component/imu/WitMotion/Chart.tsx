import React, { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import 'chartjs-plugin-streaming'
import { interval } from "rxjs"
import { filter, map, startWith, tap } from "rxjs/operators"
import { sample } from "rxjs/operators"
import { imuResponse$, registerPort, unregisterPort } from '@/component/imu/WitMotion/Driver'
import { isOpen } from "@/component/serialport/SerialPortDriver"

const imuAngle = (h: number, l: number) => ((h.valueOf() << 8) | l.valueOf() & 0xFF) / 32768 * 180
const imuAcc = (h: number, l:number) => ((h << 8) | (l & 0xFF)) / 32768 * 16;

export const Chart = props => {
  const { serialPort } = props
  const [state] = useState({
    labels: [],
    datasets: [
      {
        type: "line",
        label: "X",
        backgroundColor: "green",
        borderWidth: "2",
        lineTension: 0.45,
        fill: false,
        data: []
      },
      {
        type: "line",
        label: "Y",
        backgroundColor: "blue",
        borderWidth: "2",
        lineTension: 0.45,
        fill: false,
        data: []
      },
      {
        type: "line",
        label: "Z",
        backgroundColor: "cyan",
        borderWidth: "2",
        lineTension: 0.45,
        fill: false,
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
        delay: 100,
      }
    },
    events: ['click'],
    scales: {
      xAxes: [{
        type: "realtime"
      }]
    }
  })
  const [imu$] = useState(imuResponse$
    .pipe(
      sample(interval(100)),
      map(imuMsgAcc => {
        console.log("--> "+ imuAcc(imuMsgAcc.AxH, imuMsgAcc.AxL));
        return {
          // roll: imuAngle(imuMsgAngle.RollH, imuMsgAngle.RollL),
          // pitch: imuAngle(imuMsgAngle.PitchH, imuMsgAngle.PitchL),
          // yaw: imuAngle(imuMsgAngle.YawH, imuMsgAngle.YawL)
          ax: imuAcc(imuMsgAcc.AxH, imuMsgAcc.AxL),
          ay: imuAcc(imuMsgAcc.AyH, imuMsgAcc.AyL)
          //az: imuAcc(imuMsgAcc.AzH, imuMsgAcc.AzL)
        }
      })
    )
  )
  useEffect(() => {
    const sub = serialPort
      .pipe(
        filter(p => isOpen(p)),
      )
      .subscribe(p => {
        registerPort(p)
      })
    return () => {
      sub.unsubscribe()
      unregisterPort(serialPort)
    }
  }, [])
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
