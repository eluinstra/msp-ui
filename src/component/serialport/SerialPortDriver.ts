import { remote } from 'electron'
import { identity } from 'rxjs'
import { BehaviorSubject, from, Subject } from 'rxjs'
import { startWith } from 'rxjs/operators'
import { PortInfo } from 'serialport'
const SerialPort = remote.require('serialport')

export const createSerialPort = () => new BehaviorSubject(null)

export const getPort$ = identity

export const getPath = serialPort => serialPort.value?.path

export const openPort = (serialPort, port, baudrate) => serialPort.next(new SerialPort(port, { baudRate: baudrate }))

export const registerFunction = (serialPort, f) => serialPort.value?.on('data', f)

export const isOpen = (serialPort) => Boolean(serialPort)

export const write = (serialPort, value) => serialPort.value.write(value)

export const closePort = (serialPort) => {
  serialPort.value?.close()
  serialPort.next(null)
}

export const availableBaudrates = [9600, 19200, 38400, 57600, 115200]
export const defaultBaudrate = 115200
export const portInfo$ = () => from(SerialPort.list() as Promise<PortInfo[]>)
