import { BehaviorSubject, fromEvent, Observable, Subject } from 'rxjs'
import { mspCmdHeader } from '@/component/msp/MspProtocol'
import { filter, share, tap } from 'rxjs/operators'
import { getPort$, getPath, isOpen, registerFunction, write } from '@/component/serialport/SerialPortDriver'

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

export interface Driver {
  serialPort: BehaviorSubject<any>,
  mspMsg: MspMsg,
  mspResponse$: Subject<MspMsg>,
  mspError$: Subject<MspMsg>
}

export const getMspResponse$ = (driver: Driver) => driver.mspResponse$

export const getMspError$ = (driver: Driver) => driver.mspError$

const hexInt16 = (v: number) => [v & 0x00FF, v & 0xFF00]

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

const checksum = bytes => bytes.reduce((crc, b) => crc8_dvb_s2(crc, b), 0)

const crc8_dvb_s2 = (crc, num) => {
  crc = (crc ^ num) & 0xFF
  for (let i = 0; i < 8; i++)
    crc = ((crc & 0x80 & 0xFF) != 0)
      ? ((crc << 1) ^ 0xD5) & 0xFF
      : (crc << 1) & 0xFF
  return crc
}

const command = (cmd: number, payload: string) => {
  return rawCommand(cmd, payload.split('').map(ch => ch.charCodeAt(0)))
}

const rawCommand = (cmd: number, payload: number[]) => {
  const flag = 0
  const content = [].concat([flag], hexInt16(cmd), hexInt16(payload.length), payload)
  return [].concat(mspCmdHeader.split('').map(ch => ch.charCodeAt(0)), content, [checksum(content)])
}

export const toInt16 = (s: string) => {
  var buffer = [0, 0]
  var n = parseInt(s)
  buffer[0] = n % 256
  buffer[1] = Math.floor(n / 256)
  return buffer
}

export const getPortName = (driver: Driver) => getPath(driver.serialPort)

export const mspRequest = (driver: Driver, cmd: number, payload: string) => write(driver.serialPort, Buffer.from(command(cmd, payload)))

export const mspRequestNr = (driver: Driver, cmd: number, payload: string) => write(driver.serialPort, Buffer.from(rawCommand(cmd, toInt16(payload))))

const createMspResponse$ = () => new Subject<MspMsg>()

const createMspError$ = () => new Subject<MspMsg>()

export const createDriver = (serialPort: BehaviorSubject<any>): Driver => {
  return {
    serialPort: serialPort,
    mspMsg: {
      state: MspState.MSP_IDLE,
      flag: 0,
      cmd: 0,
      length: 0,
      buffer: [],
      checksum: 0
    },
    mspResponse$: createMspResponse$(),
    mspError$: createMspError$()
  }
}

export const useMspDriver = (driver: Driver) => {
  const sub = getPort$(driver.serialPort)
    .pipe(
      filter(isOpen),
    )
    .subscribe(p => {
      startDriver(driver)
    })
  return () => {
    sub.unsubscribe()
    stopDriver(driver)
  }
}

const startDriver = (driver: Driver) => {
  const { serialPort } = driver
  registerFunction(serialPort, function (data: Buffer) {
    parseMSPCommand(driver, data)
  })
}

const parseMSPCommand = (driver: Driver, data: Buffer) => {
  const { mspMsg, mspResponse$, mspError$ } = driver
  for (let i = 0; i < data.length; i++) {
    parseNextCharCode(mspMsg, data.readInt8(i))
    if (mspMsg.state == MspState.MSP_COMMAND_RECEIVED) {
      mspResponse$.next({ ...mspMsg })
      mspMsg.state = MspState.MSP_IDLE
    } else if (mspMsg.state == MspState.MSP_ERROR_RECEIVED) {
      mspError$.next({ ...mspMsg })
      mspMsg.state = MspState.MSP_IDLE
    }
  }
}

const stopDriver = (driver: Driver) => registerFunction(driver.serialPort, function (data: Buffer) { })

const parseNextCharCode = (mspMsg: MspMsg, ch: number) => {
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

