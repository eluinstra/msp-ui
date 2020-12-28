import { fromEvent, Subject } from 'rxjs'
import { mspCmdHeader } from '@/component/msp/msp-protocol';
import { serialPort } from '../serialport/serialport-driver';

export enum MspState {
  MSP_IDLE,
  MSP_HEADER_START,
  MSP_HEADER_X,
  MSP_HEADER_V2_NATIVE,
  MSP_PAYLOAD_V2_NATIVE,
  MSP_CHECKSUM_V2_NATIVE,
  MSP_COMMAND_RECEIVED,
  MSP_ERROR_RECEIVED
}

export interface MspMsg {
  state: MspState,
  flag: number,
  cmd: number,
  length: number,
  buffer: number[],
  checksum: number
}

const mspMsg : MspMsg = {
  state: MspState.MSP_IDLE,
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

function command(cmd, payload) {
  const flag = 0
  const content = [].concat([flag],hexInt16(cmd),hexInt16(payload.size),payload)
  return [].concat(mspCmdHeader.split("").map(ch => ch.charCodeAt(0)),content,[checksum(content)])
}

export const mspRequest = (cmd, payload) => {
  serialPort?.value.write(Buffer.from(command(cmd, payload)))
}

export const mspResponse$ = new Subject<MspMsg>();
export const registerPort = () => {
  serialPort?.value.on('data', function (data) {
    for (let i = 0; i < data.length; i++) {
      parseMSPCommand(data.readInt8(i))
      if (mspMsg.state == MspState.MSP_COMMAND_RECEIVED) {
        mspResponse$.next(mspMsg)
        mspMsg.state = MspState.MSP_IDLE
      } else if (mspMsg.state == MspState.MSP_ERROR_RECEIVED) {
        mspResponse$.error(new Error('MSP error received!'))
        mspMsg.state = MspState.MSP_IDLE
      }
    }
  })
}

function parseMSPCommand(num) {
  //console.log(num & 0xFF)
  //console.log(hexInt8(num & 0xFF))
  switch (mspMsg.state) {
    case MspState.MSP_IDLE:
      if (String.fromCharCode(num) == '$')
        mspMsg.state = MspState.MSP_HEADER_START
      break
    case MspState.MSP_HEADER_START:
      mspMsg.buffer = []
      mspMsg.checksum = 0
      if (String.fromCharCode(num) == 'X')
        mspMsg.state = MspState.MSP_HEADER_X
      break
    case MspState.MSP_HEADER_X:
      if (String.fromCharCode(num) == '>')
        mspMsg.state = MspState.MSP_HEADER_V2_NATIVE
      else if (String.fromCharCode(num) == '!')
        mspMsg.state = MspState.MSP_ERROR_RECEIVED
      break
    case MspState.MSP_HEADER_V2_NATIVE:
      mspMsg.buffer.push(num & 0xFF)
      mspMsg.checksum = crc8_dvb_s2(mspMsg.checksum, num)
      if (mspMsg.buffer.length == 5) {
        mspMsg.flag = getFlag(mspMsg.buffer)
        mspMsg.cmd = getCmd(mspMsg.buffer)
        mspMsg.length = getLength(mspMsg.buffer)
        mspMsg.buffer = []
        if (mspMsg.length > 0)
          mspMsg.state = MspState.MSP_PAYLOAD_V2_NATIVE
        else
          mspMsg.state = MspState.MSP_CHECKSUM_V2_NATIVE
      }
      break
    case MspState.MSP_PAYLOAD_V2_NATIVE:
      mspMsg.buffer.push(num & 0xFF)
      mspMsg.checksum = crc8_dvb_s2(mspMsg.checksum, num)
      mspMsg.length--
      if (mspMsg.length == 0)
        mspMsg.state = MspState.MSP_CHECKSUM_V2_NATIVE
      break
    case MspState.MSP_CHECKSUM_V2_NATIVE:
      if (mspMsg.checksum == (num & 0xFF))
        mspMsg.state = MspState.MSP_COMMAND_RECEIVED
      else
        mspMsg.state = MspState.MSP_IDLE
      break
    case MspState.MSP_ERROR_RECEIVED:
      mspMsg.state = MspState.MSP_IDLE
      break
    default:
      mspMsg.state = MspState.MSP_IDLE
      break
  }
  //console.log("state " + mspMsg.state)
}
