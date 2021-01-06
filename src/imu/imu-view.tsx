import React from 'react'
import { ImuCmd } from '@/component/imu/imu-protocol'

const hexInt = (num, width) => num.toString(16).padStart(width,"0").toUpperCase();
const hexInt8 = num => hexInt(num & 0xFF, 2);

export const imuOutputFunctions = [];

const renderDefault = imuMsg => {
  return (
    <div>
      <div>{imuMsg.buffer.map(v => hexInt8(v))}</div>
    </div>
  )
}

const renderString = imuMsg => {
  return (
    <div>
      <div>{imuMsg.buffer.filter(n => n != 0).reduce((s, n) => s + String.fromCharCode(n),"")}</div>
    </div>
  )
}

Object.keys(ImuCmd).forEach(k => imuOutputFunctions[ImuCmd[k]] = renderDefault)

imuOutputFunctions[ImuCmd.IMU_IDENT] = renderString
