import React, { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import 'chartjs-plugin-streaming'
import { interval } from "rxjs"
import { filter, map, startWith, tap } from "rxjs/operators"
import { sample } from "rxjs/operators"
import { imuResponse$, registerPort, unregisterPort } from '@/component/imu/WitMotion/Driver'
import { isOpen, SerialPort } from "@/component/serialport/SerialPortDriver"

const imuAcc= (h: number, l: number) => ((h.valueOf() << 8) | l.valueOf() & 0xFF) / 32768 * 180

export const Chart = ({ serialPort }) => {
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
  const [imu$] = useState(imuResponse$
    .pipe(
      sample(interval(500)),
      map(imuMsgAcc => {
        return {
          ax: imuAcc(imuMsgAcc.AxH, imuMsgAcc.AxL),
          ay: imuAcc(imuMsgAcc.AyH, imuMsgAcc.AyL)
        }
      })
    )
  )
  useEffect(() => {
    const sub = (serialPort as SerialPort)
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
  }, [])
  return (
    <Line data={state} options={options} height={150} />
  )
}
