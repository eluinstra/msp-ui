import React, { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import 'chartjs-plugin-streaming'
import { interval } from "rxjs"
import { filter, map, startWith, tap } from "rxjs/operators"
import { sample } from "rxjs/operators"
import { imuResponse$, registerPort, unregisterPort } from '@/component/imu/WitMotion/Driver'
import { isOpen } from "@/component/serialport/SerialPortDriver"
import ReactApexChart from 'react-apexcharts'
import ApexCharts from 'apexcharts'

const imuAngle = (h: number, l: number) => ((h.valueOf() << 8) | l.valueOf()) / 32768 * 180

let XAXISRANGE = 777600000
var TICKINTERVAL = 86400000

let data = [];
let lastDate = () => {0};

export const ExampleChart6 = props => {
  const { serialPort } = props
  //const [data, updateData] = useState([1, 2, 3, 4, 5, 6]);
  const [state] = useState({
    series: [{
      name: 'Series 1',
      data: [80, 50, 30, 40, 100, 20],
    }, {
      name: 'Series 2',
      data: [20, 30, 40, 80, 20, 80],
    }, {
      name: 'Series 3',
      data: [44, 76, 78, 13, 43, 10],
    }],
    options: {
      chart: {
        height: 350,
        type: 'radar',
        dropShadow: {
          enabled: true,
          blur: 1,
          left: 1,
          top: 1
        }
      },
      title: {
        text: 'Radar Chart - Multi Series'
      },
      stroke: {
        width: 2
      },
      fill: {
        opacity: 0.1
      },
      markers: {
        size: 0
      },
      xaxis: {
        categories: ['2011', '2012', '2013', '2014', '2015', '2016']
      }
    }
  })
  
  useEffect(() => {
    //setInterval(() => {

      // ApexCharts.exec('realtime', 'updateSeries', [{
      //   data: data
      // }])
      
      
    //}, 1000);
    
    

  }, [data])
  return (
    <ReactApexChart options={state.options} series={state.series} type="radar" height={350} />
  )
}
