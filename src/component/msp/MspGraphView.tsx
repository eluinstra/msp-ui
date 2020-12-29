import React from 'react'
import { Card, CardContent, Paper } from '@material-ui/core';
import { MspCmd } from '@/component/msp/MspProtocol'
import { MspMsg } from '@/component/msp/MspDriver';
import { parseMspMsg } from '@/component/msp/MspModel';
import { Graph } from '@/component/Graph';

export const viewMspGraph = (msg: MspMsg) => {
  return mspOutputFunctions[msg.cmd](parseMspMsg(msg))
}

const renderDefault = (msg: string) => {
  return (
    <Card>
      <CardContent>
        No graph available
      </CardContent>
    </Card>
  )
}

const mspOutputFunctions = [];

Object.values(MspCmd).forEach(v => mspOutputFunctions[v] = renderDefault)

mspOutputFunctions[MspCmd.MSP_RAW_IMU] = (msg: { acc_x: number, acc_y: number, acc_z: number,
                                                 gyro_x: number, gyro_y: number, gyro_z: number,
                                                 mag_x: number, mag_y: number, mag_z: number }) => {
  const datasets = [{
    label: 'Dataset 1',
    borderColor: 'rgb(255, 99, 132)',
    backgroundColor: 'rgba(255, 99, 132, 0.5)',
    lineTension: 0,
    borderDash: [8, 4]
  }, {
    label: 'Dataset 2',
    borderColor: 'rgb(54, 162, 235)',
    backgroundColor: 'rgba(54, 162, 235, 0.5)'
  }]
  return (
    <Graph datasets={datasets} />
  )
}

mspOutputFunctions[MspCmd.MSP_ANALOG] = (msg: { battery_voltage: number, mah_drawn: number, rssi: number, amperage: number }) => {
  const datasets = [{
    label: 'Dataset 1',
    borderColor: 'rgb(255, 99, 132)',
    backgroundColor: 'rgba(255, 99, 132, 0.5)',
    lineTension: 0,
    borderDash: [8, 4]
  }]
  return (
    <Graph datasets={datasets} />
  )
}
