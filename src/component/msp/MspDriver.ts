import { BehaviorSubject, fromEvent, Observable, Subject } from 'rxjs'
import { mspCmdHeader } from '@/component/msp/MspProtocol'
import { filter, share, tap } from 'rxjs/operators'
import { getPort$, getPath, isOpen, registerFunction, write } from '@/component/serialport/SerialPortDriver'
import { checksum, createMspInternalMsg, MspMsg as MspMsg_, MspInternalMsg, parseDataBuffer, toInt16LE } from '@/component/msp/MspParser'

export type MspMsg = MspMsg_

export interface MspDriver {
  serialPort: BehaviorSubject<any>,
  mspMsg: MspInternalMsg,
  mspResponse$: Subject<MspMsg>,
  mspError$: Subject<Error>
}

export const getMspResponse$ = (driver: MspDriver) => driver.mspResponse$

export const getMspError$ = (driver: MspDriver) => driver.mspError$

const hexInt16 = (n: number) => [n & 0x00FF, (n & 0xFF00) >> 8]

const command = (cmd: number, payload: string) => {
  return rawCommand(cmd, payload.split('').map(ch => ch.charCodeAt(0)))
}

const rawCommand = (cmd: number, payload: number[], flag = 0) => {
  const content = [].concat([flag], hexInt16(cmd), hexInt16(payload.length), payload)
  return [].concat(mspCmdHeader.split('').map(ch => ch.charCodeAt(0)), content, [checksum(content)])
}

export const getPortName = (driver: MspDriver) => getPath(driver.serialPort)

export const mspRequest = (driver: MspDriver, cmd: number, payload: string) => write(driver.serialPort, Buffer.from(command(cmd, payload)))

export const mspRequestNr = (driver: MspDriver, cmd: number, payload: string) => write(driver.serialPort, Buffer.from(rawCommand(cmd, toInt16LE(payload))))

const createMspResponse$ = () => new Subject<MspMsg>()

const createMspError$ = () => new Subject<Error>()

export const createMspDriver = (serialPort: BehaviorSubject<any>): MspDriver => {
  return {
    serialPort: serialPort,
    mspMsg: createMspInternalMsg(),
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
      startMspDriver(driver)
    })
  return () => {
    sub.unsubscribe()
    stopMspDriver(driver)
  }
}

const startMspDriver = (driver: MspDriver) => {
  const { serialPort } = driver
  registerFunction(serialPort, function (data: Buffer) {
    const { mspMsg, mspResponse$, mspError$ } = driver
    parseDataBuffer(mspMsg, mspResponse$, mspError$, data)
  })
}

const stopMspDriver = (driver: MspDriver) => registerFunction(driver.serialPort, function (data: Buffer) { })
