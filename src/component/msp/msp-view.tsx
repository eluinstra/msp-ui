import React from 'react'
import { MspCmd } from '@/component/msp/msp-protocol'

const hexInt = (num, width) => num.toString(16).padStart(width,"0").toUpperCase();
const hexInt8 = num => hexInt(num & 0xFF, 2);

export const mspOutputFunctions = [];

const renderDefault = mspMsg => {
  return (
    <div>
      <div>{mspMsg.buffer.map(v => hexInt8(v))}</div>
    </div>
  )
}

const renderString = mspMsg => {
  return (
    <div>
      <div>{mspMsg.buffer.filter(n => n != 0).reduce((s, n) => s + String.fromCharCode(n),"")}</div>
    </div>
  )
}

Object.keys(MspCmd).forEach(k => mspOutputFunctions[MspCmd[k]] = renderDefault)

mspOutputFunctions[MspCmd.MSP_FC_VARIANT] = renderString
