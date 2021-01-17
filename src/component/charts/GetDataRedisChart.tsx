import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { Line } from 'react-chartjs-2'
import { BehaviorSubject, interval } from 'rxjs'
import { map, sample } from 'rxjs/operators'
import { props } from "rambda";
import { CChartContainerRedis } from '@/component/charts/ChartContainerRedis'
import { Button } from '@material-ui/core'
import Typography from "@material-ui/core/Typography";
import { lpushAsync, lrangeAsync, flushallAsync } from '@/services/dbcapturing'
import SerialPort from "serialport";

type Props = {
  serialPort : any;
}

type State = {
  name: string
  //serialPort: any
}

let messageStarted = false
var datasegmentcounter = 0
let isCollecting = false

const imuAngle = (h: number, l: number) => ((h.valueOf() << 8) | l.valueOf()) / 32768 * 180
const Accax = (h: number, l:number) => ((h.valueOf() << 8) | l.valueOf()) / 32768*16*9.8;
const Accay = (h: number, l:number) => ((h.valueOf() << 8) | l.valueOf()) / 32768*16*9.8;
const Accaz = (h: number, l:number) => ((h.valueOf() << 8) | l.valueOf()) / 32768*16*9.8;

export enum ImuState {
  IMU_TIME = 0x50,
  IMU_ACC = 0x51,
  IMU_ANGULAR = 0x52,
  IMU_ANGLE = 0x53,
  IMU_MAGN = 0x54,
  IMU_PREFIX = 0x55,
  IMU_COMMAND_RECEIVED = 97,
  IMU_COMMAND_IDLE = 98,
  IMU_ERROR_RECEIVED = 99,
  IMU_IDLE = 0x00
}


export interface ImuMsg {
  state: ImuState,
  flag: number,
  cmd: number,
  length: number,
  buffer: number[],
  checksum: number
}

const imuMsg: ImuMsg = {
  state: ImuState.IMU_IDLE,
  flag: 0,
  cmd: 0,
  length: 0,
  buffer: [],
  checksum: 0
}

export interface IImuMsgAcc {
  enable: boolean,
  AxL: number,
  AxH: number,
  AyL: number,
  AyH: number,
  AzL: number,
  AzH: number,
  TL: number,
  TH: number,
  SUM: number
}

const imuMsgAcc: IImuMsgAcc = {
  enable: false,
  AxL: 0,
  AxH: 0,
  AyL: 0,
  AyH: 0,
  AzL: 0,
  AzH: 0,
  TL: 0,
  TH: 0,
  SUM: 0
}

function parseIMUAcc(num: number) {
  switch (num) {
    case ImuState.IMU_PREFIX:
      if (!messageStarted) {
        messageStarted = true
        imuMsgAcc.enable = false
      }
      break;
    case ImuState.IMU_ACC:
      messageStarted = false
      imuMsgAcc.enable = true
      datasegmentcounter = 0;
      break;
  }
  datasegmentcounter++;
  if (imuMsgAcc.enable) {
    imuMsg.state = ImuState.IMU_IDLE;
    switch (datasegmentcounter) {
      case 1: break;
      case 2: imuMsgAcc.AxL = num; break;
      case 3: imuMsgAcc.AxH = num; break;
      case 4: imuMsgAcc.AyL = num; break;
      case 5: imuMsgAcc.AyH = num; break;
      case 6: imuMsgAcc.AzL = num; break;
      case 7: imuMsgAcc.AzH = num; break;
      case 8: imuMsgAcc.TL = num; break;
      case 9: imuMsgAcc.TH = num; break;
      case 10: imuMsgAcc.SUM = num; break;
    }
    imuMsg.state = ImuState.IMU_COMMAND_RECEIVED;
  }
}

class ChartGetDataRedisChart extends Component<Props, State> {
    
    constructor(props) {
      super(props);
      this.state = {
        name: "",
       // serialPort: props.serialPort
      };
    }

    clickEvent(event) {
    //   this.setState({
    //   name: 'Getting data!'
    // });
    /* get database records */
    //fillChartData();

  }

  clickEventFlush(event) {
    isCollecting = false;
    flushallAsync();
  }

  clickEventStartProcess(event) {
    /* start capturing */
     this.props.serialPort?.value.on('data', function (data) {
      if (isCollecting)
      {
        let counter = 0
        for (let i = 0; i < data.length; i++) {
          //if 0x55 is found unpack messages till next 0x55
          parseIMUAcc(data.readInt8(i))
          if (imuMsg.state == ImuState.IMU_COMMAND_RECEIVED) {
            //imuResponse$.next(imuMsgAngle)
            lpushAsync('dataAccx', "ts:"+new Date().getTime()+"^x:"+new Date().getTime()+"^y:"+Accax(imuMsgAcc.AxH, imuMsgAcc.AxL))
            lpushAsync('dataAccy', "ts:"+new Date().getTime()+"^x:"+new Date().getTime()+"^y:"+Accax(imuMsgAcc.AyH, imuMsgAcc.AyL))
            lpushAsync('dataAccz', "ts:"+new Date().getTime()+"^x:"+new Date().getTime()+"^y:"+Accax(imuMsgAcc.AzH, imuMsgAcc.AzL))
            imuMsg.state = ImuState.IMU_IDLE
          } else if (imuMsg.state == ImuState.IMU_ERROR_RECEIVED) {
            //imuResponse$.error(new Error('MSP error received!'))
            imuMsg.state = ImuState.IMU_IDLE
          }
          counter++;
        }
      }
    })

  }

  clickEventStartCapture(event) {
    /* start capturing */
    isCollecting = true;

  }

  clickEventStopCapture(event) {
    /* start capturing */
    isCollecting = false;

  }


  //  <!--<button title="Get Data" color="#841584" id="name" onClick={this.changeText.bind(this)} />-->

  render() {
     return (
       <div>
         <Button variant="contained" onClick={() => {{ this.clickEvent(this)  }}}>Test Button</Button>
         <Button variant="contained" color="primary" onClick={() => {{ this.clickEventStartCapture(this);  }}}>Start Capture</Button>
         <Button variant="contained" color="primary" onClick={() => {{ this.clickEventStartProcess(this)  }}}>Start Process</Button>
         <Button variant="contained" color="secondary" onClick={() => {{ this.clickEventStopCapture(this);  }}}>Stop Capture</Button>
         <Button variant="outlined" color="primary" onClick={() => {{ this.clickEventFlush(this)  }}}>Flush Data</Button>
         <h3>Answer: {this.state.name}</h3>
       </div>
     );
  }
}

export const GetDataRedisChart = (props) => {
  const { serialPort } = props
  return (
    <React.Fragment>
      <h2>Chart from Redis</h2>
      <ChartGetDataRedisChart serialPort={serialPort} />
      <CChartContainerRedis />

    </React.Fragment>
  )
}