import { remote } from 'electron'
import { BehaviorSubject, from, Subject } from 'rxjs'
import { startWith } from 'rxjs/operators'
import { PortInfo } from 'serialport'
const SerialPort = remote.require('serialport')

export const availableBaudrates = [9600, 19200, 38400, 57600, 115200]
export const defaultBaudrate = 115200
export const portInfo$ = () => from(SerialPort.list() as Promise<PortInfo[]>)
export const createSerialPort = () => new SerialPortDriver()

export class SerialPortDriver {
  private serialPort: BehaviorSubject<any>

  constructor() {
    this.serialPort = new BehaviorSubject(null)
  }

  getPort$ = () => this.serialPort
  getPath = () => this.serialPort.value?.path
  openPort = (port, baudrate) => this.serialPort.next(new SerialPort(port, { baudRate: baudrate }))
  registerFunction = (f) => this.serialPort.value?.on('data', f)
  isOpen = () => Boolean(this.serialPort?.value)
  write = (value) => this.serialPort.value.write(value)
  closePort = () => {
    this.serialPort.value?.close()
    this.serialPort.next(null)
  }
}
