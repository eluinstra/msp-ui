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

const getFlag = v => v[0]
const getCmd = v => v[1] + (v[2] << 8)
const getLength = v => v[3] + (v[4] << 8)

const parseCmd = (b: number[]) => {
  return {
    flag: b[0],
    cmd: b[1] + (b[2] << 8),
    length: b[3] + (b[4] << 8)
  }
}

export const toInt16 = (s: string) => {
  const buffer = [0, 0]
  const n = parseInt(s)
  buffer[0] = n % 256
  buffer[1] = Math.floor(n / 256)
  return buffer
}

export const checksum = bytes => bytes.reduce((crc, b) => crc8_dvb_s2(crc, b), 0)

const crc8_dvb_s2 = (crc, num) => {
  crc = (crc ^ num) & 0xFF
  for (let i = 0; i < 8; i++)
    crc = ((crc & 0x80 & 0xFF) != 0) ? ((crc << 1) ^ 0xD5) & 0xFF : (crc << 1) & 0xFF
  return crc
}

export const parseNextCharCode = (mspMsg: MspMsg, ch: number) => {
  //console.log(num & 0xFF)
  //console.log(hexInt8(num & 0xFF))
  switch (mspMsg.state) {
    case MspState.MSP_IDLE:
      if (String.fromCharCode(ch) == '$')
        mspMsg.state = MspState.MSP_HEADER_START
      break
    case MspState.MSP_HEADER_START:
      mspMsg.buffer = []
      mspMsg.checksum = 0
      if (String.fromCharCode(ch) == 'X')
        mspMsg.state = MspState.MSP_HEADER_X
      break
    case MspState.MSP_HEADER_X:
      if (String.fromCharCode(ch) == '>')
        mspMsg.state = MspState.MSP_HEADER_V2_NATIVE
      else if (String.fromCharCode(ch) == '!')
        mspMsg.state = MspState.MSP_ERROR_RECEIVED
      break
    case MspState.MSP_HEADER_V2_NATIVE:
      mspMsg.buffer.push(ch & 0xFF)
      mspMsg.checksum = crc8_dvb_s2(mspMsg.checksum, ch)
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
      mspMsg.buffer.push(ch & 0xFF)
      mspMsg.checksum = crc8_dvb_s2(mspMsg.checksum, ch)
      mspMsg.length--
      if (mspMsg.length == 0)
        mspMsg.state = MspState.MSP_CHECKSUM_V2_NATIVE
      break
    case MspState.MSP_CHECKSUM_V2_NATIVE:
      if (mspMsg.checksum == (ch & 0xFF))
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
