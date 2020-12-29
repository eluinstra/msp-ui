import _ from 'lodash'
import { MspCmd } from '@/component/msp/MspProtocol'
import { MspMsg } from '@/component/msp//MspDriver';

const hexInt = (num: number, width: number) => num.toString(16).padStart(width,"0").toUpperCase();
const hexInt8 = (num: number) => hexInt(num & 0xFF, 2);

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
  const [head, ...tail] = msg.buffer;
  return {
    acc_x: head,
    acc_y: head,
    acc_z: head,
    gyro_x: head,
    gyro_y: head,
    gyro_z: head,
    mag_x: head,
    mag_y: head,
    mag_z: tail.join(".")
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