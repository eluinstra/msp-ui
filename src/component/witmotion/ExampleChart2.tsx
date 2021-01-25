import React, { useEffect, useState } from 'react'
import { interval } from 'rxjs'
import { map, sample } from 'rxjs/operators'
import { AppBar, CssBaseline, Drawer, Grid, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography } from '@material-ui/core'
import { llenAsync, lpushAsync, lrangeAsync, flushallAsync } from '@/services/dbcapturing'
import ReactApexChart from 'react-apexcharts'

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

// data for the sparklines that appear below header area
var sparklineData = [47, 45, 54, 38, 56, 24, 65, 31, 37, 39, 62, 51, 35, 41, 35, 27, 93, 53, 61, 27, 54, 43, 19, 46];

export const ExampleChart2 = props => {
  const { driver, datasets } = props
  const data = {
    datasets: datasets
  }

  const options = {
    series: [{
      data: generateDayWiseTimeSeries(new Date('11 Feb 2017').getTime(), 20, {
        min: 10,
        max: 60
      })
    }],
    options: {
      chart: {
        id: 'fb',
        group: 'social',
        type: 'line',
        height: 160
      },
      colors: ['#008FFB'],
      yaxis: {
        labels: {
          minWidth: 40
        }
      }
    }

  }
  const options2 = {
    series: [{
      data: generateDayWiseTimeSeries(new Date('11 Feb 2017').getTime(), 20, {
        min: 10,
        max: 30
      })
    }],
    options: {
      chart: {
        id: 'tw',
        group: 'social',
        type: 'line',
        height: 160
      },
      colors: ['#546E7A'],
      yaxis: {
        labels: {
          minWidth: 40
        }
      }
    }

  }
  return (
    <div>
      <React.Fragment>
        <Grid container spacing={3}>
        <Grid item xs={12}>
          <ReactApexChart options={options.options} series={options.series} type="line" height={320} />
        </Grid>
        <Grid item xs={12}>
          <ReactApexChart options={options2.options} series={options2.series} type="line" height={320} />
        </Grid>
        </Grid>
      </React.Fragment>
    </div>

  )
}