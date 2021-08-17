import { IpcMain } from "electron"
import { IpcMainEvent } from "electron/main"
import SerialPort, { PortInfo } from "serialport"
import { MspMsg, MspEncoder, MspDecoder } from "serialport-parser-msp-v2"
import { Command } from "../SerialPortService"

const enum EventType {
  data = 'data',
  error = 'error'
}

const serialPorts = new Array<SerialPort>()
const mspEncoders = new Array<MspEncoder>()
const mspDecoders = new Array<MspDecoder>()

export const registerSerialPortDriverMainEvents = (ipcMain: IpcMain) => {
  ipcMain.handle(Command.list, async (event: IpcMainEvent) => event.returnValue = list())

  ipcMain.on(Command.openPort, (event: IpcMainEvent, path: string, baudrate: number) : string => event.returnValue = openPort(path, baudrate))

  ipcMain.on(Command.closePort, (_: IpcMainEvent, path: string) => closePort(path))

  ipcMain.on(Command.registerDataEventHandler, (_: IpcMainEvent, path: string, eventHandler: string) => registerDataEventHandler(path, (object: MspMsg | Error) => ipcMain.emit(eventHandler, object)))

  ipcMain.on(Command.unregisterDataEventHandler, (_: IpcMainEvent, path: string) => unregisterDataEventHandler(path))

  ipcMain.on(Command.registerErrorEventHandler, (_: IpcMainEvent, path: string, eventHandler: string) => registerErrorEventHandler(path, (data: string) => ipcMain.emit(eventHandler, data)))

  ipcMain.on(Command.unregisterErrorEventHandler, (_: IpcMainEvent, path: string) => unregisterErrorEventHandler(path))

  ipcMain.on(Command.write, (_: IpcMainEvent, path: string, object: MspMsg) => write(path, object))
}

const list = async (): Promise<PortInfo[]> => await SerialPort.list()

const openPort = (path: string, baudrate: number) => {
  closePort(path)
  const serialPort = createSerialPort(path, baudrate)
  registerSerialPort(serialPort)
  registerEncoder(serialPort)
  return path
}

const closePort = (path: string) => {
  closeSerialPort(path)
  unregisterSerialPort(path)
}

const createSerialPort = (path: string, baudrate: number): SerialPort => new SerialPort(path, { baudRate: baudrate })

const closeSerialPort = (path: string) => serialPorts[path]?.close()

const registerSerialPort = (serialPort: SerialPort) => serialPorts[serialPort.path] = serialPort

const unregisterSerialPort = (path: string) => serialPorts[path] = null

const registerEncoder = (serialPort: SerialPort) => mspEncoders[serialPort.path] = new MspEncoder().pipe(serialPort as any)

const registerDataEventHandler = (path: string, eventHandler: (object: MspMsg | Error) => boolean) => {
  const parser = serialPorts[path]?.pipe(new MspDecoder())
  mspDecoders[path] = parser
  parser?.on(EventType.data, eventHandler)
}

const unregisterDataEventHandler = (path: string) => mspDecoders[path]?.on(EventType.data, {})

const registerErrorEventHandler = (path: string, eventHandler: (message: string) => boolean) => serialPorts[path]?.on(EventType.error, eventHandler)

const unregisterErrorEventHandler = (path: string) => serialPorts[path]?.on(EventType.error, {})

const write = (path: string, object: MspMsg | Error) => mspEncoders[path]?.write(object)
