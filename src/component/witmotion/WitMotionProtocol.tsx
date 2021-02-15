export const imuTimeMs = (h: number, l: number) => ((h.valueOf() << 8) | l.valueOf() & 0xFF)
export const imuAccelero = (h: number, l: number) => {
  var hVal = (h.valueOf() >127) ? (h.valueOf()-256) : h.valueOf();
  var lVal = (l.valueOf() & 0xFF);
  return ((hVal << 8) | lVal) / 32768.0 * 16.0;
}
export const imuAngularVelocity = (h: number, l: number) => {
  var hVal = (h.valueOf() > 127) ? (h.valueOf()-256) : h.valueOf();
  var lVal = (l.valueOf() & 0xFF);
  return ((hVal << 8) | lVal) / 32768.0 * 2000.0;
}
export const imuAngle = (h: number, l: number) => {
  var hVal = (h.valueOf() > 0x7F) ? (h.valueOf()-0x100) : h.valueOf();
  var lVal = (l.valueOf() & 0xFF);
  return ((hVal << 8) | lVal) / 32768.0 * 180.0;
}
export const imuMagnetic = (h: number, l: number) => {
  var hVal = (h.valueOf() > 0x7F) ? (h.valueOf()-0x100) : h.valueOf();
  var lVal = (l.valueOf() & 0xFF);
  return ((hVal << 8) | lVal) / 100;
}

export enum ImuState {
    IMU_TIME = 80,
    IMU_ACCELERO = 81, //0x51,
    IMU_ANGULARVELOCITY = 82,
    IMU_ANGLE = 83,
    IMU_MAGNETIC = 84,
    IMU_PREFIX = 85, //0x55,
    IMU_ACCELERO_RECEIVED = 93,
    IMU_ANGULARVELOCITY_RECEIVED = 94,
    IMU_ANGLE_RECEIVED = 95,
    IMU_MAGNETIC_RECEIVED = 96,
    IMU_COMMAND_RECEIVED = 97,
    IMU_COMMAND_IDLE = 98,
    IMU_ERROR_RECEIVED = 99,
    IMU_IDLE = 0x00,
    IMU_DATA_PROCESSING = 100
  }

export interface ImuMsg {
    state: ImuState,
    flag: number,
    cmd: number,
    length: number,
    buffer: number[],
    checksum: number
  }

export interface IWitmotionTime {
    enable: boolean,
    dscnt: number,
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

export interface IWitmotionAccelerometer {
    enable: boolean,
    dscnt: number,
    SBYTE: number,
    CMD: number,
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

  export interface IWitmotionAngularVelocity {
    enable: boolean,
    dscnt: number,
    SBYTE: number,
    CMD: number,
    wxL: number,
    wxH: number,
    wyL: number,
    wyH: number,
    wzL: number,
    wzH: number,
    TL: number,
    TH: number,
    SUM: number
  }

  export interface IWitmotionAngle {
    enable: boolean,
    dscnt: number,
    SBYTE: number,
    CMD: number,
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

  export interface IWitmotionMagnetic {
    enable: boolean,
    dscnt: number,
    SBYTE: number,
    CMD: number,
    HxL: number,
    HxH: number,
    HyL: number,
    HyH: number,
    HzL: number,
    HzH: number,
    TL: number,
    TH: number,
    SUM: number
  }