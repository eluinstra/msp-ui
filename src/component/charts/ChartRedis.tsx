import React from 'react'
import { Line } from 'react-chartjs-2'
import { interval } from 'rxjs'
import { map, sample } from 'rxjs/operators'
import { lpushAsync, lrangeAsync } from '@/services/dbcapturing';
import { Button } from '@material-ui/core'

var N = 10;

var datasets = [ {
           label: 'My First dataset',
           fillColor: 'rgba(220,220,220,0.2)',
           strokeColor: 'rgba(220,220,220,1)',
           pointColor: 'rgba(220,220,220,1)',
           pointStrokeColor: '#fff',
           pointHighlightFill: '#fff',
           pointHighlightStroke: 'rgba(220,220,220,1)',
           data: [] ,
         }];

export function fillChartData() {

  var min = 1;
  var max = 1000;
  var randx =  Math.round(min + (Math.random() * (max-min)));
  var randy =  Math.round(min + (Math.random() * (max-min)));

  lpushAsync('data', ""+randx);
  lpushAsync('data', ""+randy);

  randx =  Math.round(min + (Math.random() * (max-min)));
  randy =  Math.round(min + (Math.random() * (max-min)));

  lpushAsync('data', ""+randx);
  lpushAsync('data', ""+randy);
  randx =  Math.round(min + (Math.random() * (max-min)));
  randy =  Math.round(min + (Math.random() * (max-min)));

  lpushAsync('data', ""+randx);
  lpushAsync('data', ""+randy);
  randx =  Math.round(min + (Math.random() * (max-min)));
  randy =  Math.round(min + (Math.random() * (max-min)));

  lpushAsync('data', ""+randx);
  lpushAsync('data', ""+randy);

      var vali : string[];
      lrangeAsync('data', 0 ,-1).then(function(result : string[]) {
        console.log(result);
        //datasets[0].data[i]= "10";
       vali = result;
       console.log("Waarde: " + vali);
       datasets[0].data = result;
      }
      )
   
    //datasets[0].labels = ["1", "2", "3", "4", "5", "6", "7"];
  
    console.log(datasets[0]);
    return datasets;
}

// export const ChartRedis = props => {
//   const { datasets } = props
  
  function chartData() {
    return {
      datasets: fillChartData()
    }
  }

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

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    tooltips: {
      enabled: true
    },
    events: ['click'],
    scaleShowGridLines: true,
    datasetFill: true,
    datasetStrokeWidth: 2,
    pointDot: true,
    pointDotRadius: 4,
    scales: {
      xAxes: [{
          min: 0,
          max: 40
      }]
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

  const styles = {
    graphContainer: {
      border: '1px solid black',
      padding: '15px'
    }
  }

// return (
//     <Line data={data} options={options} height={150} />
//   )
// }

type Props = {}

type State = {}

class ChartRedis extends React.Component<any, any> {

  chartReference = {};

  componentDidMount() {
    console.log(this.chartReference); // returns a Chart.js instance reference
  }

  constructor(props) {
    super(props)
    this.state = {
      data: chartData()
    }

  }

  clickEvent(event) {
      this.setState({
      name: 'Getting data!'
    });

    fillChartData();
    this.forceUpdate();

  }

  componentDidUpdate()
  {
    console.log("I updated"); // returns a Chart.js instance reference
  }

  render() {
    return (
      <div id="myChart" style={styles.graphContainer}>
        <Button variant="contained" onClick={() => {{ this.clickEvent(this)  }}}>Get Data</Button>
        <Line data={this.state.data}  options={options} width={400} height={150} />
      </div>
    )
  }
}

export default ChartRedis;
