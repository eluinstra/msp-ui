import { remote } from 'electron'
import { BehaviorSubject, from, Subject } from 'rxjs'
import { startWith } from 'rxjs/operators'
import { PortInfo } from 'serialport'
const SerialPort = remote.require('serialport')

export const serialPort = new BehaviorSubject(undefined)

export const openPort = (port, baudrate) => {
  serialPort.next(new SerialPort(port, { baudRate: baudrate }))
}

export const closePort = () => {
  serialPort.value.close()
  serialPort.next(undefined)
}

export const baudrates = [9600, 19200, 38400, 57600, 115200]
export const defaultBaudrate = 115200
export const portInfo$ = () => {
  return from(SerialPort.list() as Promise<PortInfo[]>)
}
