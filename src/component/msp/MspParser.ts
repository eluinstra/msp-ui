import { Subject } from "rxjs"

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

export interface MspMsgState {
  state: MspState,
  flag: number,
  cmd: number,
  length: number,
  buffer: number[],
  checksum: number
}

export const createMspMsgState = () : MspMsgState => {
  return {
    state: MspState.MSP_IDLE,
    flag: 0,
    cmd: 0,
    length: 0,
    buffer: [],
    checksum: 0
  }
}

export interface MspMsg {
  cmd: number,
  buffer: number[]
}

const parseCmd = (b: number[]) => {
  return {
    flag: b[0],
    cmd: b[1] + (b[2] << 8),
    length: b[3] + (b[4] << 8)
  }
}

export const toInt16LE = (s: string) => {
  // const buffer = [0, 0]
  // const n = parseInt(s)
  // buffer[0] = n % 256
  // buffer[1] = Math.floor(n / 256)
  // return buffer
  // const buffer = Buffer.alloc(2)
  // const n = parseInt(s)
  // buffer.writeInt16LE(n)
  // return [...buffer]
  const n = parseInt(s)
  return [n & 0x00FF, (n & 0xFF00) >> 8]
}

export const checksum = bytes => bytes.reduce((crc, b) => crc8_dvb_s2(crc, b), 0)

const crc8_dvb_s2 = (crc, num) => {
  crc = (crc ^ num) & 0xFF
  for (let i = 0; i < 8; i++)
    crc = ((crc & 0x80 & 0xFF) != 0) ? ((crc << 1) ^ 0xD5) & 0xFF : (crc << 1) & 0xFF
  return crc
}

export const parseDataBuffer = (state: MspMsgState, mspResponse$: Subject<MspMsg>, mspError$: Subject<Error>, data: Buffer) => {
  for (let i = 0; i < data.length; i++) {
    parseNextCharCode(state, data.readInt8(i))
    applyMsgState(state, mspResponse$, mspError$)
  }
}

export const parseNextCharCode = (mspMsgState: MspMsgState, ch: number) => {
  switch (mspMsgState.state) {
    case MspState.MSP_IDLE:
      if (String.fromCharCode(ch) == '$')
        mspMsgState.state = MspState.MSP_HEADER_START
      else
        mspMsgState.state = MspState.MSP_IDLE
      break
    case MspState.MSP_HEADER_START:
      mspMsgState.buffer = []
      mspMsgState.checksum = 0
      if (String.fromCharCode(ch) == 'X')
        mspMsgState.state = MspState.MSP_HEADER_X
      else
        mspMsgState.state = MspState.MSP_IDLE
      break
    case MspState.MSP_HEADER_X:
      if (String.fromCharCode(ch) == '>')
        mspMsgState.state = MspState.MSP_HEADER_V2_NATIVE
      else if (String.fromCharCode(ch) == '!')
        mspMsgState.state = MspState.MSP_ERROR_RECEIVED
      else
        mspMsgState.state = MspState.MSP_IDLE
      break
    case MspState.MSP_HEADER_V2_NATIVE:
      mspMsgState.buffer.push(ch & 0xFF)
      mspMsgState.checksum = crc8_dvb_s2(mspMsgState.checksum, ch)
      if (mspMsgState.buffer.length == 5) {
        mspMsgState.flag = getFlag(mspMsgState.buffer)
        mspMsgState.cmd = getCmd(mspMsgState.buffer)
        mspMsgState.length = getLength(mspMsgState.buffer)
        mspMsgState.buffer = []
        if (mspMsgState.length > 0)
          mspMsgState.state = MspState.MSP_PAYLOAD_V2_NATIVE
        else
          mspMsgState.state = MspState.MSP_CHECKSUM_V2_NATIVE
      }
      break
    case MspState.MSP_PAYLOAD_V2_NATIVE:
      mspMsgState.buffer.push(ch & 0xFF)
      mspMsgState.checksum = crc8_dvb_s2(mspMsgState.checksum, ch)
      mspMsgState.length--
      if (mspMsgState.length == 0)
        mspMsgState.state = MspState.MSP_CHECKSUM_V2_NATIVE
      break
    case MspState.MSP_CHECKSUM_V2_NATIVE:
      if (mspMsgState.checksum == (ch & 0xFF))
        mspMsgState.state = MspState.MSP_COMMAND_RECEIVED
      else
        mspMsgState.state = MspState.MSP_IDLE
      break
    case MspState.MSP_ERROR_RECEIVED:
      mspMsgState.state = MspState.MSP_IDLE
      break
    default:
      mspMsgState.state = MspState.MSP_IDLE
      break
  }
}

const getFlag = v => v[0]
const getCmd = v => v[1] + (v[2] << 8)
const getLength = v => v[3] + (v[4] << 8)

const toMspMsg = (mspMsg: MspMsgState): MspMsg  => {
  return { cmd: mspMsg.cmd, buffer: mspMsg.buffer }
}

const applyMsgState = (mspMsg: MspMsgState, mspResponse$: Subject<MspMsg>, mspError$: Subject<Error>) => {
  if (mspMsg.state == MspState.MSP_COMMAND_RECEIVED) {
    mspResponse$.next(toMspMsg(mspMsg))
    mspMsg.state = MspState.MSP_IDLE
  } else if (mspMsg.state == MspState.MSP_ERROR_RECEIVED) {
    mspError$.next(new Error())
    mspMsg.state = MspState.MSP_IDLE
  }
}

