import _ from 'lodash'
import { MspCmd, MspMsg } from '@/component/msp/MspDriver'

const hexInt = (num: number, width: number) => num.toString(16).padStart(width,"0").toUpperCase()
const hexInt8 = (num: number) => hexInt(num & 0xFF, 2)
const int16 = (buffer: number[], index: number) => buffer[index] + (buffer[index + 1] << 8)
const string = (buffer: number[]) => buffer.reduce((p, c) => p + String.fromCharCode(c),"")
const substring = (buffer: number[], start: number, num: number) =>
  _.take(_.drop(buffer, start), num).reduce((s, n) => s + String.fromCharCode(n),"")

export const parseMspMsg = (msg: MspMsg) => mspOutputParser[msg.cmd](msg)

const parseDefault = (msg: MspMsg) => msg.buffer.map(v => hexInt8(v))

const parseString = (msg: MspMsg) => string(msg.buffer)

export const parseInt16 = (msg: MspMsg) => int16(msg.buffer, 0)

const mspOutputParser = []

Object.values(MspCmd).forEach(v => mspOutputParser[v] = parseDefault)

mspOutputParser[MspCmd.MSP_API_VERSION] = (msg: MspMsg) => {
  const [head, ...tail] = msg.buffer
  return {
    protocolVersion: head.toString(),
    apiVersion: tail.join(".")
  }
}

mspOutputParser[MspCmd.MSP_FC_VARIANT] = parseString

mspOutputParser[MspCmd.MSP_FC_VERSION] = (msg: MspMsg) => msg.buffer.join(".")

mspOutputParser[MspCmd.MSP_BOARD_INFO] = (msg: MspMsg) => {
  return {
    boardId: substring(msg.buffer, 0, 4),
    hardwareRevision: int16(msg.buffer,4),
    fcType: msg.buffer[6]
  }
}

mspOutputParser[MspCmd.MSP_BUILD_INFO] = (msg: MspMsg) => {
  return {
    buildDate: substring(msg.buffer, 0, 11),
    buildTime: substring(msg.buffer, 11, 8),
    shortGitRevision: substring(msg.buffer, 19, 7)
  }
}

mspOutputParser[MspCmd.MSP_ECHO] = parseString

mspOutputParser[MspCmd.MSP_READ_TEMP] = parseString

mspOutputParser[MspCmd.MSP_SET_TEMP_LOW] = parseInt16

mspOutputParser[MspCmd.MSP_READ_PRESS] = parseString

mspOutputParser[MspCmd.MSP_ECHO_NR] = parseInt16

mspOutputParser[MspCmd.MSP_REBOOT] = parseString

mspOutputParser[MspCmd.MSP_STATUS] = parseString

mspOutputParser[MspCmd.MSP_RAW_IMU] = (msg: MspMsg) => {
  return {
    acc_x: int16(msg.buffer,0),
    acc_y: int16(msg.buffer,2),
    acc_z: int16(msg.buffer,4),
    gyro_x: int16(msg.buffer,6),
    gyro_y: int16(msg.buffer,8),
    gyro_z: int16(msg.buffer,10),
    mag_x: int16(msg.buffer,12),
    mag_y: int16(msg.buffer,14),
    mag_z: int16(msg.buffer,16),
  }
}

mspOutputParser[MspCmd.MSP_ANALOG] = (msg: MspMsg) => {
  return {
    battery_voltage: msg.buffer[0] / 10.0,
    mah_drawn: int16(msg.buffer,1) / 1000.0,
    rssi: int16(msg.buffer,3),
     /// Current in 0.01A steps, range is -320A to 320A
    amperage: int16(msg.buffer,5) / 10.0,
    amperage_1: int16(msg.buffer,7) / 10.0
  }
}