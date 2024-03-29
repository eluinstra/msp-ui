import { Subject } from 'rxjs'
import { filter, share, tap } from 'rxjs/operators'
import { getPort$, getPath, isOpen, registerFunction, write, SerialPort } from '@/component/serialport/SerialPortDriver'
import { numberToInt16LE, stringToCharArray } from 'serialport-parser-msp-v2/lib/MspEncoder'
import { MspCmd as _MspCmd, MspMsg as _MspMsg} from 'serialport-parser-msp-v2'

export const MspCmd = _MspCmd
export type MspMsg = _MspMsg

export interface MspDriver {
  serialPort: SerialPort,
  mspResponse$: Subject<MspMsg>,
  mspError$: Subject<Error>
}

export const getMspResponse$ = (driver: MspDriver) => driver.mspResponse$

export const clearMspResponse$ = (driver: MspDriver) => driver.mspResponse$.next(null)

export const getMspError$ = (driver: MspDriver) => driver.mspError$

export const getPortName = (driver: MspDriver) => getPath(driver.serialPort)

export const mspRequest = (driver: MspDriver, cmd: number, payload: string) => write(driver.serialPort, {cmd: cmd, buffer: stringToCharArray(payload)})

export const mspRequestNr = (driver: MspDriver, cmd: number, payload: string) => write(driver.serialPort, {cmd: cmd, buffer: toInt16LE(payload)})

const toInt16LE = (s: string) => {
  const n = parseInt(s)
  return numberToInt16LE(n)
}

const createMspResponse$ = () => new Subject<MspMsg>()

const createMspError$ = () => new Subject<Error>()

export const createMspDriver = (serialPort: SerialPort): MspDriver => {
  return {
    serialPort: serialPort,
    mspResponse$: createMspResponse$(),
    mspError$: createMspError$()
  }
}

export const useMspDriver = (driver: MspDriver) => {
  const sub = getPort$(driver.serialPort)
    .pipe(
      filter(isOpen),
    )
    .subscribe(_ => {
      startMspDriver(driver)
    })
  return () => {
    sub.unsubscribe()
    stopMspDriver(driver)
  }
}

const startMspDriver = (driver: MspDriver) => {
  const { serialPort, mspResponse$, mspError$ } = driver
  registerFunction(serialPort, function (object: any) {
    parseDataBuffer(mspResponse$, mspError$, object)
  })
}

const parseDataBuffer = (mspResponse$: Subject<MspMsg>, mspError$: Subject<Error>, object: any) => {
  if (object instanceof Error)
    mspError$.next(object)
  else
    mspResponse$.next(object)
}

const stopMspDriver = (driver: MspDriver) => registerFunction(driver.serialPort, function (object: any) { })
