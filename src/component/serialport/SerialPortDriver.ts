import { remote } from 'electron'
import { BehaviorSubject, from, Subject } from 'rxjs'
import { startWith } from 'rxjs/operators'
import { PortInfo } from 'serialport'
const SerialPort = remote.require('serialport')
import { log_2_redis } from "../../services/log-driver";

export const serialPort1 = new BehaviorSubject(undefined)
export const serialPort2 = new BehaviorSubject(undefined)
// serialPort.next(new SerialPort('/dev/ttyUSB0', { baudRate: 115200 }))

export const openPort1 = (port1, baudrate) => {
  baudrate = 115200;
  serialPort1.next(new SerialPort("COM4", { baudRate: baudrate }))
}

export const openPort2 = (port2, baudrate) => {
  baudrate = 115200;
  serialPort2.next(new SerialPort("COM11", { baudRate: baudrate }))
}

export const closePort = () => {
  log_2_redis('Port closed\n')
  serialPort1.value.close()
  serialPort1.next(undefined)
  serialPort2.value.close()
  serialPort2.next(undefined)
}

export const baudrates = [9600, 19200, 38400, 57600, 115200]
export const defaultBaudrate = 115200
export const portInfo$ = () => {
  return from(SerialPort.list() as Promise<PortInfo[]>)
}
