import React from 'react'
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import { Scatter } from 'react-chartjs-2'
import Slider from '@material-ui/core/Slider'
import { interval } from 'rxjs'
import { map, sample } from 'rxjs/operators'
import { llenAsync, lpushAsync, lrangeAsync, flushallAsync } from '@/services/dbcapturing'
import { Number } from 'rambda/_ts-toolbelt/src/Iteration/Maps/_api'

type chartDataType = {
  x: number,
  y: number
};

let N = 1; /* Wordt later ingelezen uit Redis */
let NSlider = 1;
var Xxas = 0;
var Xyas = 0;
var Yxas = 0;
var Yyas = 0;
let datapoints: chartDataType[] = [];
let datapoints2: chartDataType[] = []; /* crusiaal een eigen data array per "kanaal" */

function timeformat(date: Date) {
  return "" + date.getTime();
}

const chartData = {
  type: 'line',
  datasets: [
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
      data: datapoints
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
      data: datapoints2
    }
    // ,
    // {
    //   label: "Data from the zAxis",
    //   backgroundColor: 'red',
    //   fillColor: 'rgba(220,220,220,0.2)',
    //   strokeColor: 'rgba(220,220,220,1)',
    //   pointStyle: 'circle',
    //   pointColor: 'red',
    //   pointStrokeColor: 'lightred',
    //   pointHighlightFill: '#fff',
    //   pointHighlightStroke: 'rgba(220,220,220,1)',
    //   pointHitRadius: 3,
    //   pointRadius: 5,
    //   data: datapoints2
    // }
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

type Props = {
  //serialPort : any;
}

type State = {
  points: number,
  value: number[],
  min: number,
  max: number,
  step: number
}

class ChartRedis extends React.Component<Props, State> {

  constructor(props) {
    super(props)
    this.state = {
      points: 0,
      value: [10, 40],
      min: 0,
      max: 600,
      step: 1
    };

    this.getNValue(this.state);
  }

  getNValue = (value) => {

    /* Redis interaction */

    llenAsync('dataAccx').then(function (result: string) {

      N = parseInt(result.valueOf()) - 10;

      value.max = N;
      return N;
    });

  }

  fillChartData = () => {

    Xxas = 0;
    Xyas = 0;

    Yxas = 0;
    Yyas = 0;

    var min = 1;
    var max = 100;
    var randx = Math.round(min + (Math.random() * (max - min)));
    var randy = Math.round(min + (Math.random() * (max - min)));

    var Nfactor = 1;

    lrangeAsync('dataAccx', this.state.value[0], this.state.value[1]).then(function (result: string[]) {


      if (result) {

        chartData.datasets[0].data = [];

        for (let j = 0; j < (result.length - Nfactor); j++) {
          var vali: string = result[j].toString(); /* syntax ts:<value> ^ x:<value> ^ y:<value> */


          var valStr = vali.split("\^");
          var xyes = valStr[1].includes("x:");
          var yyes = valStr[2].includes("y:");

          if (xyes && yyes) {
            chartData.datasets[0].data.push({
              x: parseFloat(valStr[1].split("x:")[1].valueOf()),
              y: parseFloat(valStr[2].split("y:")[1].valueOf())
            });

          }
        }
      }
    }
    );

    lrangeAsync('dataAccy', this.state.value[0], this.state.value[1]).then(function (result: string[]) {

      if (result) {

        chartData.datasets[1].data = [];

        for (let j = 0; j < (result.length - Nfactor); j++) {
          var vali: string = result[j].toString(); /* syntax ts:<value> ^ x:<value> ^ y:<value> */
          var valStr = vali.split("\^");

          var xyes = valStr[1].includes("x:");
          var yyes = valStr[2].includes("y:");


          if (xyes && yyes) {

            var xi = parseFloat(valStr[1].split("x:")[1].valueOf());
            var yi = parseFloat(valStr[2].split("y:")[1].valueOf());

            chartData.datasets[1].data.push({
              x: xi,
              y: yi
            });

          }

        }
      }
    }
    );

    // lrangeAsync('dataAccz', this.state.value[0], this.state.value[1]).then(function (result: string[]) {

    //   if (result) {

    //     chartData.datasets[2].data = [];

    //     for (let j = 0; j < (result.length - Nfactor); j++) {
    //       var vali: string = result[j].toString(); /* syntax ts:<value> ^ x:<value> ^ y:<value> */
    //       var valStr = vali.split("\^");
    //       //console.log("2"+valStr);


    //       var xyes = valStr[1].includes("x:");
    //       var yyes = valStr[2].includes("y:");


    //       if (xyes && yyes) {

    //         var xi = parseFloat(valStr[1].split("x:")[1].valueOf());
    //         var yi = parseFloat(valStr[2].split("y:")[1].valueOf());

    //         // if ( yi > 10 || yi < -10)
    //         // {
    //         //   console.log("WOW::: -> "+xi+" / "+ yi + "\n");
    //         // }
    //         chartData.datasets[2].data.push({
    //           x: xi,
    //           y: yi
    //         });

    //       }

    //     }
    //   }
    // }
    // );

    return chartData.datasets;
  }

  sliderOnChangeEvent = (event, value) => {

    this.setState({ value: value });
    //this.fillChartData();

  }

  getChartData = () => {

    // var dataset = this.fillChartData();
    //  for (let j=0; j < (dataset[0].data.length); j++)
    //  {
    //    //console.log("-1-> "+ dataset[0].data[j].x);
    //    //console.log("-1-> "+ dataset[0].data[j].y);
    //  }

    // for (let j=0; j < (dataset[1].data.length); j++)
    // {
    //   console.log("-2-> "+ dataset[1].data[j].x);
    //   console.log("-2-> "+ dataset[1].data[j].y);
    // }

    //console.log("--> "+ dataset[1].data.length);

    return {
      datasets: this.fillChartData()
    }
  }

  render() {
    const { value, min, max, step } = this.state;
    return (
      <div>
        <Slider
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={this.sliderOnChangeEvent}
          valueLabelDisplay="auto"
          aria-labelledby="range"
        //getAriaValueText={function = {{value + ' days'}}}
        />
        <Scatter data={this.getChartData()} options={options} height={150} redraw />
      </div>
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