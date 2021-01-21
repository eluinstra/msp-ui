import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { Line } from 'react-chartjs-2'
import { BehaviorSubject, interval } from 'rxjs'
import { map, sample } from 'rxjs/operators'
import { props } from "rambda";
import { CChartContainerRedis } from '@/component/charts/ChartContainerRedis'
import { ImuState, ImuMsg, IWitmotionAccelerometer, IWitmotionAngularVelocity, IWitmotionAngle, IWitmotionMagnetic } from '@/component/witmotion/WitMotionProtocol'
import { Button } from '@material-ui/core'
import Typography from "@material-ui/core/Typography";
import { lpushAsync, lrangeAsync, flushallAsync } from '@/services/dbcapturing'
import SerialPort from "serialport";
import { ContentSort } from "material-ui/svg-icons";

type Props = {
  serialPort1: any;
  serialPort2: any;
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

const imuTimeMs = (h: number, l: number) => ((h.valueOf() << 8) | l.valueOf())
const imuAccelero = (h: number, l: number) => ((h.valueOf() << 8) | l.valueOf() & 0xFF) / 32768 * 16;
const imuAngularVelocity = (h: number, l: number) => ((h.valueOf() << 8) | l.valueOf()) / 32768 * 2000;
const imuAngle = (h: number, l: number) => ((h.valueOf() << 8) | l.valueOf()) / 32768 * 180;
const imuMagnetic = (h: number, l: number) => ((h.valueOf() << 8) | l.valueOf() & 0xFF) / 100;

/* public interface - convention place on top */
const imuMsg: ImuMsg = {
  state: ImuState.IMU_IDLE,
  flag: 0,
  cmd: 0,
  length: 0,
  buffer: [],
  checksum: 0
}

const iWitmotionAccelerometer: IWitmotionAccelerometer = {
  enable: false,
  dscnt: 0,
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

const iWitmotionAngularVelocity: IWitmotionAngularVelocity = {
  enable: false,
  dscnt: 0,
  wxL: 0,
  wxH: 0,
  wyL: 0,
  wyH: 0,
  wzL: 0,
  wzH: 0,
  TL: 0,
  TH: 0,
  SUM: 0
}

const iWitmotionAngle: IWitmotionAngle = {
  enable: false,
  dscnt: 0,
  RollL: 0,
  RollH: 0,
  PitchL: 0,
  PitchH: 0,
  YawL: 0,
  YawH: 0,
  TL: 0,
  TH: 0,
  SUM: 0
}

const iWitmotionMagnetic: IWitmotionMagnetic = {
  enable: false,
  dscnt: 0,
  HxL: 0,
  HxH: 0,
  HyL: 0,
  HyH: 0,
  HzL: 0,
  HzH: 0,
  TL: 0,
  TH: 0,
  SUM: 0
}


function parseIncommingString(num: number) {

  /* Example converting to hex values */
  // let sprefix = parseInt("85", 10).toString(16);
  // let ssid = parseInt("81", 10).toString(16);
  // let saxH = parseInt("" + imuMsgAcc.AxH, 10).toString(16);
  // let saxL = parseInt("" + imuMsgAcc.AxL, 10).toString(16);
  // let sayH = parseInt("" + imuMsgAcc.AyH, 10).toString(16);
  // let sayL = parseInt("" + imuMsgAcc.AyL, 10).toString(16);
  // let sazH = parseInt("" + imuMsgAcc.AzH, 10).toString(16);
  // let sazL = parseInt("" + imuMsgAcc.AzL, 10).toString(16);
  // let sth = parseInt("" + imuMsgAcc.TH, 10).toString(16);
  // let stl = parseInt("" + imuMsgAcc.TL, 10).toString(16);
  // let ssum = parseInt("" + imuMsgAcc.SUM, 10).toString(16);
  // let T = ((imuMsgAcc.TH << 8) | imuMsgAcc.TL) / 100;

  switch (parseState) {
    case 0:
      if (num == ImuState.IMU_PREFIX)
        imuMsg.state = ImuState.IMU_IDLE;
      parseState = 1
      break;
    case 1:
      if ([ImuState.IMU_TIME, ImuState.IMU_ACCELERO, ImuState.IMU_ANGLE, ImuState.IMU_ANGULARVELOCITY, ImuState.IMU_MAGNETIC].includes(num)) {
        cmd = num
        parseState = 2
        datasegmentcounter = 0
      }
      else
        parseState = 0
      break;
    case 2:
      //lpushAsync('berichten', datasegmentcounter+" } [ " + saxH + " " + saxL + " " + sayH + " -- " + T + " ]");

      datasegmentcounter++;

      if (cmd == ImuState.IMU_ACCELERO) {
        iWitmotionAccelerometer.dscnt = datasegmentcounter;
        switch (datasegmentcounter) {
          case 1: iWitmotionAccelerometer.AxL = num; break;
          case 2: iWitmotionAccelerometer.AxH = num; break;
          case 3: iWitmotionAccelerometer.AyL = num; break;
          case 4: iWitmotionAccelerometer.AxH = num; break;
          case 5: iWitmotionAccelerometer.AzL = num; break;
          case 6: iWitmotionAccelerometer.AzH = num; break;
          case 7: iWitmotionAccelerometer.TL = num; break;
          case 8: iWitmotionAccelerometer.TH = num; break;
          case 9: iWitmotionAccelerometer.SUM = num; break;
        }
        if (datasegmentcounter == 9) {
          imuMsg.state = ImuState.IMU_COMMAND_RECEIVED;
        }
      }

      if (cmd == ImuState.IMU_ANGULARVELOCITY) {
        iWitmotionAngularVelocity.dscnt = datasegmentcounter;
        switch (datasegmentcounter) {
          case 1: iWitmotionAngularVelocity.wxL = num; break;
          case 2: iWitmotionAngularVelocity.wxH = num; break;
          case 3: iWitmotionAngularVelocity.wyL = num; break;
          case 4: iWitmotionAngularVelocity.wyH = num; break;
          case 5: iWitmotionAngularVelocity.wzL = num; break;
          case 6: iWitmotionAngularVelocity.wzH = num; break;
          case 7: iWitmotionAngularVelocity.TL = num; break;
          case 8: iWitmotionAngularVelocity.TH = num; break;
          case 9: iWitmotionAngularVelocity.SUM = num; break;
        }
        if (datasegmentcounter == 9) {
          imuMsg.state = ImuState.IMU_COMMAND_RECEIVED;
        }
      }

      if (cmd == ImuState.IMU_ANGLE) {
        iWitmotionAngle.dscnt = datasegmentcounter;
        switch (datasegmentcounter) {
          case 1: iWitmotionAngle.RollL = num; break;
          case 2: iWitmotionAngle.RollH = num; break;
          case 3: iWitmotionAngle.PitchL = num; break;
          case 4: iWitmotionAngle.PitchH = num; break;
          case 5: iWitmotionAngle.YawL = num; break;
          case 6: iWitmotionAngle.YawH = num; break;
          case 7: iWitmotionAngle.TL = num; break;
          case 8: iWitmotionAngle.TH = num; break;
          case 9: iWitmotionAngle.SUM = num; break;
        }
        if (datasegmentcounter == 9) {
          imuMsg.state = ImuState.IMU_COMMAND_RECEIVED;
        }
      }

      if (cmd == ImuState.IMU_MAGNETIC) {
        iWitmotionMagnetic.dscnt = datasegmentcounter;
        switch (datasegmentcounter) {
          case 1: iWitmotionMagnetic.HxL = num; break;
          case 2: iWitmotionMagnetic.HxH = num; break;
          case 3: iWitmotionMagnetic.HyL = num; break;
          case 4: iWitmotionMagnetic.HyH = num; break;
          case 5: iWitmotionMagnetic.HzL = num; break;
          case 6: iWitmotionMagnetic.HzH = num; break;
          case 7: iWitmotionMagnetic.TL = num; break;
          case 8: iWitmotionMagnetic.TH = num; break;
          case 9: iWitmotionMagnetic.SUM = num; break;
        }
        if (datasegmentcounter == 9) {
          imuMsg.state = ImuState.IMU_COMMAND_RECEIVED;
        }
      }

      if (datasegmentcounter == 9) {
        parseState = 0
        datasegmentcounter = 0
      }
      break;

  }
}

/* @TODO: Dit moet nog verplaatst worden */

class WitMotionDriver extends Component<Props, State> {

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
    this.props.serialPort1?.value.on('data', function (data) {
      console.log("Hier!!");
      if (isCollecting) {

        for (let i = 0; i < data.length; i++) {
          //if 0x55 is found unpack messages till next 0x55

          parseIncommingString(data.readInt8(i))
          if (imuMsg.state == ImuState.IMU_COMMAND_RECEIVED) {

            //imuResponse$.next(imuMsgAngle) --> This was to place it back in the Subject for the chart

            let T = ((iWitmotionAccelerometer.TH << 8) | iWitmotionAccelerometer.TL & 0xFF) / 100;

            //console.log("data: ["+num+"] inputH: ["+imuMsgAcc.TH+"] inputL: ["+imuMsgAcc.TL+"] = output T ["+T+"]\n");

            let resolutie = 100;

            let yx = imuAccelero(iWitmotionAccelerometer.AxH, iWitmotionAccelerometer.AxL);
            let yy = imuAccelero(iWitmotionAccelerometer.AyH, iWitmotionAccelerometer.AyL);
            let yz = imuAccelero(iWitmotionAccelerometer.AzH, iWitmotionAccelerometer.AzL);

            let CHK = 85 + 81 + (iWitmotionAccelerometer.AxH + iWitmotionAccelerometer.AxL +
                                 iWitmotionAccelerometer.AyH + iWitmotionAccelerometer.AyL +
                                 iWitmotionAccelerometer.AzH + iWitmotionAccelerometer.AzL +
                                 iWitmotionAccelerometer.TH + iWitmotionAccelerometer.TL);

            let CHKVAL = CHK & 0xFF;

            /* Redis calls */

            lpushAsync('dataAccx', "ts:" + new Date().getTime() + "^x:" + new Date().getTime() + "^y:" + yx)
            lpushAsync('dataAccx', "ts:" + new Date().getTime() + "^x:" + new Date().getTime() + "^y:" + yy)
            lpushAsync('dataAccx', "ts:" + new Date().getTime() + "^x:" + new Date().getTime() + "^y:" + yz)

            lpushAsync('dataTemp', "ts:" + new Date().getTime() + "^Tx:" + T);

            imuMsg.state = ImuState.IMU_IDLE

          } else if (imuMsg.state == ImuState.IMU_ERROR_RECEIVED) {
            //imuResponse$.error(new Error('MSP error received!'))
            imuMsg.state = ImuState.IMU_IDLE
          }
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

export const UseWitMotionDriver = (props) => {
  const { serialPort1, serialPort2 } = props
  return (
    <React.Fragment>
      <h2>Chart from Redis</h2>
      <WitMotionDriver serialPort1={serialPort1} serialPort2={serialPort2} />

      <CChartContainerRedis />

    </React.Fragment>
  )
}