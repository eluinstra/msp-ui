import React, { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import 'chartjs-plugin-streaming'
import { interval } from "rxjs"
import { filter, map, startWith, tap } from "rxjs/operators"
import { sample } from "rxjs/operators"
import { imuResponseRTChart$, registerPortRTChart, unregisterPortRTChart } from '@/component/witmotion/SerialDriver'
import { isOpen } from "@/component/serialport/SerialPortDriver"

const imuAngle = (h: number, l: number) => ((h.valueOf() << 8) | l.valueOf()) / 32768 * 180

export const SerialChartCOM2 = props => {
  const { id, serialPort } = props
  const [state] = useState({
    labels: [],
    datasets: [
      {
        type: "line",
        label: "Accelero X",
        backgroundColor: "green",
        borderWidth: "2",
        lineTension: 0.45,
        data: []
      },
      {
        type: "line",
        label: "Accelero Y",
        backgroundColor: "blue",
        borderWidth: "2",
        lineTension: 0.45,
        data: []
      },
      {
        type: "line",
        label: "Accelero Z",
        backgroundColor: "cyan",
        borderWidth: "2",
        lineTension: 0.45,
        data: []
      }
    ]
  })
  const [options] = useState({
    responsive: true,
    maintainAspectRatio: true,
    tooltips: {
      enabled: true
    },
    plugins: {
      streaming: {
        delay: 500,
      }
    },
    id: id,
    events: ['click'],
    scales: {
      xAxes: [{
        type: "realtime"
      }]
    }
  })
  const [imu$] = useState(imuResponseRTChart$
    .pipe(
      sample(interval(500)),
      map(imuMsgAcc => {
        return {
          ax: imuAngle(imuMsgAcc.AxH, imuMsgAcc.AxL),
          ay: imuAngle(imuMsgAcc.AyH, imuMsgAcc.AyL),
          az: imuAngle(imuMsgAcc.AzH, imuMsgAcc.AzL)
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
        console.log("registerPort: "+p.value?.path);
        registerPortRTChart(id, p)
      })
    return () => {
      sub.unsubscribe()
      unregisterPortRTChart(id, serialPort)
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
    <Line key={props.id} data={state} options={options} height={100} />
  )
}
