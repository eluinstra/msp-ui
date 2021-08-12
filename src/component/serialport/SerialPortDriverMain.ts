import { IpcMain } from "electron"
import { IpcMainEvent } from "electron/main"
import SerialPort, { PortInfo } from "serialport"

export enum Command {
  list = 'SerialPort.list',
  openPort = 'SerialPort.openPort',
  closePort = 'SerialPort.closePort',
  registerDataEventHandler = 'SerialPort.registerDataEventHandler',
  unregisterDataEventHandler = 'SerialPort.unregisterDataEventHandler',
  onDataReceived = 'SerialPort.onDataReceived',
  registerErrorEventHandler = 'SerialPort.registerErrorEventHandler',
  unregisterErrorEventHandler = 'SerialPort.unregisterErrorEventHandler',
  onErrorReceived = 'SerialPort.onErrorReceived',
  write = 'SerialPort.registerErrorEventHandler'
}

const enum EventType {
  data = 'data',
  error = 'error'
}

const serialPorts = new Array<SerialPort>()

export const registerSerialPortDriverMainEvents = (ipcMain: IpcMain) => {

  ipcMain.on('asynchronous-message', (event: IpcMainEvent, arg: string) => {
    console.log(arg) // prints "ping"
    event.reply('asynchronous-reply', 'pong')
  })

  ipcMain.on('synchronous-message', (event: IpcMainEvent, arg: string) => {
    console.log(arg) // prints "ping"
    event.returnValue = 'pong'
  })

  ipcMain.handle(Command.list, async (event: IpcMainEvent) => event.returnValue = list())

  ipcMain.on(Command.openPort, (event: IpcMainEvent, path: string, baudrate: number) : string => event.returnValue = openPort(path, baudrate))

  ipcMain.on(Command.closePort, (_: IpcMainEvent, path: string) => closePort(path))

  ipcMain.on(Command.registerDataEventHandler, (_: IpcMainEvent, path: string, eventHandler: string) => registerDataEventHandler(path, (data: Buffer) => ipcMain.emit(eventHandler, data)))

  ipcMain.on(Command.unregisterDataEventHandler, (_: IpcMainEvent, path: string) => unregisterDataEventHandler(path))

  ipcMain.on(Command.registerErrorEventHandler, (_: IpcMainEvent, path: string, eventHandler: string) => registerErrorEventHandler(path, (data: string) => ipcMain.emit(eventHandler, data)))

  ipcMain.on(Command.unregisterErrorEventHandler, (_: IpcMainEvent, path: string) => unregisterErrorEventHandler(path))

  ipcMain.on(Command.write, (_: IpcMainEvent, path: string, buffer: Buffer) => write(path, buffer))
}

const list = async (): Promise<PortInfo[]> => await SerialPort.list()

const openPort = (path: string, baudrate: number) => {
  unregisterSerialPort(path)
  registerSerialPort(createSerialPort(path, baudrate))
  return path
}

const closePort = (path: string) => {
  unregisterSerialPort(path)
  destroySerialPort(path)
}

const createSerialPort = (path: string, baudrate: number) => new SerialPort(path, { baudRate: baudrate })

const destroySerialPort = (path: string) => serialPorts[path] = null

const registerSerialPort = (serialPort: SerialPort) => serialPorts[serialPort.path] = serialPort

const unregisterSerialPort = (path: string) => serialPorts[path]?.close()

const registerDataEventHandler = (path: string, eventHandler: (buffer: Buffer) => boolean) => serialPorts[path]?.on(EventType.data, eventHandler)

const unregisterDataEventHandler = (path: string) => serialPorts[path]?.on(EventType.data, {})

const registerErrorEventHandler = (path: string, eventHandler: (message: string) => boolean) => serialPorts[path]?.on(EventType.error, eventHandler)

const unregisterErrorEventHandler = (path: string) => serialPorts[path]?.on(EventType.error, {})

const write = (path: string, buffer: Buffer) => serialPorts[path]?.write(buffer)
