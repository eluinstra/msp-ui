import React from 'react'
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import { Scatter } from 'react-chartjs-2'
import { interval } from 'rxjs'
import { map, sample } from 'rxjs/operators'
import { llenAsync, lpushAsync, lrangeAsync, flushallAsync } from '@/services/dbcapturing'
import { Number } from 'rambda/_ts-toolbelt/src/Iteration/Maps/_api'

let N = 1; /* Wordt later ingelezen uit Redis */
var Xxas = 0;
var Xyas = 0;
var Yxas = 0;
var Yyas = 0;
var datapoints = [];
var datapoints2 = []; /* crusiaal een eigen data array per "kanaal" */

function timeformat(date : Date) {
  return ""+date.getTime();
}

var chartJsData = function() {
    for (var ci=0; ci < N; ci++ )
    {
      datapoints[ci] = {x:0, y:0};
    }
    return datapoints;
}

var chartJsData2 = function() {
  for (var ci=0; ci < N; ci++ )
  {
    datapoints2[ci] = {x:0, y:0};
  }
  return datapoints2;
}

const chartData = {
  type: 'line',
  datasets:[
    {
      label: "Data from the xAxis",
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
  ,
    {
      label: "Data from the yAxis",
      backgroundColor: 'green',
      fillColor: 'rgba(220,220,220,0.2)',
      strokeColor: 'rgba(220,220,220,1)',
      pointStyle: 'circle',
      pointColor: 'green',
      pointStrokeColor: 'lightgreen',
      pointHighlightFill: '#fff',
      pointHighlightStroke: 'rgba(220,220,220,1)',
      pointHitRadius: 3,
      pointRadius: 5,
      data: chartJsData2()
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
        beginAtZero: false,
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
        //const { datasets } = props
        // const data = {
        //   datasets: datasets
        // }
        this.state={
         //data: chartJsData()
        }
        //this.fillChartData = this.fillChartData.bind(this);
    }

  fillChartData = () => {

    Xxas = 0;
    Xyas = 0;

    Yxas = 0;
    Yyas = 0;
    
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

        llenAsync('dataAccx').then(function(result : string) {


          if(result)
          {
            N = parseInt(result.valueOf())-10;
            //console.log("Dataset length: "+ N);
          }
        });
        chartJsData();
        chartJsData2();
      
        var Nfactor = 1;

        lrangeAsync('dataAccx', 0 , datapoints.length).then(function(result : string[]) {


          if(result)
          {
            //console.log("X: ( "+datapoints.length+" ) ("+result.length+" )\n");
            //console.log("Result X: { "+result+" }\n");
            /* N=10 dan var delen is -6 */
            
            for (let j=0; j < (result.length-Nfactor); j++)
            {
              var vali : string = result[j].toString(); /* syntax ts:<value> ^ x:<value> ^ y:<value> */

              
                var valStr = vali.split("\^");
                //console.log(valStr);

                var xyes = valStr[1].includes("x:");
                var yyes = valStr[2].includes("y:");

                //console.log("vali1:"+valStr[1]);

                if (xyes)
                {
                  chartData.datasets[0].data[Xxas].x = valStr[1].split("x:")[1].valueOf();
                  //console.log("Result X-X: { "+valStr[0].split("x:")[1].valueOf()+" }\n");
                  Xxas++;
                }
                if (yyes)
                {
                  chartData.datasets[0].data[Xyas].y = valStr[2].split("y:")[1].valueOf();
                  //console.log("Result X-Y: { "+valStr[1].split("y:")[1].valueOf()+" }\n");
                  Xyas++;
                }
              

              
            }
          }
        }
        );

        lrangeAsync('dataAccy', 0 , datapoints.length).then(function(result : string[]) {

          if(result)
          {
            //console.log("Y: ( "+datapoints.length+" ) ("+result.length+" )\n");
            //console.log("Result Y: { "+result+" }\n");
            
            for (let j=0; j < (result.length-Nfactor); j++)
            {
              var vali : string = result[j].toString(); /* syntax ts:<value> ^ x:<value> ^ y:<value> */
              var valStr = vali.split("\^");
              //console.log("2"+valStr);

              
                var xyes = valStr[1].includes("x:");
                var yyes = valStr[2].includes("y:");

                //console.log("vali2:"+valStr[1]);

                if (xyes)
                {
                  chartData.datasets[1].data[Yxas].x = valStr[1].split("x:")[1].valueOf();
                  Yxas++;
                  //console.log("Result YX: { "+valStr[0].split("x:")[1].valueOf()+" }\n");
                }
                if (yyes)
                {
                  chartData.datasets[1].data[Yyas].y = valStr[2].split("y:")[1].valueOf();
                  //console.log("Result YY: { "+valStr[1].split("y:")[1].valueOf()+" }\n");
                  Yyas++;
                }
              

              
            }
          }
        }
        );

        //console.log(datapoints.length+ " ] -->"+ chartData.datasets[0].data.length +"\n");
        //console.log(datapoints.length+" ] ----->"+ chartData.datasets[0].data.length +"\n")

        //this.chartData.datasets[0] = charData.datasets[0];

      return chartData.datasets;
  }

  chartData = () => {

    var dataset = this.fillChartData();
    // for (let j=0; j < (dataset[0].data.length); j++)
    // {
    //   console.log("-1-> "+ dataset[0].data[j].x);
    //   console.log("-1-> "+ dataset[0].data[j].y);
    // }

    // for (let j=0; j < (dataset[1].data.length); j++)
    // {
    //   console.log("-2-> "+ dataset[1].data[j].x);
    //   console.log("-2-> "+ dataset[1].data[j].y);
    // }

    //console.log("--> "+ dataset[1].data.length);

    return {
      datasets: chartData.datasets
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