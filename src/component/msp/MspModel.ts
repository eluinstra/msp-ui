import { MspCmd } from '@/component/msp/MspProtocol'
import { MspMsg } from '@/component/msp//MspDriver';

const hexInt = (num: number, width: number) => num.toString(16).padStart(width,"0").toUpperCase();
const hexInt8 = (num: number) => hexInt(num & 0xFF, 2);

export const parseMspMsg = (msg: MspMsg) => {
  return mspOutputParser[msg.cmd](msg)
}

const mspOutputParser = [];

const parseDefault = (msg: MspMsg) => {
  return msg.buffer.map(v => hexInt8(v))
}

const parseString = (msg: MspMsg) => {
  return msg.buffer.filter(n => n != 0).reduce((s, n) => s + String.fromCharCode(n),"")
}

Object.values(MspCmd).forEach(v => mspOutputParser[v] = parseDefault)

mspOutputParser[MspCmd.MSP_API_VERSION] = (msg: MspMsg) => {
  return {
    protocolVersion: msg.buffer[0].toString(),
    apiVersion: msg.buffer[1].toString() + "." + msg.buffer[2].toString()
  }
}

mspOutputParser[MspCmd.MSP_FC_VARIANT] = parseString

