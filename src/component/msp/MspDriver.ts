import { BehaviorSubject, fromEvent, Observable, Subject } from 'rxjs'
import { mspCmdHeader } from '@/component/msp/MspProtocol'
import { filter, share, tap } from 'rxjs/operators'
import { getPort$, getPath, isOpen, registerFunction, write } from '@/component/serialport/SerialPortDriver'
import { checksum, MspMsg as MspParserMsg, MspState, parseNextCharCode, toInt16 } from '@/component/msp/MspParser'

export interface MspDriver {
  serialPort: BehaviorSubject<any>,
  mspMsg: MspMsg,
  mspResponse$: Subject<MspMsg>,
  mspError$: Subject<MspMsg>
}

export type MspMsg = MspParserMsg

export const getMspResponse$ = (driver: MspDriver) => driver.mspResponse$

export const getMspError$ = (driver: MspDriver) => driver.mspError$

const hexInt16 = (v: number) => [v & 0x00FF, v & 0xFF00]

const command = (cmd: number, payload: string) => {
  return rawCommand(cmd, payload.split('').map(ch => ch.charCodeAt(0)))
}

const rawCommand = (cmd: number, payload: number[]) => {
  const flag = 0
  const content = [].concat([flag], hexInt16(cmd), hexInt16(payload.length), payload)
  return [].concat(mspCmdHeader.split('').map(ch => ch.charCodeAt(0)), content, [checksum(content)])
}

export const getPortName = (driver: MspDriver) => getPath(driver.serialPort)

export const mspRequest = (driver: MspDriver, cmd: number, payload: string) => write(driver.serialPort, Buffer.from(command(cmd, payload)))

export const mspRequestNr = (driver: MspDriver, cmd: number, payload: string) => write(driver.serialPort, Buffer.from(rawCommand(cmd, toInt16(payload))))

const createMspResponse$ = () => new Subject<MspMsg>()

const createMspError$ = () => new Subject<MspMsg>()

export const createDriver = (serialPort: BehaviorSubject<any>): MspDriver => {
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

export const useMspDriver = (driver: MspDriver) => {
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

const startDriver = (driver: MspDriver) => {
  const { serialPort } = driver
  registerFunction(serialPort, function (data: Buffer) {
    parseMSPCommand(driver, data)
  })
}

const parseMSPCommand = (driver: MspDriver, data: Buffer) => {
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

const stopDriver = (driver: MspDriver) => registerFunction(driver.serialPort, function (data: Buffer) { })
