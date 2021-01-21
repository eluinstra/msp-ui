export enum ImuState {
    IMU_TIME = 80,
    IMU_ACCELERO = 81, //0x51,
    IMU_ANGULARVELOCITY = 82,
    IMU_ANGLE = 83,
    IMU_MAGN = 84,
    IMU_PREFIX = 85, //0x55,
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