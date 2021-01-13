import { Subject } from 'rxjs'

let messageStarted = false
var datasegmentcounter = 0

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


export interface IImuMsgTime {
  enable: boolean,
  YY: number,
  MM: number,
  DD: number,
  hh: number,
  mm: number,
  ss: number,
  msL: number,
  msH: number,
  SUM: number
}

const imuMsgTime: IImuMsgTime = {
  enable: false,
  YY: 0,
  MM: 0,
  DD: 0,
  hh: 0,
  mm: 0,
  ss: 0,
  msL: 0,
  msH: 0,
  SUM: 0
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

export interface IImuMsgAngle {
  enable: boolean,
  RollL: number,
  RollH: number,
  PitchL: number,
  PitchH: number,
  YawL: number,
  YawH: number,
  TL: number,
  TH: number,
  SUM: number
}

export const imuMsgAngle: IImuMsgAngle = {
  enable: false,
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

export default imuMsgAngle;

export const imuResponse$ = new Subject<IImuMsgAngle>();
export const registerPortIMU = (serialPort) => {
  serialPort?.value.on('data', function (data) {
    let counter = 0
    for (let i = 0; i < data.length; i++) {
      //if 0x55 is found unpack messages till next 0x55
      parseIMUAngle(data.readInt8(i))
      if (imuMsg.state == ImuState.IMU_COMMAND_RECEIVED) {
        imuResponse$.next(imuMsgAngle)
        imuMsg.state = ImuState.IMU_IDLE
      } else if (imuMsg.state == ImuState.IMU_ERROR_RECEIVED) {
        imuResponse$.error(new Error('MSP error received!'))
        imuMsg.state = ImuState.IMU_IDLE
      }
      counter++;
    }
  })
}

function parseIMUTime(num: number) {
  switch (num) {
    case ImuState.IMU_PREFIX:
      if (!messageStarted) {
        messageStarted = true
        imuMsgTime.enable = false
        //console.log(num + "\n");
      }
      break;
    case ImuState.IMU_TIME:
      messageStarted = false
      imuMsgTime.enable = true
      datasegmentcounter = 0;
      console.log("Time:\n");
      break;
  }
  datasegmentcounter++;
  if (imuMsgTime.enable) {
    switch (datasegmentcounter) {
      case 1: console.log(num + " identifier: [" + datasegmentcounter + "]\n"); break;
      case 2: imuMsgTime.YY = num; break;
      case 3: imuMsgTime.MM = num; break;
      case 4: imuMsgTime.DD = num; break;
      case 5: imuMsgTime.hh = num; break;
      case 6: imuMsgTime.mm = num; break;
      case 7: imuMsgTime.ss = num; break;
      case 8: imuMsgTime.msL = num; break;
      case 9: imuMsgTime.msH = num; break;
      case 10: imuMsgTime.SUM = num; break;
    }
    var ms: number = ((imuMsgTime.msH.valueOf() << 8) | imuMsgTime.msL.valueOf());
  }
}

function parseIMUData(num: number) {
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
  }
}

function parseIMUAngle(num: number) {
  switch (num) {
    case ImuState.IMU_PREFIX:
      if (!messageStarted) {
        messageStarted = true
        imuMsgAngle.enable = false
      }
      break;
    case ImuState.IMU_ANGLE:
      messageStarted = false
      imuMsgAngle.enable = true
      datasegmentcounter = 0;
      break;
  }
  datasegmentcounter++;
  if (imuMsgAngle.enable) {
    imuMsg.state = ImuState.IMU_IDLE;
    switch (datasegmentcounter) {
      case 1: break;
      case 2: imuMsgAngle.RollL = num; break;
      case 3: imuMsgAngle.RollH = num; break;
      case 4: imuMsgAngle.PitchL = num; break;
      case 5: imuMsgAngle.PitchH = num; break;
      case 6: imuMsgAngle.YawL = num; break;
      case 7: imuMsgAngle.YawH = num; break;
      case 8: imuMsgAngle.TL = num; break;
      case 9: imuMsgAngle.TH = num; break;
      case 10: imuMsgAngle.SUM = num; break;
    }
    imuMsg.state = ImuState.IMU_COMMAND_RECEIVED;
  }
}