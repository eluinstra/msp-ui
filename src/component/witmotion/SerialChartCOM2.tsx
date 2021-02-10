import React, { useEffect, useState } from "react"
import { interval } from "rxjs"
import { filter, map, startWith, tap } from "rxjs/operators"
import { sample } from "rxjs/operators"
import { imuResponseRTChart2$, registerPortRTChart2, unregisterPortRTChart2 } from '@/component/witmotion/SerialDriver2'
import { isOpen } from "@/component/serialport/SerialPortDriver"
import ApexCharts from 'apexcharts'
import ReactApexChart from 'react-apexcharts'


{/****************************************************************************
 * Private Types
****************************************************************************/}
let XAXISRANGE = 1000 //777600000
//var TICKINTERVAL = 86400000 /* 1000 * 60 * 60 * 24 * 365 = each calander year milliseconds * seconds * minutes * hours * days = 1 year */
var TICKINTERVAL = 100 /* 1000 * 60 * 60 * 24 * 365 = each calander year */

let lastDate = () => {0};
let datax2 = [];
let datay2 = [];
let dataz2 = [];
var lengtepromise = 0;
const dataNumber = 40;

{/****************************************************************************
 * Private Function Prototypes
****************************************************************************/}

const imuAngle = (h: number, l: number) => ((h.valueOf() << 8) | l.valueOf()) / 32768 * 180


{/****************************************************************************
 * Name: RealTimeChart
 *
 * Description:
 *   The Chart object
 *
 * Input Parameters:
 *   props : the properties given to the object
 *
 * Returned Value:
 *   None
 *
****************************************************************************/}
export const SerialChartCOM2 = props => {
  const { id, serialPort } = props
  const [state] = useState({
    series: [{
      type: 'line',
      data: datax2.slice()
    },
    {
      type: 'line',
      data: datay2.slice()
    },
    {
      type: 'line',
      data: dataz2.slice()
    }],
    options: {
      chart: {
        id: 'realtime2',
        height: 350,
        type: 'line',
        animations: {
          enabled: true,
          easing: 'linear',
          dynamicAnimation: {
            speed: 500
          }
        },
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth'
      },
      title: {
        text: 'Dynamic Updating Chart',
        align: 'left'
      },
      markers: {
        size: 0
      },
      xaxis: {
        type: 'category',
        //min: new Date('1 Jan 2021 ECT').getTime(),
        //CRUSIAL! THESE SETTINGS!
        range: XAXISRANGE
      },
      yaxis: {
        min: -20,
        max: 20
      },
      legend: {
        show: false
      },
    }
  })

  const [imu2$] = useState(imuResponseRTChart2$
    .pipe(
      sample(interval(100)),
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
        registerPortRTChart2(id, p)
      })
    return () => {
      sub.unsubscribe()
      unregisterPortRTChart2(id, serialPort)
    }
  }, [])
  useEffect(() => {
    const sub2 = imu2$.subscribe(value => {
      const values = Object.values(value);
      const time = Date.now()
      values.forEach((v, i) => {
        if (i == 0)
        {
          datax2.push({
            x: time - XAXISRANGE - TICKINTERVAL,
            y: v
          })
        }
        else if (i == 1)
        {
          datay2.push({
            x: time - XAXISRANGE - TICKINTERVAL,
            y: v
          })
        }
        else if (i == 2)
        {
          dataz2.push({
            x: time - XAXISRANGE - TICKINTERVAL,
            y: v
          })
        }

      })

      ApexCharts.exec('realtime2', 'updateSeries', [
        {
          data: datax2
        },
        {
          data: datay2
        }
        ,
        {
          data: dataz2
        }
      ])
      
    })
    return () => sub2.unsubscribe()
  }, [])
  return (
    <React.Fragment>
      <ReactApexChart key={"COM2"} options={state.options} series={state.series} type="line" height={350} />
    </React.Fragment>
  )
}