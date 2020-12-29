import _ from 'lodash'
import { MspCmd } from '@/component/msp/MspProtocol'
import { MspMsg } from '@/component/msp//MspDriver';

const hexInt = (num: number, width: number) => num.toString(16).padStart(width,"0").toUpperCase();
const hexInt8 = (num: number) => hexInt(num & 0xFF, 2);

const int16 = (buffer: number[], index: number) => (buffer[index + 1] << 8) + buffer[index]

export const parseMspMsg = (msg: MspMsg) => {
  return mspOutputParser[msg.cmd](msg)
}

const parseDefault = (msg: MspMsg) => {
  return msg.buffer.map(v => hexInt8(v))
}

const parseString = (msg: MspMsg) => {
  return _.takeWhile(msg.buffer, n => n != 0).reduce((s, n) => s + String.fromCharCode(n),"")
}

const mspOutputParser = [];

Object.values(MspCmd).forEach(v => mspOutputParser[v] = parseDefault)

mspOutputParser[MspCmd.MSP_API_VERSION] = (msg: MspMsg) => {
  const [head, ...tail] = msg.buffer;
  return {
    protocolVersion: head.toString(),
    apiVersion: tail.join(".")
  }
}

mspOutputParser[MspCmd.MSP_FC_VARIANT] = parseString

mspOutputParser[MspCmd.MSP_FC_VERSION] = (msg: MspMsg) => {
  return msg.buffer.join(".")
}

mspOutputParser[MspCmd.MSP_BOARD_INFO] = (msg: MspMsg) => {
   const [head, ...tail] = msg.buffer;
    return {
      board_id: head.toString(),
      hardware_revision: head.toString(),
      fc_type: tail.join(".")
    }
}

mspOutputParser[MspCmd.MSP_BUILD_INFO] = (msg: MspMsg) => {
    const [head, ...tail] = msg.buffer;
    return {
      date_str: head.toString(),
      time_str: head.toString(),
      git_str: tail.join(".")
    }
}

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
  const [head, ...tail] = msg.buffer;
  return {
    battery_voltage: head,
    mah_drawn: head,
    rssi: head,
     /// Current in 0.01A steps, range is -320A to 320A
    amperage: tail.join(".")
  }
}