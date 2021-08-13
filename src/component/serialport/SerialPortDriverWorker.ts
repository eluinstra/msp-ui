import { ipcRenderer, IpcRenderer } from "electron";
import { identity } from 'rxjs'
import { BehaviorSubject, from, Subject } from 'rxjs'
import { startWith } from 'rxjs/operators'
import { serialPortService as driver } from '@/component/serialport/SerialPortService'

export const registerSerialPortWorkerEvents = (ipcRenderer: IpcRenderer) => {
  console.log(ipcRenderer.sendSync('synchronous-message', 'ping')); // prints "pong"

  ipcRenderer.on('asynchronous-reply', (event, arg) => {
    console.log(arg); // prints "pong"
  });
  ipcRenderer.send('asynchronous-message', 'ping');
}

export type SerialPort = BehaviorSubject<string>

export const createSerialPort = (): SerialPort => new BehaviorSubject<string>(null)

export const getPort$ = identity

export const getPath = (serialPort: SerialPort) => serialPort.value

export const openPort = (serialPort: SerialPort, path: string, baudrate: number) => serialPort.next(driver.openPort(ipcRenderer, path, baudrate))

export const registerFunction = (serialPort: SerialPort, eventHandler: (buffer: Buffer) => void) => {
  driver.onDataReceived(ipcRenderer, eventHandler)
  driver.registerDataEventHandler(ipcRenderer, serialPort.value)
}

export const isOpen = (serialPort: SerialPort) => Boolean(serialPort)

export const write = (serialPort: SerialPort, buffer: Buffer) => driver.write(ipcRenderer, serialPort.value, buffer)

export const closePort = (serialPort: SerialPort) => {
  driver.closePort(ipcRenderer, serialPort.value)
  serialPort.next(null)
}

export const availableBaudrates = [9600, 19200, 38400, 57600, 115200]
export const defaultBaudrate = 115200
export const portInfo$ = () => from(driver.list(ipcRenderer))
