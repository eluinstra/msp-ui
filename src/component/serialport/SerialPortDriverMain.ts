import { IpcMain } from "electron"
import { IpcMainEvent } from "electron/main"
import SerialPort, { PortInfo } from "serialport"
import { Command, SerialPortService } from "./SerialPortService"

const enum EventType {
  data = 'data',
  error = 'error'
}

const serialPorts = new Array<SerialPort>()
let serialPortHandler: SerialPortHandler = null

export const createSerialPortHandler = (ipcMain: IpcMain) => {
  serialPortHandler = new SerialPortHandler(ipcMain)

  ipcMain.on('asynchronous-message', (event: IpcMainEvent, arg: string) => {
    console.log(arg) // prints "ping"
    event.reply('asynchronous-reply', 'pong')
  })

  ipcMain.on('synchronous-message', (event: IpcMainEvent, arg: string) => {
    console.log(arg) // prints "ping"
    event.returnValue = 'pong'
  })

  ipcMain.handle(Command.list, async (event: IpcMainEvent) => event.returnValue = serialPortHandler.list())

  ipcMain.on(Command.openPort, (event: IpcMainEvent, path: string, baudrate: number) : string => event.returnValue = serialPortHandler.openPort(path, baudrate))

  ipcMain.on(Command.closePort, (_: IpcMainEvent, path: string) => serialPortHandler.closePort(path))

  ipcMain.on(Command.registerDataEventHandler, (_: IpcMainEvent, path: string, eventHandler: string) => serialPortHandler.registerDataEventHandler(path, eventHandler))

  ipcMain.on(Command.unregisterDataEventHandler, (_: IpcMainEvent, path: string) => serialPortHandler.unregisterDataEventHandler(path))

  ipcMain.on(Command.registerErrorEventHandler, (_: IpcMainEvent, path: string, eventHandler: string) => serialPortHandler.registerErrorEventHandler(path, eventHandler))

  ipcMain.on(Command.unregisterErrorEventHandler, (_: IpcMainEvent, path: string) => serialPortHandler.unregisterErrorEventHandler(path))

  ipcMain.on(Command.write, (_: IpcMainEvent, path: string, buffer: Buffer) => serialPortHandler.write(path, buffer))
}

class SerialPortHandler implements SerialPortService {
  private ipcMain: IpcMain

  constructor(ipcMain: IpcMain) {
    this.ipcMain = ipcMain
  }

  list = async (): Promise<PortInfo[]> => await SerialPort.list()

  openPort = (path: string, baudrate: number) => {
    this.unregisterSerialPort(path)
    this.registerSerialPort(this.createSerialPort(path, baudrate))
    return path
  }
  
  closePort = (path: string) => {
    this.unregisterSerialPort(path)
    this.destroySerialPort(path)
  }
  
  createSerialPort = (path: string, baudrate: number) => new SerialPort(path, { baudRate: baudrate })

  destroySerialPort = (path: string) => serialPorts[path] = null

  registerSerialPort = (serialPort: SerialPort) => serialPorts[serialPort.path] = serialPort

  unregisterSerialPort = (path: string) => serialPorts[path]?.close()

  registerDataEventHandler = (path: string, eventHandler: string) => serialPorts[path]?.on(EventType.data, (data: Buffer) => this.ipcMain.emit(eventHandler, data))

  unregisterDataEventHandler = (path: string) => serialPorts[path]?.on(EventType.data, {})

  registerErrorEventHandler = (path: string, eventHandler: string) => serialPorts[path]?.on(EventType.error, (data: string) => this.ipcMain.emit(eventHandler, data))

  unregisterErrorEventHandler = (path: string) => serialPorts[path]?.on(EventType.error, {})

  write = (path: string, buffer: Buffer) => serialPorts[path]?.write(buffer)
}
