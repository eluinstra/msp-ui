import { ipcRenderer, IpcRenderer } from "electron";
import { IpcRendererEvent } from "electron/main";
import { identity } from 'rxjs'
import { BehaviorSubject, from, Subject } from 'rxjs'
import { startWith } from 'rxjs/operators'
import { PortInfo } from 'serialport'
import { Command as SerialPortCommand} from './SerialPortDriverMain'


export const registerSerialPortWorkerEvents = (ipcRenderer: IpcRenderer) => {
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

export const openPort = (serialPort: SerialPort, path: string, baudrate: number) => serialPort.next(openPort_(ipcRenderer, path, baudrate))

export const registerFunction = (serialPort: SerialPort, eventHandler: (buffer: Buffer) => void) => {
  onDataReceived_(ipcRenderer,SerialPortCommand.onDataReceived, eventHandler)
  registerDataEventHandler_(ipcRenderer, serialPort.value, SerialPortCommand.onDataReceived)
}

export const isOpen = (serialPort: SerialPort) => Boolean(serialPort)

export const write = (serialPort: SerialPort, buffer: Buffer) => write_(ipcRenderer, serialPort.value, buffer)

export const closePort = (serialPort: SerialPort) => {
  closePort_(ipcRenderer, serialPort.value)
  serialPort.next(null)
}

export const availableBaudrates = [9600, 19200, 38400, 57600, 115200]
export const defaultBaudrate = 115200
export const portInfo$ = () => from(list_(ipcRenderer))


const list_ = async (ipcRenderer: IpcRenderer) => await ipcRenderer.invoke(SerialPortCommand.list)

const openPort_ = (ipcRenderer: IpcRenderer, path: string, baudrate: number) => ipcRenderer.sendSync(SerialPortCommand.openPort, path, baudrate)

const closePort_ = (ipcRenderer: IpcRenderer, path: string) => ipcRenderer.send(SerialPortCommand.closePort, path)

const registerDataEventHandler_ = (ipcRenderer: IpcRenderer, path: string, eventHandler: string) => ipcRenderer.send(SerialPortCommand.registerDataEventHandler, path, eventHandler)

const unregisterDataEventHandler_ = (ipcRenderer: IpcRenderer, path: string) => ipcRenderer.send(SerialPortCommand.unregisterDataEventHandler, path)

const onDataReceived_ = (ipcRenderer: IpcRenderer, name: string, fn: (buffer: Buffer) => void) => ipcRenderer.on(name, (event: IpcRendererEvent, buffer: Buffer) => fn(buffer))

const registerErrorEventHandler_ = (ipcRenderer: IpcRenderer, path: string, eventHandler: string) => ipcRenderer.send(SerialPortCommand.registerErrorEventHandler, path, eventHandler)

const unregisterErrorEventHandler_ = (ipcRenderer: IpcRenderer, path: string) => ipcRenderer.send(SerialPortCommand.unregisterErrorEventHandler, path)

const onErrorReceived_ = (ipcRenderer: IpcRenderer, name: string, fn: (buffer: Buffer) => void) => ipcRenderer.on(name, (event: IpcRendererEvent, buffer: Buffer) => fn(buffer))

const write_ = (ipcRenderer: IpcRenderer, path: string, buffer: Buffer) => ipcRenderer.send(SerialPortCommand.write, path, buffer)
