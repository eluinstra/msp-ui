import { Subject } from 'rxjs'
import { lpushAsync, lrangeAsync } from '@/services/dbcapturing'
import { ImuState, ImuMsg, IWitmotionAccelerometer, IWitmotionAngularVelocity, IWitmotionAngle, IWitmotionMagnetic,
  imuTimeMs, imuAccelero, imuAngularVelocity, imuAngle, imuMagnetic } from '@/component/witmotion/WitMotionProtocol'

let messageStarted = false
let isCollecting = false
let datasegmentcounter = 0
let parseState = 0
let cmd = undefined

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

const imuMsg: ImuMsg = {
  state: ImuState.IMU_IDLE,
  flag: 0,
  cmd: 0,
  length: 0,
  buffer: [],
  checksum: 0
}

export default iWitmotionAccelerometer;

export const imuResponseRTChart2$ = new Subject<IWitmotionAccelerometer>();
export const registerPortRTChart2 = (id, serialPort) => {
  console.log("serialPort: "+serialPort.value?.path);
  console.log("ID: "+id);
  serialPort?.on('data', function (data) {
    let counter = 0
    for (let i = 0; i < data.length; i++) {
      //if 0x55 is found unpack messages till next 0x55
      parseIMUAcc(data.readInt8(i))
      if (imuMsg.state == ImuState.IMU_COMMAND_RECEIVED) {
        imuResponseRTChart2$.next(iWitmotionAccelerometer)
        imuMsg.state = ImuState.IMU_IDLE
      } else if (imuMsg.state == ImuState.IMU_ERROR_RECEIVED) {
        imuResponseRTChart2$.error(new Error('MSP error received!'))
        imuMsg.state = ImuState.IMU_IDLE
      }
      counter++;
    }
  })
}
export const unregisterPortRTChart2 = (id, serialPort) => {
  serialPort?.value.on('data', function (data) {
  })
}

function parseIMUAcc(num: number) {

  switch (parseState) {
    case 0:
      if (num == ImuState.IMU_PREFIX)
        imuMsg.state = ImuState.IMU_IDLE;
        parseState = 1
      break;
    case 1:
      if ([ImuState.IMU_TIME, ImuState.IMU_ACCELERO, ImuState.IMU_ANGULARVELOCITY, ImuState.IMU_ANGLE, ImuState.IMU_MAGNETIC].includes(num)) {
        cmd = num
        parseState = 2
        datasegmentcounter = 0
      }
      else
        parseState = 0
      break;
    case 2:
    
      datasegmentcounter++;
      
      if (cmd == ImuState.IMU_ACCELERO) {
        iWitmotionAccelerometer.dscnt = datasegmentcounter;
        switch (datasegmentcounter) {
          case 1: iWitmotionAccelerometer.AxL = num; break;
          case 2: iWitmotionAccelerometer.AxH = num; break;
          case 3: iWitmotionAccelerometer.AyL = num; break;
          case 4: iWitmotionAccelerometer.AyH = num; break;
          case 5: iWitmotionAccelerometer.AzL = num; break;
          case 6: iWitmotionAccelerometer.AzH = num; break;
          case 7: iWitmotionAccelerometer.TL = num; break;
          case 8: iWitmotionAccelerometer.TH = num; break;
          case 9: iWitmotionAccelerometer.SUM = num; break;
        }
        if (datasegmentcounter == 9)
        {
          imuMsg.state = ImuState.IMU_COMMAND_RECEIVED;
        }
      }

      if (datasegmentcounter == 9)
      {
        parseState = 0
        datasegmentcounter = 0
      }
      break;
      
  }
}

// function parseIMUAcc(num: number) {
//   switch (num) {
//     case ImuState.IMU_PREFIX:
//       if (!messageStarted) {
//         messageStarted = true
//         imuMsgAcc.enable = false
//       }
//       break;
//     case ImuState.IMU_ACC:
//       messageStarted = false
//       imuMsgAcc.enable = true
//       datasegmentcounter = 0;
//       break;
//   }
//   datasegmentcounter++;
//   if (imuMsgAcc.enable) {
//     imuMsg.state = ImuState.IMU_IDLE;
//     switch (datasegmentcounter) {
//       case 1: break;
//       case 2: imuMsgAcc.AxL = num; break;
//       case 3: imuMsgAcc.AxH = num; break;
//       case 4: imuMsgAcc.AyL = num; break;
//       case 5: imuMsgAcc.AyH = num; break;
//       case 6: imuMsgAcc.AzL = num; break;
//       case 7: imuMsgAcc.AzH = num; break;
//       case 8: imuMsgAcc.TL = num; break;
//       case 9: imuMsgAcc.TH = num; break;
//       case 10: imuMsgAcc.SUM = num; break;
//     }
//     imuMsg.state = ImuState.IMU_COMMAND_RECEIVED;
//   }
// }

// function parseIMUAngle(num: number) {
//   switch (num) {
//     case ImuState.IMU_PREFIX:
//       if (!messageStarted) {
//         messageStarted = true
//         imuMsgAngle.enable = false
//       }
//       break;
//     case ImuState.IMU_ANGLE:
//       messageStarted = false
//       imuMsgAngle.enable = true
//       datasegmentcounter = 0;
//       break;
//   }
//   datasegmentcounter++;
//   if (imuMsgAngle.enable) {
//     imuMsg.state = ImuState.IMU_IDLE;
//     switch (datasegmentcounter) {
//       case 1: break;
//       case 2: imuMsgAngle.RollL = num; break;
//       case 3: imuMsgAngle.RollH = num; break;
//       case 4: imuMsgAngle.PitchL = num; break;
//       case 5: imuMsgAngle.PitchH = num; break;
//       case 6: imuMsgAngle.YawL = num; break;
//       case 7: imuMsgAngle.YawH = num; break;
//       case 8: imuMsgAngle.TL = num; break;
//       case 9: imuMsgAngle.TH = num; break;
//       case 10: imuMsgAngle.SUM = num; break;
//     }
//     imuMsg.state = ImuState.IMU_COMMAND_RECEIVED;
//   }
// }