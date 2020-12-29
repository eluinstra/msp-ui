import React from 'react'
import { Card, CardContent, Paper } from '@material-ui/core';
import { MspCmd } from '@/component/msp/MspProtocol'
import { MspMsg } from '@/component/msp/MspDriver';
import { parseMspMsg } from '@/component/msp/MspModel';

export const viewMspMsg = (msg: MspMsg) => {
  return mspOutputFunctions[msg.cmd](parseMspMsg(msg))
}

const renderDefault = (msg: string) => {
  return (
    <Card>
      <CardContent>
        Raw output: {msg}
      </CardContent>
    </Card>
  )
}

const mspOutputFunctions = [];

Object.values(MspCmd).forEach(v => mspOutputFunctions[v] = renderDefault)

mspOutputFunctions[MspCmd.MSP_API_VERSION] = (msg: { protocolVersion: string, apiVersion: string }) => {
  return (
    <Card>
      <CardContent>
        Protocol version: {msg.protocolVersion}
        <br />
        API version: {msg.apiVersion}
      </CardContent>
    </Card>
  )
}

mspOutputFunctions[MspCmd.MSP_FC_VARIANT] = (msg: string) => {
  return (
    <Card>
      <CardContent>
        Variant: {msg}
      </CardContent>
    </Card>
  )
}

mspOutputFunctions[MspCmd.MSP_FC_VERSION] = (msg: string) => {
  return (
    <Card>
      <CardContent>
        Version: {msg}
      </CardContent>
    </Card>
  )
}

mspOutputFunctions[MspCmd.MSP_BOARD_INFO] = (msg: { boardId: string, hardwareRevision: number, fcType: number }) => {
  return (
    <Card>
      <CardContent>
        Board ID: {msg.boardId}
        <br />
        Hardware Revision: {msg.hardwareRevision}
        <br />
        FC Type: {msg.fcType}
      </CardContent>
    </Card>
  )
}

mspOutputFunctions[MspCmd.MSP_BUILD_INFO] = (msg: { buildDate: string, buildTime: string, shortGitRevision: string }) => {
  return (
    <Card>
      <CardContent>
        Build Date: {msg.buildDate}
        <br />
        Build Time: {msg.buildTime}
        <br />
        Git Revision: {msg.shortGitRevision}
      </CardContent>
    </Card>
  )
}

mspOutputFunctions[MspCmd.MSP_RAW_IMU] = (msg: { acc_x: number, acc_y: number, acc_z: number,
                                                 gyro_x: number, gyro_y: number, gyro_z: number,
                                                 mag_x: number, mag_y: number, mag_z: number }) => {
  return (
    <Card>
      <CardContent>
        AX: {msg.acc_x}
        <br />
        AY: {msg.acc_y}
        <br />
        AZ: {msg.acc_z}
        <br />
        GYROX: {msg.gyro_x}
        <br />
        GYROY: {msg.gyro_y}
        <br />
        GYROZ: {msg.gyro_z}
        <br />
        MAGX: {msg.mag_x}
        <br />
        MAGY: {msg.mag_y}
        <br />
        MAGZ: {msg.mag_z}
      </CardContent>
    </Card>
  )
}

mspOutputFunctions[MspCmd.MSP_ANALOG] = (msg: { battery_voltage: number, mah_drawn: number, rssi: number, amperage: number}) => {
return (
<Card>
<CardContent>
Battery voltage: {msg.battery_voltage}
<br />
mAh drawn: {msg.mah_drawn}
<br />
RSSI: {msg.rssi}
<br />
Amperage: {msg.amperage}
</CardContent>
</Card>
)
}
