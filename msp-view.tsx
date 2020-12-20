import React from 'react'
import { MspCmd } from './msp-protocol'

const hexInt = (num, width) => num.toString(16).padStart(width,"0").toUpperCase();
const hexInt8 = num => hexInt(num & 0xFF,2);

export const mspOutputFunctions = [];

const renderDefault = (mspMsg) => {
  return <div>
    <div>{mspMsg.buffer.map(v => hexInt8(v))}</div>
    </div>
}

Object.keys(MspCmd).forEach(k => mspOutputFunctions[MspCmd[k]] = renderDefault)

mspOutputFunctions[MspCmd.MSP_FC_VARIANT] = mspMsg => {
  return <div>
    <div>{mspMsg.buffer.reduce((s, v) => s + String.fromCharCode(v),"")}</div>
    </div>
}
