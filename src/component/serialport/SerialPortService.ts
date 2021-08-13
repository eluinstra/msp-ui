import { PortInfo as SerialPortInfo } from "serialport"

type PortInfo = SerialPortInfo

export enum Command {
  list = 'SerialPort.list',
  openPort = 'SerialPort.openPort',
  closePort = 'SerialPort.closePort',
  onDataReceived = 'SerialPort.onDataReceived',
  registerDataEventHandler = 'SerialPort.registerDataEventHandler',
  unregisterDataEventHandler = 'SerialPort.unregisterDataEventHandler',
  onErrorReceived = 'SerialPort.onErrorReceived',
  registerErrorEventHandler = 'SerialPort.registerErrorEventHandler',
  unregisterErrorEventHandler = 'SerialPort.unregisterErrorEventHandler',
  write = 'SerialPort.registerErrorEventHandler'
}

export interface SerialPortService {
  list(): Promise<PortInfo[]>
  openPort(path: string, baudrate: number): string
  closePort(path: string): void
  registerDataEventHandler(path: string, eventHandler: string): void
  unregisterDataEventHandler(path: string): void
  registerErrorEventHandler(path: string, eventHandler: string): void
  unregisterErrorEventHandler(path: string): void
  write(path: string, buffer: Buffer): void
}