import React, { useEffect, useState } from "react"
import { interval } from "rxjs"
import { filter, map, startWith, tap } from "rxjs/operators"
import { sample } from "rxjs/operators"
import { isOpen } from "@/component/serialport/SerialPortDriver"
import ReactApexChart from 'react-apexcharts'
import ApexCharts from 'apexcharts'

const imuAngle = (h: number, l: number) => ((h.valueOf() << 8) | l.valueOf()) / 32768 * 180

let XAXISRANGE = 777600000
var TICKINTERVAL = 86400000

let data = [];
let lastDate = () => {0};

export const ExampleChart5 = props => {
  const { serialPort } = props
  //const [data, updateData] = useState([1, 2, 3, 4, 5, 6]);
  const [state] = useState({
    options: {
      chart: {
        height: 350,
        type: 'radialBar',
        toolbar: {
          show: true
        }
      }
    },
    series: [67],
    colors: ["#20E647"],
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 0,
          size: "70%",
          background: "#293450"
        },
        track: {
          dropShadow: {
            enabled: true,
            top: 2,
            left: 0,
            blur: 4,
            opacity: 0.15
          }
        },
        dataLabels: {
          name: {
            offsetY: -10,
            color: "#fff",
            fontSize: "13px"
          },
          value: {
            color: "#fff",
            fontSize: "30px",
            show: true
          }
        }
      }
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "vertical",
        gradientToColors: ["#87D4F9"],
        stops: [0, 100]
      }
    },
    stroke: {
      lineCap: "round"
    },
    labels: ["Progress"]
  })
  
  useEffect(() => {
    //setInterval(() => {

      // ApexCharts.exec('realtime', 'updateSeries', [{
      //   data: data
      // }])
      
      
    //}, 1000);
    
    

  }, [data])
  return (
    <ReactApexChart options={state.options} series={state.series} type="radialBar" height={350} />
  )
}
