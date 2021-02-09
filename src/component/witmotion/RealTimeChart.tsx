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
import { llenAsync, lpushAsync, lrangeAsync, delAsync, flushallAsync } from '@/services/dbcapturing'
import { letProto } from "rxjs-compat/operator/let"
import { truncateSync } from "fs"

{/****************************************************************************
 * Private Types
****************************************************************************/}
let XAXISRANGE = 1000 //777600000
//var TICKINTERVAL = 86400000 /* 1000 * 60 * 60 * 24 * 365 = each calander year milliseconds * seconds * minutes * hours * days = 1 year */
var TICKINTERVAL = 100 /* 1000 * 60 * 60 * 24 * 365 = each calander year */

let lastDate = () => {0};
let data = [];
var lengtepromise = 0;
const dataNumber = 40;

{/****************************************************************************
 * Private Function Prototypes
****************************************************************************/}

const imuAngle = (h: number, l: number) => ((h.valueOf() << 8) | l.valueOf()) / 32768 * 180

{/****************************************************************************
 * Public Functions
****************************************************************************/}

{/****************************************************************************
 * Name: getDataFromRedis
 *
 * Description:
 *   The function to obtain data for the chart
 *
 * Input Parameters:
 *   baseval : the starting position
 *   ytange : till when
 *
 * Returned Value:
 *   None
 *
****************************************************************************/}
function getDataFromRedis(baseval, yrange) {
  //var dateBased = new Date('11 Feb 2017 GMT').getTime();
  //var dateNow = new Date('1 Jan 2021 ECT').getTime();
  var newDate = baseval + TICKINTERVAL;
  lastDate = newDate

  var test = false;

//D:\msp-ui\dist\component\witmotion\RealTimeChart.js:108 1611829139017
//D:\msp-ui\dist\component\witmotion\RealTimeChart.js:109 1609459204400
//D:\msp-ui\dist\component\witmotion\RealTimeChart.js:109 1609459204500

if (test)
{
for (var i = 0; i < data.length -dataNumber; i++) {
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

  // llenAsync('COM18_Accelero_X').then(function (lengte: number) {
  //   lengtepromise = lengte;
  // });

  /* realtime redis collecting and reading is not fast enough */

  lrangeAsync('COM6_Accelero_X', 0, dataNumber).then(function (result: string[]) {

  //   //console.log(1611751086158 - XAXISRANGE - TICKINTERVAL);

    if (result) {

      for (var i = 0; i < result.length; i++) {
        // IMPORTANT
        // we reset the x and y of the data which is out of drawing area
        // to prevent memory leaks
        data[i].x = newDate - XAXISRANGE - TICKINTERVAL
        data[i].y = 0
      }

      for (let j = 0; j < result.length; j++) {
        var vali: string = result[j].toString(); /* syntax ts:<value> ^ x:<value> ^ y:<value> */


        var valStr = vali.split("\^");
        var xyes = valStr[1].includes("x:");
        var yyes = valStr[2].includes("y:");

        if (xyes && yyes) {
          data.push({
            x: newDate, //parseFloat(valStr[1].split("x:")[1].valueOf()),
            y: parseFloat(valStr[2].split("y:")[1].valueOf())
          });

        }
      }
    }
  });

    // let dataLength = llenAsync('COM18_Accelero_X');

  // for (var i = 0; i < dataLength - 10; i++) {
  //   // IMPORTANT
  //   // we reset the x and y of the data which is out of drawing area
  //   // to prevent memory leaks
  //   data[i].x = newDate - XAXISRANGE - TICKINTERVAL
  //   data[i].y = 0
  // }

  // data.push({
  //   x: newDate,
  //   y: Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min
  // })
}

function resetData() {
  // Alternatively, you can also reset the data at certain intervals to prevent creating a huge series 
  data = data.slice(data.length - dataNumber, data.length);
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
// function generateDayWiseTimeSeries(baseval, count, yrange) {
//   var i = 0;
//   var series = [];
//   while (i < count) {
//     var y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

//     series.push([baseval, y]);
//     baseval += TICKINTERVAL;
//     i++;
//   }
//   return series;
// }

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
    var y = 0 //Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

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
// getDayWiseTimeSeries(new Date('2021-01-27').getTime(), 10, {
//   min: -20,
//   max: 20
// })

var dt = new Date()

getDayWiseTimeSeries(dt.setHours(dt.getHours() + 1), dataNumber, {
  min: -2,
  max: 2
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
        type: 'category',
        //min: new Date('1 Jan 2021 ECT').getTime(),
        //CRUSIAL! THESE SETTINGS!
        range: XAXISRANGE
      },
      yaxis: {
        min: -2,
        max: 2
      },
      legend: {
        show: false
      },
    }
  })

  useEffect(() => {
    setInterval(() => {

      resetData();

      getDataFromRedis(lastDate, {
        min: -2,
        max: 2
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
