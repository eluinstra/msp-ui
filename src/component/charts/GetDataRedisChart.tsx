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
  serialPort : any;
}

type State = {
  name: string
  //serialPort: any
}

let messageStarted = false
let isCollecting = false
var datasegmentcounter = 0

const imuAngle = (h: number, l: number) => ((h.valueOf() << 8) | l.valueOf()) / 32768 * 180
const Accax = (h: number, l:number) => ((h.valueOf() << 8) | l.valueOf()) / 32768*16;
const Accay = (h: number, l:number) => ((h.valueOf() << 8) | l.valueOf()) / 32768*16;
const Accaz = (h: number, l:number) => ((h.valueOf() << 8) | l.valueOf()) / 32768*16;

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
  IMU_IDLE = 0x00
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
  
  switch (num) {
    case ImuState.IMU_PREFIX:
      if (!messageStarted) {
        messageStarted = true
        imuMsgAcc.enable = false
        datasegmentcounter = 0;
      }
      break;
    case ImuState.IMU_ACC:
      messageStarted = false
      imuMsgAcc.enable = true
      break;
  }
  if (imuMsgAcc.enable) {
    imuMsg.state = ImuState.IMU_IDLE;
    datasegmentcounter++;
        
    switch (datasegmentcounter) {
      case 1: break; //0x51
      case 2: imuMsgAcc.AxL = num & 0xFF; break;
      case 3: imuMsgAcc.AxH = num & 0xFF; break;
      case 4: imuMsgAcc.AyL = num & 0xFF; break;
      case 5: imuMsgAcc.AyH = num & 0xFF; break;
      case 6: imuMsgAcc.AzL = num & 0xFF; break;
      case 7: imuMsgAcc.AzH = num & 0xFF; break;
      case 8: imuMsgAcc.TL = num & 0xFF; break;
      case 9: imuMsgAcc.TH = num & 0xFF; break;
      case 10: imuMsgAcc.SUM = num & 0xFF; imuMsg.state = ImuState.IMU_COMMAND_RECEIVED; break;
      case 11: break; // NEVER REACHING THIS!
    }

    

    //lpushAsync('logging', "data:"+datasegmentcounter+", "+T);
        //datasegmentcounter = 0;

        //if (datasegmentcounter === 9)
        //{

          //55 51 19 00 40 00 FF 07 DB 0C EC
          // --> Temp: 32.91 --> ((12 << 8 ) | 219) /100
          //                     ((0C << 8 ) | DB ) /100
         
          //console.log("data: ["+num+"] inputH: ["+imuMsgAcc.TH+"] inputL: ["+imuMsgAcc.TL+"] = output T ["+T+"]\n");
         // console.log(datasegmentcounter+ "] output T ["+T+"]\n");

          //imuMsgAcc.TH = 0;
         // imuMsgAcc.TL = 0;
        //}
    

            // var yx = new Number(""+Accax(imuMsgAcc.AxH & 0xFF, imuMsgAcc.AxL & 0xFF));
            // var yy = new Number(""+Accax(imuMsgAcc.AyH & 0xFF, imuMsgAcc.AyL & 0xFF));
            // var yz = new Number(""+Accax(imuMsgAcc.AzH & 0xFF, imuMsgAcc.AzL & 0xFF));

            // yx = ((imuMsgAcc.AxH & 0xFF << 8) | imuMsgAcc.AxL & 0xFF) / 32768*16;
            // yy = ((imuMsgAcc.AyH & 0xFF << 8) | imuMsgAcc.AyL & 0xFF) / 32768*16;

            // if (yx > 10 || yx < -10)
            // {
            //   var test = ((imuMsgAcc.AxH & 0xFF << 8) | imuMsgAcc.AxL & 0xFF) / 32768*16;
            //   console.log(" _yx1__ "+test+"______ < "+num);
            //   console.log(" _yx2__"+imuMsgAcc.AxH+"______ >"+imuMsgAcc.AxL);
            // }

            // if (yy > 10 || yy < -10)
            // {
            //   var test = ((imuMsgAcc.AyH & 0xFF << 8) | imuMsgAcc.AyL & 0xFF) / 32768*16;
            //   console.log(" _yy1     __"+test+"______ >"+num);
            //   console.log(" _yy2     __"+imuMsgAcc.AyH+"______ >"+imuMsgAcc.AyL);

            // }
    
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

        imuMsgAcc.AxL = 0;
        imuMsgAcc.AxH= 0;
        imuMsgAcc.AyL= 0;
        imuMsgAcc.AyH= 0;
        imuMsgAcc.AzL= 0;
        imuMsgAcc.AzH= 0;
        imuMsgAcc.TL= 0;
        imuMsgAcc.TH= 0;
        imuMsgAcc.SUM = 0;

        for (let i = 0; i < data.length; i++) {
          //if 0x55 is found unpack messages till next 0x55

          

          parseIMUAcc(data.readInt8(i))
          if (imuMsg.state == ImuState.IMU_COMMAND_RECEIVED) {
            //imuResponse$.next(imuMsgAngle)

            let T = (( imuMsgAcc.TH << 8 ) | imuMsgAcc.TL ) / 100;


            //console.log("data: ["+num+"] inputH: ["+imuMsgAcc.TH+"] inputL: ["+imuMsgAcc.TL+"] = output T ["+T+"]\n");

            var yx = parseFloat(""+Accax(imuMsgAcc.AxH, imuMsgAcc.AxL));
            var yy = parseFloat(""+Accax(imuMsgAcc.AyH, imuMsgAcc.AyL));
            var yz = parseFloat(""+Accax(imuMsgAcc.AzH, imuMsgAcc.AzL));

            let CHK = 85 + 81 + (imuMsgAcc.AxH + imuMsgAcc.AxL + imuMsgAcc.AyH + imuMsgAcc.AyL + imuMsgAcc.AzH + imuMsgAcc.AzL + imuMsgAcc.TH + imuMsgAcc.TL) & 0xFF;
            
            let CHKVAL = CHK & 0xFF;


            /* Accelerometer */
            // var a = new Number(33);
            // var test = (a).toString(2);
            // const v : any = (imuMsgAcc.AxH).toString(2);
            // const v2 : any = (imuMsgAcc.AxL).toString(2);

            //lpushAsync('logging', "data:"+imuMsgAcc.TL+", "+imuMsgAcc.TH+", :"+imuMsgAcc.SUM+" -- "+ T);

            if (CHK === imuMsgAcc.SUM)
            {         
              lpushAsync('dataAccx', "ts:"+new Date().getTime()+"^x:"+new Date().getTime()+"^y:"+yx)
              lpushAsync('dataAccy', "ts:"+new Date().getTime()+"^x:"+new Date().getTime()+"^y:"+yy)
              lpushAsync('dataAccz', "ts:"+new Date().getTime()+"^x:"+new Date().getTime()+"^y:"+yz)
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