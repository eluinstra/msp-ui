import { fromEvent, Subject } from 'rxjs'
import { imuCmdHeader } from '@/component/imu/imu-protocol';
import { serialPort } from '../serialport/serialport-driver';

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

const imuMsg : ImuMsg = {
  state: ImuState.IMU_IDLE,
  flag: 0,
  cmd: 0,
  length: 0,
  buffer: [],
  checksum: 0
}


export interface IImuMsgTime {
  enable: boolean,
  YY: Number,
  MM: Number,
  DD: Number,
  hh: Number,
  mm: Number,
  ss: Number,
  msL: Number,
  msH: Number,
  SUM: Number
}

const imuMsgTime : IImuMsgTime = {
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
  AxL: Number,
  AxH: Number,
  AyL: Number,
  AyH: Number,
  AzL: Number,
  AzH: Number,
  TL: Number,
  TH: Number,
  SUM: Number
}

const imuMsgAcc : IImuMsgAcc = {
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

//export default imuMsgAcc;

export interface IImuMsgAngle {
  enable: boolean,
  RollL: Number,
  RollH: Number,
  PitchL: Number,
  PitchH: Number,
  YawL: Number,
  YawH: Number,
  TL: Number,
  TH: Number,
  SUM: Number
}

export const imuMsgAngle : IImuMsgAngle = {
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

const hexInt8 = data => [data & 0x00FF]

const hexInt16 = data => [data & 0x00FF, data & 0xFF00]

const getFlag = data => data[0]
 
const getCmd = data => (data[2] << 8) + data[1]

const getLength = data => (data[4] << 8) + data[3]

const checksum = bytes => bytes.reduce((crc, b) => crc8_dvb_s2(crc, b), 0)

function crc8_dvb_s2(crc, num) {
  crc = (crc ^ num) & 0xFF
  for (let i = 0; i < 8; i++)
    if ((crc & 0x80) != 0)
      crc = ((crc << 1) ^ 0xD5) & 0xFF
    else
      crc = (crc << 1) & 0xFF
  return crc
}

function command(cmd, payload) {
  const flag = 0
  const content = [].concat([flag],hexInt16(cmd),hexInt16(payload.size),payload)
  return [].concat(imuCmdHeader.split("").map(ch => ch.charCodeAt(0)),content,[checksum(content)])
}

export const imuRequest = (cmd, payload) => {
  serialPort?.value.write(Buffer.from(command(cmd, payload)))
}

export const imuResponse$ = new Subject<IImuMsgAngle>();
export const registerPortIMU = () => {
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

function parseIMUTime(num: Number) {
  switch (num) {
    case ImuState.IMU_PREFIX:
      if (!messageStarted)
        {
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
  //console.log(imuMsgAcc.enable + "]\n");
  datasegmentcounter++;
  if (imuMsgTime.enable)
     {
       switch(datasegmentcounter)
       {
          case 1: console.log(num + " identifier: [" + datasegmentcounter + "]\n");break;
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
       var ms:number = ((imuMsgTime.msH.valueOf() << 8)|imuMsgTime.msL.valueOf());
       //console.log("YY:" + imuMsgTime.YY + "\n");
       //console.log("MM:" + imuMsgTime.MM + "\n");
       //console.log("DD:" + imuMsgTime.DD + "\n");
       //console.log("ms:" + ms + "\n");
  
     }

}

function parseIMUData(num: Number) {
  switch (num) {
    case ImuState.IMU_PREFIX:
      if (!messageStarted)
        {
          messageStarted = true
          imuMsgAcc.enable = false
          //console.log(num + "\n");
        }
      break;
    case ImuState.IMU_ACC:
      messageStarted = false
      imuMsgAcc.enable = true
      datasegmentcounter = 0;
      //console.log("Accelero:\n");
      break;
  }
  //console.log(imuMsgAcc.enable + "]\n");
  datasegmentcounter++;
  if (imuMsgAcc.enable)
     {
       
       switch(datasegmentcounter)
       {
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
       var ax:number = ((imuMsgAcc.AxH.valueOf() << 8)|imuMsgAcc.AxL.valueOf())/32768*16*9.8;
       var ay:number = ((imuMsgAcc.AyH.valueOf() << 8)|imuMsgAcc.AyL.valueOf())/32768*16*9.8;
       var az:number = ((imuMsgAcc.AzH.valueOf() << 8)|imuMsgAcc.AzL.valueOf())/32768*16*9.8;
       
       //console.log("aX:" + ax + "\n");
       //console.log("aY:" + ax + "\n");
       //console.log("aZ:" + ax + "\n");
  
     }

}

function parseIMUAngle(num: Number) {
  switch (num) {
    case ImuState.IMU_PREFIX:
      if (!messageStarted)
        {
          messageStarted = true
          imuMsgAngle.enable = false
          //console.log(num + "\n");
        }
      break;
    case ImuState.IMU_ANGLE:
      messageStarted = false
      imuMsgAngle.enable = true
      datasegmentcounter = 0;
      //console.log("imuMsgAngle:\n");
      break;
  }
  //console.log(imuMsgAcc.enable + "]\n");
  datasegmentcounter++;
  if (imuMsgAngle.enable)
     {
       imuMsg.state = ImuState.IMU_IDLE;
       switch(datasegmentcounter)
       {
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
       var roll:number = ((imuMsgAngle.RollH.valueOf() << 8)|imuMsgAngle.RollL.valueOf())/32768*180;
       var pitch:number = ((imuMsgAngle.PitchH.valueOf() << 8)|imuMsgAngle.PitchL.valueOf())/32768*180;
       var yaw:number = ((imuMsgAngle.YawH.valueOf() << 8)|imuMsgAngle.YawL.valueOf())/32768*180;
       imuMsg.state = ImuState.IMU_COMMAND_RECEIVED;
       //console.log("roll:" + roll + "\n");
       //console.log("pitch:" + pitch + "\n");
       //console.log("yaw:" + yaw + "\n");
  
     }

}