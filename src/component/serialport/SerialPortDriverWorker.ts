import { ipcRenderer, IpcRenderer } from "electron";
import { IpcRendererEvent } from "electron/renderer";
import { identity } from 'rxjs'
import { BehaviorSubject, from, Subject } from 'rxjs'
import { startWith } from 'rxjs/operators'
import { PortInfo } from 'serialport'
import { SerialPortService, Command as SerialPortCommand } from "./SerialPortService";

export const createSerialPortDriver = (ipcRenderer: IpcRenderer) => {
  console.log(ipcRenderer.sendSync('synchronous-message', 'ping')); // prints "pong"

  ipcRenderer.on('asynchronous-reply', (event, arg) => {
    console.log(arg); // prints "pong"
  });
  ipcRenderer.send('asynchronous-message', 'ping');
}

type SerialPort = BehaviorSubject<string>

export const createSerialPort = (): SerialPort => new BehaviorSubject<string>(null)

export const getPort$ = identity

export const getPath = (serialPort: SerialPort) => serialPort.value

export const openPort = (serialPort: SerialPort, path: string, baudrate: number) => serialPort.next(serialPortDriver.openPort(path, baudrate))

export const registerFunction = (serialPort: SerialPort, eventHandler: (buffer: Buffer) => void) => {
  serialPortDriver.onDataReceived(eventHandler)
  serialPortDriver.registerDataEventHandler(serialPort.value)
}

export const isOpen = (serialPort: SerialPort) => Boolean(serialPort)

export const write = (serialPort: SerialPort, buffer: Buffer) => serialPortDriver.write(serialPort.value, buffer)

export const closePort = (serialPort: SerialPort) => {
  serialPortDriver.closePort(serialPort.value)
  serialPort.next(null)
}

export const availableBaudrates = [9600, 19200, 38400, 57600, 115200]
export const defaultBaudrate = 115200
export const portInfo$ = () => from(serialPortDriver.list())

class SerialPortDriver implements SerialPortService {
  private ipcRenderer: IpcRenderer

  constructor(ipcRenderer: IpcRenderer) {
    this.ipcRenderer = ipcRenderer
  }

  list = async () => await this.ipcRenderer.invoke(SerialPortCommand.list) as Promise<PortInfo[]>

  openPort = (path: string, baudrate: number) => this.ipcRenderer.sendSync(SerialPortCommand.openPort, path, baudrate)

  closePort = (path: string) => this.ipcRenderer.send(SerialPortCommand.closePort, path)

  onDataReceived = (fn: (buffer: Buffer) => void) => this.ipcRenderer.on(SerialPortCommand.onDataReceived, (event: IpcRendererEvent, buffer: Buffer) => fn(buffer))

  registerDataEventHandler = (path: string) => this.ipcRenderer.send(SerialPortCommand.registerDataEventHandler, path, SerialPortCommand.onDataReceived)

  unregisterDataEventHandler = (path: string) => this.ipcRenderer.send(SerialPortCommand.unregisterDataEventHandler, path)

  onErrorReceived = (fn: (buffer: Buffer) => void) => this.ipcRenderer.on(SerialPortCommand.onErrorReceived, (event: IpcRendererEvent, buffer: Buffer) => fn(buffer))

  registerErrorEventHandler = (path: string) => this.ipcRenderer.send(SerialPortCommand.registerErrorEventHandler, path, SerialPortCommand.onErrorReceived)

  unregisterErrorEventHandler = (path: string) => this.ipcRenderer.send(SerialPortCommand.unregisterErrorEventHandler, path)

  write = (path: string, buffer: Buffer) => this.ipcRenderer.send(SerialPortCommand.write, path, buffer)
}

const serialPortDriver = new SerialPortDriver(ipcRenderer)
