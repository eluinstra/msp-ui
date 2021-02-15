import React, { useEffect, useState } from 'react'
import { interval } from 'rxjs'
import { map, sample } from 'rxjs/operators'
import { AppBar, CssBaseline, Drawer, Grid, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography } from '@material-ui/core'
import { llenAsync, lpushAsync, lrangeAsync, flushallAsync } from '@/services/dbcapturing'
import ReactApexChart from 'react-apexcharts'
import { getPort$, getPath, isOpen, registerFunction, write } from '@/component/serialport/SerialPortDriver'

var datasets = [];
let dataAccx = [];
let dataAccy = [];
let dataAccz = [];

let XAXISRANGE = 1000 //777600000
//var TICKINTERVAL = 86400000 /* 1000 * 60 * 60 * 24 * 365 = each calander year milliseconds * seconds * minutes * hours * days = 1 year */
var TICKINTERVAL = 100 /* 1000 * 60 * 60 * 24 * 365 = each calander year */

export const ExampleChart2 = props => {
  const { serialPort1, serialPort2 } = props
  const data = {
    datasets: datasets
  }

  const options = {
    series: [{
      type: 'line',
      data: dataAccx
    },
    {
      type: 'line',
      data: dataAccy
    },
    {
      type: 'line',
      data: dataAccz
    }],
    options: {
      chart: {
        id: 'accelerochart',
        type: 'line',
        height: 260
      },
      colors: ['#2E93fA', '#66DA26', '#546E7A'],
      yaxis: {
        labels: {
          minWidth: 120
        }
      }
    }

  }
  useEffect(() => {
    
    var nResults = 0;

    var pathOrigin = getPath(serialPort1);

      lrangeAsync(pathOrigin + '_Accelero_X', 0, -1).then(function (result: string[]) {

        if (result) {

          nResults = result.length; 
        
          for (let j = 0; j < (result.length); j++) {
            var vali = result[j].toString(); /* syntax ts:<value> ^ x:<value> ^ y:<value> */
            var valStr = vali.split("\^");

            var xyes = valStr[1].includes("x:");
            var yyes = valStr[2].includes("y:");
            
            if (xyes && yyes) {

              var xi = parseFloat(valStr[1].split("x:")[1].valueOf());
              var yi = parseFloat(valStr[2].split("y:")[1].valueOf());
    
              dataAccx.push({
              x: xi,
              y: yi
            })
          }
        }
      }
      });

      lrangeAsync(pathOrigin + '_Accelero_Y', 0, -1).then(function (result: string[]) {

          if (result) {

            nResults = result.length; 
         
            for (let j = 0; j < (result.length); j++) {
              var vali = result[j].toString(); /* syntax ts:<value> ^ x:<value> ^ y:<value> */
              var valStr = vali.split("\^");

              var xyes = valStr[1].includes("x:");
              var yyes = valStr[2].includes("y:");
              
              if (xyes && yyes) {

                var xi = parseFloat(valStr[1].split("x:")[1].valueOf());
                var yi = parseFloat(valStr[2].split("y:")[1].valueOf());
      
                dataAccy.push({
                x: xi, // - XAXISRANGE - TICKINTERVAL,
                y: yi
              })
            }
          }
        }
      });

      lrangeAsync(pathOrigin + '_Accelero_Z', 0, -1).then(function (result: string[]) {

        if (result) {

          nResults = result.length; 
        
          for (let j = 0; j < (result.length); j++) {
            var vali = result[j].toString(); /* syntax ts:<value> ^ x:<value> ^ y:<value> */
            var valStr = vali.split("\^");

            var xyes = valStr[1].includes("x:");
            var yyes = valStr[2].includes("y:");
            
            if (xyes && yyes) {

              var xi = parseFloat(valStr[1].split("x:")[1].valueOf());
              var yi = parseFloat(valStr[2].split("y:")[1].valueOf());
    
              dataAccz.push({
              x: xi,
              y: yi
            })
          }
        }

        
      }
    });

    ApexCharts.exec('accelerochart', 'updateSeries', [
      {
        data: dataAccx
      },
      {
        data: dataAccy
      }
      ,
      {
        data: dataAccz
      }
    ])
  
  }, [])
  return (
    <div>
      <React.Fragment>
        <Grid container spacing={3}>
        <Grid item xs={12}>
          <ReactApexChart options={options.options} series={options.series} type="line" height={320} />
        </Grid>
        </Grid>
      </React.Fragment>
    </div>

  )
}