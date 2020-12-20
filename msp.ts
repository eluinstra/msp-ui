import { remote } from 'electron'
const SerialPort = remote.require('serialport')
import { mspCMDHeader } from './protocol';

export const mspState = {
  MSP_IDLE: 0,
  MSP_HEADER_START: 1,
  MSP_HEADER_X: 2,
  MSP_HEADER_V2_NATIVE: 3,
  MSP_PAYLOAD_V2_NATIVE: 4,
  MSP_CHECKSUM_V2_NATIVE: 5,
  MSP_COMMAND_RECEIVED: 6,
  MSP_ERROR_RECEIVED: 7
}

export const mspMsg = {
  state: mspState.MSP_IDLE,
  flag: 0,
  cmd: 0,
  length: 0,
  buffer: [],
  checksum: 0
}

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

export const serialPort = new SerialPort('/dev/ttyUSB0', { baudRate: 115200 })

export function command(cmd, payload) {
  const flag = 0
  const content = [].concat([flag],hexInt16(cmd),hexInt16(payload.size),payload)
  return [].concat(mspCMDHeader.split("").map(ch => ch.charCodeAt(0)),content,[checksum(content)])
}

export function parseMSPCommand(num) {
  //console.log(num & 0xFF)
  //console.log(hexInt8(num & 0xFF))
  switch (mspMsg.state) {
    case mspState.MSP_IDLE:
      if (String.fromCharCode(num) == '$')
        mspMsg.state = mspState.MSP_HEADER_START
      break
    case mspState.MSP_HEADER_START:
      mspMsg.buffer = []
      mspMsg.checksum = 0
      if (String.fromCharCode(num) == 'X')
        mspMsg.state = mspState.MSP_HEADER_X
      break
    case mspState.MSP_HEADER_X:
      if (String.fromCharCode(num) == '>')
        mspMsg.state = mspState.MSP_HEADER_V2_NATIVE
      else if (String.fromCharCode(num) == '!')
        mspMsg.state = mspState.MSP_ERROR_RECEIVED
      break
    case mspState.MSP_HEADER_V2_NATIVE:
      mspMsg.buffer.push(num & 0xFF)
      mspMsg.checksum = crc8_dvb_s2(mspMsg.checksum, num)
      if (mspMsg.buffer.length == 5) {
        mspMsg.flag = getFlag(mspMsg.buffer)
        mspMsg.cmd = getCmd(mspMsg.buffer)
        mspMsg.length = getLength(mspMsg.buffer)
        mspMsg.buffer = []
        if (mspMsg.length > 0)
          mspMsg.state = mspState.MSP_PAYLOAD_V2_NATIVE
        else
          mspMsg.state = mspState.MSP_CHECKSUM_V2_NATIVE
      }
      break
    case mspState.MSP_PAYLOAD_V2_NATIVE:
      mspMsg.buffer.push(num & 0xFF)
      mspMsg.checksum = crc8_dvb_s2(mspMsg.checksum, num)
      mspMsg.length--
      if (mspMsg.length == 0)
        mspMsg.state = mspState.MSP_CHECKSUM_V2_NATIVE
      break
    case mspState.MSP_CHECKSUM_V2_NATIVE:
      if (mspMsg.checksum == (num & 0xFF))
        mspMsg.state = mspState.MSP_COMMAND_RECEIVED
      else
        mspMsg.state = mspState.MSP_IDLE
      break
    case mspState.MSP_ERROR_RECEIVED:
      mspMsg.state = mspState.MSP_IDLE
      break
    default:
      mspMsg.state = mspState.MSP_IDLE
      break
  }
  //console.log("state " + mspMsg.state)
}
