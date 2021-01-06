import React from "react";
import { render } from "react-dom";
import { withStyles } from "@material-ui/core/styles";
import imuMsgAcc from "../component/imu/imu-driver";
import Chart from "./cchart"
import { Line } from "react-chartjs-2";
require ('@taeuk-gang/chartjs-plugin-streaming');
import { interval } from "rxjs";
import { map } from "rxjs/operators";
import { sample } from "rxjs/operators";
import { ImuMsg, imuRequest1, imuRequest2, imuResponse1$, imuResponse2$ } from '../component/imu/imu-driver'
import { CSVLink } from "react-csv";
import { writeDB } from "../db/db";
import { ImuDataTypeSensor } from "../db/types";

//const chartjsplugin = require('@taeuk-gang/chartjs-plugin-streaming');

var createReactClass = require("create-react-class");

 const state = {
      labels: [],
      datasets: [
        {
          type: "line",
          label: "X",
          lineColor: "",
          fill: false,
          backgroundColor: "green",
          borderWidth: "2",
          lineTension: 0.45,
          data: []
        },
        {
          type: "line",
          label: "Y",
          fill: false,
          backgroundColor: "blue",
          borderWidth: "2",
          lineTension: 0.45,
          data: []
        },
        {
          type: "line",
          label: "Z",
          fill: false,
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
      // plugins: {
      //   streaming: {
      //       delay: 2000,
      //       //refresh: 1000,
      //       //frameRate: 30,
      //       //duration: 3600000 // 3600000 = 1hour
      //   }
      // },
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

    imuResponse1$
    .pipe(
      sample(interval(500)),
      map(imuMsgAcc =>
        {
          const imuResults = {
            // roll: ((imuMsgAngle.RollH.valueOf() << 8)|imuMsgAngle.RollL.valueOf())/32768*180,
            // pitch: ((imuMsgAngle.PitchH.valueOf() << 8)|imuMsgAngle.PitchL.valueOf())/32768*180,
            // yaw: ((imuMsgAngle.YawH.valueOf() << 8)|imuMsgAngle.YawL.valueOf())/32768*180

            ax: ((imuMsgAcc.AxH.valueOf() << 8)|imuMsgAcc.AxL.valueOf())/32768*16*9.8,
            ay: ((imuMsgAcc.AyH.valueOf() << 8)|imuMsgAcc.AyL.valueOf())/32768*16*9.8,
            az: ((imuMsgAcc.AzH.valueOf() << 8)|imuMsgAcc.AzL.valueOf())/32768*16*9.8
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
            //console.log(key + ": " + counter);
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

    imuResponse2$
    .pipe(
      sample(interval(500)),
      map(imuMsgAcc =>
        {
          const imuResults = {
            // roll: ((imuMsgAngle.RollH.valueOf() << 8)|imuMsgAngle.RollL.valueOf())/32768*180,
            // pitch: ((imuMsgAngle.PitchH.valueOf() << 8)|imuMsgAngle.PitchL.valueOf())/32768*180,
            // yaw: ((imuMsgAngle.YawH.valueOf() << 8)|imuMsgAngle.YawL.valueOf())/32768*180

            ax: ((imuMsgAcc.AxH.valueOf() << 8)|imuMsgAcc.AxL.valueOf())/32768*16*9.8,
            ay: ((imuMsgAcc.AyH.valueOf() << 8)|imuMsgAcc.AyL.valueOf())/32768*16*9.8,
            az: ((imuMsgAcc.AzH.valueOf() << 8)|imuMsgAcc.AzL.valueOf())/32768*16*9.8
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
            //console.log(key + ": " + counter);
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