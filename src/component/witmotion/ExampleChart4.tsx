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

function getNewSeries(baseval, yrange) {
    var newDate = baseval + TICKINTERVAL;
    lastDate = newDate
  
    for(var i = 0; i< data.length - 10; i++) {
      // IMPORTANT
      // we reset the x and y of the data which is out of drawing area
      // to prevent memory leaks
      data[i].x = newDate - XAXISRANGE - TICKINTERVAL
      data[i].y = 0
    }
  
    data.push({
      x: newDate,
      y: Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min
    })
  }

  function generateDayWiseTimeSeries(baseval, count, yrange) {
      var i = 0;
      var series = [];
      while (i < count) {
        var y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;
    
        series.push([baseval, y]);
        baseval += 86400000;
        i++;
      }
      return series;
    }

    function getDayWiseTimeSeries(baseval, count, yrange) {
  var i = 0;
  while (i < count) {
    var x = baseval;
    var y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

    data.push({
      x, y
    });
    lastDate = baseval
    baseval += TICKINTERVAL;
    i++;
  }
}

getDayWiseTimeSeries(new Date('11 Feb 2017 GMT').getTime(), 10, {
  min: 10,
  max: 90
})

export const ExampleChart4 = props => {
  const { serialPort } = props
  //const [data, updateData] = useState([1, 2, 3, 4, 5, 6]);
  const [state] = useState({
    series: [{
      data: data.slice()
    }],
    options: {
      chart: {
        id: 'realtime',
        height: 350,
        type: 'line',
        animations: {
          enabled: true,
          easing: 'linear',
          dynamicAnimation: {
            speed: 1000
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
        type: 'datetime',
        min: new Date('01 Mar 2012').getTime(),
        range: XAXISRANGE,
        tickAmount: 6,
      },
      yaxis: {
        max: 100
      },
      legend: {
        show: false
      },
    }
  })
  
  useEffect(() => {
    setInterval(() => {

      getNewSeries(lastDate, {
                min: 10,
                max: 90
              })

      
              
      ApexCharts.exec('realtime', 'updateSeries', [{
        data: data
      }])
      
      
    }, 1000);
    
    

  }, [data])
  return (
    <ReactApexChart options={state.options} series={state.series} type="line" height={350} />
  )
}
