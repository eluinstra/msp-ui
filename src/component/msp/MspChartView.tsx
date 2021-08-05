import React from 'react'
import { Card, CardContent, Paper } from '@material-ui/core'
import { MspCmd } from '@/component/msp/MspProtocol'
import { MspDriver, MspMsg } from '@/component/msp/MspDriver'
import { parseMspMsg } from '@/component/msp/MspModel'
import { Chart } from '@/component/Chart'

export const viewMspChart = (driver: MspDriver, msg: MspMsg) => {
  return mspOutputFunctions[msg.cmd](driver, parseMspMsg(msg))
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

const mspOutputFunctions = []

Object.values(MspCmd).forEach(v => mspOutputFunctions[v] = renderDefault)

mspOutputFunctions[MspCmd.MSP_RAW_IMU] = (driver: MspDriver, msg: { acc_x: number, acc_y: number, acc_z: number,
                                                 gyro_x: number, gyro_y: number, gyro_z: number,
                                                 mag_x: number, mag_y: number, mag_z: number }) => {
  const datasets = [{
      type: "line",
      label: "Roll",
      backgroundColor: "green",
      borderWidth: "2",
      lineTension: 0.45,
      data: []
    }, {
      type: "line",
      label: "Pitch",
      backgroundColor: "blue",
      borderWidth: "2",
      lineTension: 0.45,
      data: []
    }, {
      type: "line",
      label: "Yaw",
      backgroundColor: "cyan",
      borderWidth: "2",
      lineTension: 0.45,
      data: []
  }]
  return (
    <Chart driver={driver} datasets={datasets} />
  )
}

mspOutputFunctions[MspCmd.MSP_ANALOG] = (driver: MspDriver, msg: { battery_voltage: number, mah_drawn: number, rssi: number, amperage: number }) => {
  const datasets = [{
    label: 'Dataset 1',
    borderColor: 'rgb(255, 99, 132)',
    backgroundColor: 'rgba(255, 99, 132, 0.5)',
    lineTension: 0,
    borderDash: [8, 4]
  }]
  return (
    <Chart driver={driver} datasets={datasets} />
  )
}
