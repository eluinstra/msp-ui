{/****************************************************************************
 * src/components/witmotion/RealTimeChart.tsx
 *
 *   Copyright (C) 2020-2021 Edwin Luinstra & Ben van der Veen. All rights reserved.
 *   Author:  Ben <disruptivesolutionsnl@gmail.com>
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in
 *    the documentation and/or other materials provided with the
 *    distribution.
 * 3. Neither the name Bot4 nor the names of its contributors may be
 *    used to endorse or promote products derived from this software
 *    without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 * COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS
 * OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 ****************************************************************************/}

{/****************************************************************************
 * Included Files
 ****************************************************************************/}
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

{/****************************************************************************
 * Private Types
****************************************************************************/}
let XAXISRANGE = 777600000
var TICKINTERVAL = 86400000

let data = [];
let lastDate = () => { 0 };

{/****************************************************************************
 * Private Function Prototypes
****************************************************************************/}

const imuAngle = (h: number, l: number) => ((h.valueOf() << 8) | l.valueOf()) / 32768 * 180

{/****************************************************************************
 * Public Functions
****************************************************************************/}

{/****************************************************************************
 * Name: getNewSeries
 *
 * Description:
 *   The function to make dummy data
 *
 * Input Parameters:
 *   baseval : the starting position
 *   ytange : till when
 *
 * Returned Value:
 *   None
 *
****************************************************************************/}
function getNewSeries(baseval, yrange) {
  var newDate = baseval + TICKINTERVAL;
  lastDate = newDate

  for (var i = 0; i < data.length - 10; i++) {
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

{/****************************************************************************
 * Name: generateDayWiseTimeSeries
 *
 * Description:
 *   The function to make dummy data
 *
 * Input Parameters:
 *   baseval : the starting position
 *   count : how many
 *   yrange : till when
 *
 * Returned Value:
 *   None
 *
****************************************************************************/}
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

{/****************************************************************************
 * Name: getDayWiseTimeSeries
 *
 * Description:
 *   The function to get the made dummy data
 *
 * Input Parameters:
 *   baseval : the starting position
 *   count : how many
 *   yrange : till when
 *
 * Returned Value:
 *   None
 *
****************************************************************************/}
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

{/****************************************************************************
 * Name: getDayWiseTimeSeries
 *
 * Description:
 *   A call to the function to get the made dummy data
 *
 * Input Parameters:
 *   baseval : the starting position
 *   count : how many
 *   yrange : till when
 *
 * Returned Value:
 *   None
 *
****************************************************************************/}
getDayWiseTimeSeries(new Date('11 Feb 2017 GMT').getTime(), 10, {
  min: 10,
  max: 90
})

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
export const RealTimeChart = props => {
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


    }, 2000);



  }, [data])
  return (
    <React.Fragment>
      <ReactApexChart options={state.options} series={state.series} type="line" height={350} />
    </React.Fragment>
  )
}
