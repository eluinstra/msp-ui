import { remote } from 'electron'
const SerialPort = remote.require('serialport')

export const serialPort = new SerialPort('/dev/ttyUSB0', { baudRate: 115200 })
