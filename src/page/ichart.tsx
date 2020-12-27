import React from "react";
import { render } from "react-dom";
import { withStyles } from "@material-ui/core/styles";
import imuMsgAngle from "../component/imu/imu-driver";
import Chart from "./cchart"
import { Line } from "react-chartjs-2";
import 'chartjs-plugin-streaming';

class CChart extends React.Component {
 state = {
    lineChartData: {
      labels: [],
      datasets: [
        {
          type: "line",
          label: "Roll",
          backgroundColor: "green",
          borderWidth: "2",
          lineTension: 0.45,
          data: []
        },
        {
          type: "line",
          label: "Pitch",
          backgroundColor: "blue",
          borderWidth: "2",
          lineTension: 0.45,
          data: []
        },
        {
          type: "line",
          label: "Yaw",
          backgroundColor: "cyan",
          borderWidth: "2",
          lineTension: 0.45,
          data: []
        }
      ]
    },
    lineChartOptions: {
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        enabled: true
      },
      plugins: {
        streaming: {
            // onRefresh: function(chart) {
            //     chart.data.datasets[0].data.push({
            //         x: Date.now(),
            //         y: Math.random() * 100,
            //         r: 5
            //     });
            // },
            delay: 2000,
            //refresh: 1000,
            //frameRate: 30,
            //duration: 3600000 // 3600000 = 1hour
        }
      },
      scales: {
        xAxes: [
          {
            type: "realtime"
            //ticks: {
            //   autoSkip: true,
            //   maxTicksLimit: 10
            //}
          }
        ]
      }
    }
  };

  componentDidMount() {
    const subscribe = {
      type: "subscribe",
      channels: [
        {
          name: "ticker",
          product_ids: ["Sensors"]
        }
      ]
    };

    setInterval(() => {

    var roll:number = ((imuMsgAngle.RollH.valueOf() << 8)|imuMsgAngle.RollL.valueOf())/32768*180;
    var pitch:number = ((imuMsgAngle.PitchH.valueOf() << 8)|imuMsgAngle.PitchL.valueOf())/32768*180;
    var yaw:number = ((imuMsgAngle.YawH.valueOf() << 8)|imuMsgAngle.YawL.valueOf())/32768*180;

    //const oldBtcDataSet1 = this.state.lineChartData.datasets[0];

    var dateWithoutSecond = new Date();
    var datum = dateWithoutSecond.toLocaleTimeString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'});
    
    //const newBtcDataSet1 = { ...oldBtcDataSet1 };
    this.state.lineChartData.datasets[0].data.push({
        x: Date.now(),
        y: roll
    });

    //const oldBtcDataSet2 = this.state.lineChartData.datasets[1];
    
    //const newBtcDataSet2 = { ...oldBtcDataSet2 };
    this.state.lineChartData.datasets[1].data.push({
        x: Date.now(),
        y: pitch
    });

    //const oldBtcDataSet3 = this.state.lineChartData.datasets[2];
    
    //const newBtcDataSet3 = { ...oldBtcDataSet3 };
    this.state.lineChartData.datasets[2].data.push({
        x: Date.now(),
        y: yaw
    });
    //newBtcDataSet.data.push(pitch);
         
    const newChartData = {
            ...this.state.lineChartData,
            datasets: [this.state.lineChartData.datasets[0], this.state.lineChartData.datasets[1], this.state.lineChartData.datasets[2]],
            labels: this.state.lineChartData.labels.concat(
               1
            )
          };
          
          
          
    //const newData = useState({ lineChartData: newChartData });
    
    const data = {
      labels: [
        1
      ],
      datasets: [this.state.lineChartData.datasets[0], this.state.lineChartData.datasets[1], this.state.lineChartData.datasets[2]]
    }

      this.setState({ lineChartData: newChartData });

  }, 1000);


};

  componentWillUnmount() {
    //
  }

  render() {
    return (
      <div id='mychart' style={{"height": 300}}>
        <Line 
           data={this.state.lineChartData}
           options={this.state.lineChartOptions}
        />
      </div>
    );
  }
}

export default CChart;