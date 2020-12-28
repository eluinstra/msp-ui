import React from "react";
import { render } from "react-dom";
import { withStyles } from "@material-ui/core/styles";
import imuMsgAngle from "../component/imu/imu-driver";
import Chart from "./cchart"
import { Line } from "react-chartjs-2";
import 'chartjs-plugin-streaming';
import { interval } from "rxjs";
import { map } from "rxjs/operators";
import { sample } from "rxjs/operators";
import { ImuMsg, imuRequest, imuResponse$ } from '../component/imu/imu-driver'

var createReactClass = require("create-react-class");

 const state = {
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
  }

  const options = {
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        enabled: true
      },
      plugins: {
        streaming: {
            delay: 2000,
            //refresh: 1000,
            //frameRate: 30,
            //duration: 3600000 // 3600000 = 1hour
        }
      },
      events: ['click'],
      scales: {
        xAxes: [
          {
            type: "realtime"
          }
        ]
      }
  }


    // var roll:number = ((imuMsgAngle.RollH.valueOf() << 8)|imuMsgAngle.RollL.valueOf())/32768*180;
    // var pitch:number = ((imuMsgAngle.PitchH.valueOf() << 8)|imuMsgAngle.PitchL.valueOf())/32768*180;
    // var yaw:number = ((imuMsgAngle.YawH.valueOf() << 8)|imuMsgAngle.YawL.valueOf())/32768*180;

    imuResponse$
    .pipe(
      sample(interval(500)),
      map(imuMsgAngle =>
        {
          const imuResults = {
            roll: ((imuMsgAngle.RollH.valueOf() << 8)|imuMsgAngle.RollL.valueOf())/32768*180,
            pitch: ((imuMsgAngle.PitchH.valueOf() << 8)|imuMsgAngle.PitchL.valueOf())/32768*180,
            yaw: ((imuMsgAngle.YawH.valueOf() << 8)|imuMsgAngle.YawL.valueOf())/32768*180
          }
          return imuResults;
        }
        //pitch: ((imuMsgAngle.PitchH.valueOf() << 8)|imuMsgAngle.PitchL.valueOf())/32768*180,
         //yaw: ((imuMsgAngle.YawH.valueOf() << 8)|imuMsgAngle.YawL.valueOf())/32768*180       
      
      ),
    )
    .subscribe(value => 
      {
        const waarde = Object.values(value);
        var counter = 0;
        waarde.forEach( key => 
          {

            state.datasets[counter].data.push({
               x: Date.now(), 
               y: key
            }),

            //console.log(key + ":" + counter);
            counter++
          }
        )
      }
    );

    // interval(500).pipe(
    //   map(() => (
    //   {
    //     x: Date.now(), 
    //     y: pitch
    //   }
    //   )),
    // ).subscribe(value => {
    //   state.datasets[1].data.push({
    //     x: Date.now(), 
    //     y: value
    //   })
    // })

export default createReactClass({
  displayName: "LineExample",
  render() {
    return (
      <div id='mychart' style={{"height": 300}}>
        <Line key="lineid"
           data={state}
           options={options}
        />
      </div>
    );
  }
});