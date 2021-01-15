import React from 'react'
import { Scatter } from 'react-chartjs-2'
import { interval } from 'rxjs'
import { map, sample } from 'rxjs/operators'
import { lpushAsync, lrangeAsync } from '@/services/dbcapturing'
import { Number } from 'rambda/_ts-toolbelt/src/Iteration/Maps/_api'


var N=10;
var datapoints = [];

function timeformat(date : Date) {
  // var h = date.getHours();
  // var m = date.getMinutes();
  // var x = h >= 12 ? 'pm' : 'am';
  // h = h % 12;
  // h = h ? h : 12;
  // m = m < 10 ? '0'+m: m;
  // var mytime= h + ':' + m + ' ' + x;
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
  type: 'scatter',
  datasets:[
    {
      label: "Data from the wrist",
      backgroundColor: 'green',
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
        labelString: 'probability'
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
          data: this.chartData()
        }
        //this.fillChartData = this.fillChartData.bind(this);
    }

    // legendClick=function() {
    //   console.log("Legend click"+ chartData.labels);
    //   chartData.datasets[0].data=[100,120,200,25,56,78,80,90,70,100];
    // } 

// var N = 10;

// var datasets = [ {
//            label: 'My First dataset',
//            fillColor: 'rgba(220,220,220,0.2)',
//            strokeColor: 'rgba(220,220,220,1)',
//            pointColor: 'rgba(220,220,220,1)',
//            pointStrokeColor: '#fff',
//            pointHighlightFill: '#fff',
//            pointHighlightStroke: 'rgba(220,220,220,1)',
//            data: [] ,
//          }];

  fillChartData = () => {

    var min = 1;
    var max = 100;
    var randx =  Math.round(min + (Math.random() * (max-min)));
    var randy =  Math.round(min + (Math.random() * (max-min)));

        /* sample set */
        // for (let ji=0; ji < (N-1); ji++)
        // {
        //   randy =  Math.round(min + (Math.random() * (max-min)));
        //   lpushAsync('data', "x:"+ji, "y:"+randy);
        // }
  
        // lrangeAsync('data', 0 , ((N-1)*2)).then(function(result : string[]) {

        //   console.log("Lengte dataset: "+result.length);

        //   if(result)
        //   {
        //     var xas = 0;
        //     var yas = 0;
        //     for (let j=0; j < result.length; j++)
        //     {
        //       var vali : string = result[j].toString();

        //       var xyes = vali.includes("x:");
        //       var yyes = vali.includes("y:");
        //       if (xyes)
        //       {
        //         chartData.datasets[0].data[xas].x = vali.split("x:")[1].valueOf();
        //         xas++;
        //       }
        //       if (yyes)
        //       {
        //         chartData.datasets[0].data[yas].y = vali.split("y:")[1].valueOf();
        //         yas++;
        //       }

              
        //     }
        //   }
        // }
        // );

      chartData.datasets[0].data[0].x = 0;  
      chartData.datasets[0].data[0].y = randy;

      chartData.datasets[0].data[1].x = 1;  
      chartData.datasets[0].data[1].y = randy + 10;

      //console.log(chartData.datasets[0].data);
      //console.log(chartData.datasets);
      return chartData.datasets;
  }

  chartData = () => {
    return {
      datasets: this.fillChartData()
    }
  }

  
    // const options = {
  //   scaleShowGridLines: true,
  //   scaleGridLineColor: 'rgba(0,0,0,.05)',
  //   scaleGridLineWidth: 1,
  //   scaleShowHorizontalLines: true,
  //   scaleShowVerticalLines: true,
  //   bezierCurve: true,
  //   bezierCurveTension: 0.4,
  //   pointDot: true,
  //   pointDotRadius: 4,
  //   pointDotStrokeWidth: 1,
  //   pointHitDetectionRadius: 20,
  //   datasetStroke: true,
  //   datasetStrokeWidth: 2,
  //   datasetFill: true,
  //   legendTemplate: '<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>',
  // }

  

  // function chartData() {
  //   return {
  //     labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  //     datasets: [
  //       {
  //         label: 'My First dataset',
  //         fillColor: 'rgba(220,220,220,0.2)',
  //         strokeColor: 'rgba(220,220,220,1)',
  //         pointColor: 'rgba(220,220,220,1)',
  //         pointStrokeColor: '#fff',
  //         pointHighlightFill: '#fff',
  //         pointHighlightStroke: 'rgba(220,220,220,1)',
  //         data: [65, 59, 80, 81, 56, 55, 40],
  //       },
  //       {
  //         label: 'My Second dataset',
  //         fillColor: 'rgba(151,187,205,0.2)',
  //         strokeColor: 'rgba(151,187,205,1)',
  //         pointColor: 'rgba(151,187,205,1)',
  //         pointStrokeColor: '#fff',
  //         pointHighlightFill: '#fff',
  //         pointHighlightStroke: 'rgba(151,187,205,1)',
  //         data: [28, 48, 40, 19, 86, 27, 90],
  //       },
  //     ]
  //   }
  // }

render()
{
  return (
      <Scatter data={this.chartData} options={options} height={150} />
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