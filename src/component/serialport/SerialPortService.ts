import { IpcRenderer } from "electron";
import { IpcRendererEvent } from "electron/renderer";
import { PortInfo as SerialPortInfo } from 'serialport'

type PortInfo = SerialPortInfo

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

export const serialPortService = {
  list: async (ipcRenderer: IpcRenderer): Promise<PortInfo[]> => await ipcRenderer.invoke(Command.list),

  openPort: (ipcRenderer: IpcRenderer, path: string, baudrate: number): string => ipcRenderer.sendSync(Command.openPort, path, baudrate),

  closePort: (ipcRenderer: IpcRenderer, path: string): void => ipcRenderer.send(Command.closePort, path),

  onDataReceived: (ipcRenderer: IpcRenderer, fn: (buffer: Buffer) => void): IpcRenderer => ipcRenderer.on(Command.onDataReceived, (event: IpcRendererEvent, buffer: Buffer) => fn(buffer)),

  registerDataEventHandler: (ipcRenderer: IpcRenderer, path: string): void => ipcRenderer.send(Command.registerDataEventHandler, path, Command.onDataReceived),

  unregisterDataEventHandler: (ipcRenderer: IpcRenderer, path: string): void => ipcRenderer.send(Command.unregisterDataEventHandler, path),

  onErrorReceived: (ipcRenderer: IpcRenderer, fn: (buffer: Buffer) => void): IpcRenderer => ipcRenderer.on(Command.onErrorReceived, (event: IpcRendererEvent, buffer: Buffer) => fn(buffer)),

  registerErrorEventHandler: (ipcRenderer: IpcRenderer, path: string): void => ipcRenderer.send(Command.registerErrorEventHandler, path, Command.onErrorReceived),

  unregisterErrorEventHandler: (ipcRenderer: IpcRenderer, path: string): void => ipcRenderer.send(Command.unregisterErrorEventHandler, path),

  write: (ipcRenderer: IpcRenderer, path: string, buffer: Buffer): void => ipcRenderer.send(Command.write, path, buffer)
}