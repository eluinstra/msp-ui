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
import { ContentSort } from "material-ui/svg-icons";

type Props = {
  serialPort: any;
}

type State = {
  name: string
  //serialPort: any
}

let messageStarted = false
let isCollecting = false
let datasegmentcounter = 0
let parseState = 0
let cmd = undefined

const imuAngle = (h: number, l: number) => ((h.valueOf() << 8) | l.valueOf()) / 32768 * 180
const Accax = (h: number, l: number) => ((h.valueOf() << 8) | l.valueOf()) / 32768 * 16;
const Accay = (h: number, l: number) => ((h.valueOf() << 8) | l.valueOf()) / 32768 * 16;
const Accaz = (h: number, l: number) => ((h.valueOf() << 8) | l.valueOf()) / 32768 * 16;

export enum ImuState {
  IMU_TIME = 0x50,
  IMU_ACC = 81, //0x51,
  IMU_ANGULAR = 0x52,
  IMU_ANGLE = 0x53,
  IMU_MAGN = 0x54,
  IMU_PREFIX = 85, //0x55,
  IMU_COMMAND_RECEIVED = 97,
  IMU_COMMAND_IDLE = 98,
  IMU_ERROR_RECEIVED = 99,
  IMU_IDLE = 0x00,
  IMU_DATA_PROCESSING = 100
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
  switch (parseState) {
    case 0:
      if (num == ImuState.IMU_PREFIX)
        imuMsg.state = ImuState.IMU_IDLE;
        parseState = 1
      break;
    case 1:
      if ([ImuState.IMU_TIME, ImuState.IMU_ACC, ImuState.IMU_ANGULAR, ImuState.IMU_ANGLE, ImuState.IMU_MAGN].includes(num)) {
        cmd = num
        parseState = 2
        datasegmentcounter = 0
      }
      else
        parseState = 0
      break;
    case 2:
      datasegmentcounter++;
      if (cmd == ImuState.IMU_ACC) {
        switch (datasegmentcounter) {
          case 1: imuMsgAcc.AxL = num; break;
          case 2: imuMsgAcc.AxH = num; break;
          case 3: imuMsgAcc.AyL = num; break;
          case 4: imuMsgAcc.AyH = num; break;
          case 5: imuMsgAcc.AzL = num; break;
          case 6: imuMsgAcc.AzH = num; break;
          case 7: imuMsgAcc.TL = num; break;
          case 8: imuMsgAcc.TH = num; break;
          case 9: imuMsgAcc.SUM = num; break;
        }
        if (datasegmentcounter == 9)
        {
          imuMsg.state = ImuState.IMU_COMMAND_RECEIVED;
        }
      }
      if (datasegmentcounter == 9)
      {
        parseState = 0
      }
      break;
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
      if (isCollecting) {
        let counter = 0

        imuMsgAcc.AxL = 0;
        imuMsgAcc.AxH = 0;
        imuMsgAcc.AyL = 0;
        imuMsgAcc.AyH = 0;
        imuMsgAcc.AzL = 0;
        imuMsgAcc.AzH = 0;
        imuMsgAcc.TL = 0;
        imuMsgAcc.TH = 0;
        imuMsgAcc.SUM = 0;

        for (let i = 0; i < data.length; i++) {
          //if 0x55 is found unpack messages till next 0x55



          parseIMUAcc(data.readInt8(i))
          if (imuMsg.state == ImuState.IMU_COMMAND_RECEIVED) {
            //imuResponse$.next(imuMsgAngle)

            let T = ((imuMsgAcc.TH << 8) | imuMsgAcc.TL) / 100;

            //console.log("data: ["+num+"] inputH: ["+imuMsgAcc.TH+"] inputL: ["+imuMsgAcc.TL+"] = output T ["+T+"]\n");

            let yx = (((imuMsgAcc.AxH << 8) | imuMsgAcc.AxL) / 32768.0 * 16);
            let yy = (((imuMsgAcc.AyH << 8) | imuMsgAcc.AyL) / 32768.0 * 16);
            //var yy = parseFloat(""+Accax(imuMsgAcc.AyH, imuMsgAcc.AyL));
            let yz = parseFloat("" + Accax(imuMsgAcc.AzH, imuMsgAcc.AzL));

            let CHK = 85 + 81 + (imuMsgAcc.AxH + imuMsgAcc.AxL + imuMsgAcc.AyH + imuMsgAcc.AyL + imuMsgAcc.AzH + imuMsgAcc.AzL + imuMsgAcc.TH + imuMsgAcc.TL) & 0xFF;

            let CHKVAL = CHK & 0xFF;


            /* Accelerometer */
            // var a = new Number(33);
            // var test = (a).toString(2);
            // const v : any = (imuMsgAcc.AxH).toString(2);
            // const v2 : any = (imuMsgAcc.AxL).toString(2);

            //lpushAsync('logging', "data:"+imuMsgAcc.TL+", "+imuMsgAcc.TH+", :"+imuMsgAcc.SUM+" -- "+ T);

            if (CHK === imuMsgAcc.SUM) {


              let sprefix = parseInt("85", 10).toString(16);
              let ssid = parseInt("81", 10).toString(16);
              let saxH = parseInt("" + imuMsgAcc.AxH, 10).toString(16);
              let saxL = parseInt("" + imuMsgAcc.AxL, 10).toString(16);
              let sayH = parseInt("" + imuMsgAcc.AyH, 10).toString(16);
              let sayL = parseInt("" + imuMsgAcc.AyL, 10).toString(16);
              let sazH = parseInt("" + imuMsgAcc.AzH, 10).toString(16);
              let sazL = parseInt("" + imuMsgAcc.AzL, 10).toString(16);
              let sth = parseInt("" + imuMsgAcc.TH, 10).toString(16);
              let stl = parseInt("" + imuMsgAcc.TL, 10).toString(16);
              let ssum = parseInt("" + imuMsgAcc.SUM, 10).toString(16);
              let cchk = parseInt("" + CHK, 10).toString(16);

              lpushAsync('dataAccx', "ts:" + new Date().getTime() + "^x:" + new Date().getTime() + "^y:" + yx)
              //lpushAsync('dataAccxc', "ts:"+new Date().getTime()+"^x:"+new Date().getTime()+"^y:"+yx+"---["+sti+"][ "+CHK+":"+imuMsgAcc.SUM+" ]");
              lpushAsync('dataAccxc', "[ " + sprefix + " " + ssid + " " + saxH + " " + saxL + " " + sayH + " " + sayL + " " + sazH + " " + sazL + " " + sth + " " + stl + "=" + ssum + ":" + cchk + " ]");

              lpushAsync('dataAccy', "ts:" + new Date().getTime() + "^x:" + new Date().getTime() + "^y:" + yy)
              lpushAsync('dataAccz', "ts:" + new Date().getTime() + "^x:" + new Date().getTime() + "^y:" + yz)
              //lpushAsync('temperature', "ts:"+new Date().getTime()+": "+imuMsgAcc.AxH+":"+imuMsgAcc.AxL+":"+imuMsgAcc.AyH+":"+imuMsgAcc.AyL+":"+imuMsgAcc.AzH+":"+imuMsgAcc.AzL+":"+imuMsgAcc.TH+":"+imuMsgAcc.TL);
              //lpushAsync('temperature', "ts:"+new Date().getTime()+": "+T+"  ["+CHK+":"+CHKVAL+":"+(imuMsgAcc.SUM));
            }
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
        <Button variant="contained" onClick={() => { { this.clickEvent(this) } }}>Test Button</Button>
        <Button variant="contained" color="primary" onClick={() => { { this.clickEventStartCapture(this); } }}>Start Capture</Button>
        <Button variant="contained" color="primary" onClick={() => { { this.clickEventStartProcess(this) } }}>Start Process</Button>
        <Button variant="contained" color="secondary" onClick={() => { { this.clickEventStopCapture(this); } }}>Stop Capture</Button>
        <Button variant="outlined" color="primary" onClick={() => { { this.clickEventFlush(this) } }}>Flush Data</Button>
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