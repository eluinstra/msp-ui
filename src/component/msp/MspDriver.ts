import { BehaviorSubject, fromEvent, Observable, Subject } from 'rxjs'
import { filter, share, tap } from 'rxjs/operators'
import { getPort$, getPath, isOpen, registerFunction, write, SerialPort } from '@/component/serialport/SerialPortDriver'
import { createMspMsgState, MspMsg as MspMsg_, MspMsgState, toInt16LE } from '@/component/msp/MspParser'
import { stringToCharArray } from '../serialport/MspEncoder'

export type MspMsg = MspMsg_

export interface MspDriver {
  serialPort: SerialPort,
  mspMsg: MspMsgState,
  mspResponse$: Subject<MspMsg>,
  mspError$: Subject<Error>
}

export const getMspResponse$ = (driver: MspDriver) => driver.mspResponse$

export const getMspError$ = (driver: MspDriver) => driver.mspError$

export const getPortName = (driver: MspDriver) => getPath(driver.serialPort)

export const mspRequest = (driver: MspDriver, cmd: number, payload: string) => write(driver.serialPort, {cmd: cmd, buffer: stringToCharArray(payload)})

export const mspRequestNr = (driver: MspDriver, cmd: number, payload: string) => write(driver.serialPort, {cmd: cmd, buffer: toInt16LE(payload)})

const createMspResponse$ = () => new Subject<MspMsg>()

const createMspError$ = () => new Subject<Error>()

export const createMspDriver = (serialPort: BehaviorSubject<any>): MspDriver => {
  return {
    serialPort: serialPort,
    mspMsg: createMspMsgState(),
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
  registerFunction(serialPort, function (object: any) {
    const { mspMsg, mspResponse$, mspError$ } = driver
    parseDataBuffer(mspMsg, mspResponse$, mspError$, object)
  })
}

const parseDataBuffer = (mspMsg: MspMsgState, mspResponse$: Subject<MspMsg_>, mspError$: Subject<Error>, object: any) => {
  if (object instanceof Error)
    mspError$.next(object)
  else
    mspResponse$.next(object)
}

const stopMspDriver = (driver: MspDriver) => registerFunction(driver.serialPort, function (data: Buffer) { })
