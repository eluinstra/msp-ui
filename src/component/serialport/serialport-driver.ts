import { remote } from 'electron'
import { BehaviorSubject, from } from 'rxjs'
import { PortInfo } from 'serialport'
const SerialPort = remote.require('serialport')

export const serialPort = new BehaviorSubject(undefined)
// serialPort.next(new SerialPort('/dev/ttyUSB0', { baudRate: 115200 }))

export const openPort = (port, baudrate) => {
  console.log(port)
  console.log(baudrate)
  serialPort.next(new SerialPort(port, { baudRate: baudrate }))
}

export const closePort = () => {
  console.log(2)
  serialPort.value.close()
  serialPort.next(undefined)
}

export const baudrates = [9600, 19200, 38400, 57600, 115200]
export const defaultBaudrate = 115200
export const portInfo$ = () => {
  return from(SerialPort.list() as Promise<PortInfo[]>)
}
