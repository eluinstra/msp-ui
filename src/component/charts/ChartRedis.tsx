import React from 'react'
import { Scatter } from 'react-chartjs-2'
import { interval } from 'rxjs'
import { map, sample } from 'rxjs/operators'
import { lpushAsync, lrangeAsync } from '@/services/dbcapturing'
import { Number } from 'rambda/_ts-toolbelt/src/Iteration/Maps/_api'

var N=10;
var datapoints = [];

function timeformat(date : Date) {
  return ""+date.getTime();
}

var chartJsData = function() {
    for (var ci=0; ci < N; ci++ )
    {
      datapoints.push({x:ci, y:0});
    }
    return datapoints;
}

const chartData = {
  type: 'line',
  datasets:[
    {
      label: "Data from the wrist",
      backgroundColor: 'blue',
      fillColor: 'rgba(220,220,220,0.2)',
      strokeColor: 'rgba(220,220,220,1)',
      pointStyle: 'circle',
      pointColor: 'blue',
      pointStrokeColor: 'lightblue',
      pointHighlightFill: '#fff',
      pointHighlightStroke: 'rgba(220,220,220,1)',
      pointHitRadius: 3,
      pointRadius: 5,
      data: chartJsData()
    }
  ]
}

const options = {
  responsive: true,
  maintainAspectRatio: false,
  tooltips: {
    enabled: true
  },
  events: ['click'],
  parsing: false,
  scaleShowGridLines: true,
  backgroundColor: 'blue',
  datasetFill: true,
  datasetStrokeWidth: 2,
  pointDot: true,
  pointDotRadius: 4,
  scales: {
    xAxes: [{
        type: 'linear',
        position: 'bottom'
    }],
    yAxes: [{
      scaleLabel: {
        display: true,
        labelString: 'x'
      }
    }]
  }
} 

class ChartRedis extends React.Component {

  constructor(props)
    {
        super(props)
        const { datasets } = props
        const data = {
          datasets: datasets
        }
        this.state={
         data: this.chartData
        }
        //this.fillChartData = this.fillChartData.bind(this);
    }

  fillChartData = () => {

    var min = 1;
    var max = 100;
    var randx =  Math.round(min + (Math.random() * (max-min)));
    var randy =  Math.round(min + (Math.random() * (max-min)));

        /* sample set */
        for (let ji=0; ji < (N-1); ji++)
        {
          randy =  Math.round(min + (Math.random() * (max-min)));
          lpushAsync('data', "x:"+ji, "y:"+randy);
        }
  
        lrangeAsync('data', 0 , ((N-1)*2)).then(function(result : string[]) {

          if(result)
          {
            var xas = 0;
            var yas = 0;
            for (let j=0; j < result.length; j++)
            {
              var vali : string = result[j].toString();

              var xyes = vali.includes("x:");
              var yyes = vali.includes("y:");
              if (xyes)
              {
                chartData.datasets[0].data[xas].x = vali.split("x:")[1].valueOf();
                xas++;
              }
              if (yyes)
              {
                chartData.datasets[0].data[yas].y = vali.split("y:")[1].valueOf();
                yas++;
              }

              
            }
          }
        }
        );

      return chartData.datasets;
  }

  chartData = () => {
    return {
      datasets: this.fillChartData()
    }
  }

render()
{
  return (
      <Scatter data={this.chartData} options={options} height={150} redraw />
    )
  }
}

export const CChartRedis = () => {
  return (
    <React.Fragment>
      <ChartRedis />

    </React.Fragment>
  )
}