import React, { useEffect, useState } from "react"
import { interval } from "rxjs"
import { filter, map, startWith, tap } from "rxjs/operators"
import { sample } from "rxjs/operators"
import { imuResponseRTChart$, registerPortRTChart, unregisterPortRTChart } from '@/component/witmotion/SerialDriverCOM1'
import { imuAccelero } from '@/component/witmotion/WitMotionProtocol'
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
let datax = [];
let datay = [];
let dataz = [];
var lengtepromise = 0;
const dataNumber = 40;

{/****************************************************************************
 * Private Function Prototypes
****************************************************************************/}

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
export const SerialChartCOM1 = props => {
  const { id, serialPort } = props
  const [state] = useState({
    series: [{
      type: 'line',
      data: datax.slice()
    },
    {
      type: 'line',
      data: datay.slice()
    },
    {
      type: 'line',
      data: dataz.slice()
    }],
    options: {
      chart: {
        id: 'realtime1',
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
        min: -1,
        max: 1
      },
      legend: {
        show: true
      },
    }
  })

  const [imu$] = useState(imuResponseRTChart$
    .pipe(
      sample(interval(100)),
      map(imuMsgAcc => {
        return {
          ax: imuAccelero(imuMsgAcc.AxH, imuMsgAcc.AxL),
          ay: imuAccelero(imuMsgAcc.AyH, imuMsgAcc.AyL),
          az: imuAccelero(imuMsgAcc.AzH, imuMsgAcc.AzL)
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
        if (i == 0)
        {
          datax.push({
            x: time - XAXISRANGE - TICKINTERVAL,
            y: v
          })
        }
        else if (i == 1)
        {
          datay.push({
            x: time - XAXISRANGE - TICKINTERVAL,
            y: v
          })
        }
        else if (i == 2)
        {
          dataz.push({
            x: time - XAXISRANGE - TICKINTERVAL,
            y: v
          })
        }

      })

      ApexCharts.exec('realtime1', 'updateSeries', [
        {
          data: datax
        },
        {
          data: datay
        }
        ,
        {
          data: dataz
        }
      ])
      
    })
    return () => sub.unsubscribe()
  }, [])
  return (
    <React.Fragment>
      <ReactApexChart key={"COM1"} options={state.options} series={state.series} type="line" height={350} />
    </React.Fragment>
  )
}