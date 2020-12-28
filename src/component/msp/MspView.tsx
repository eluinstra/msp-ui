import React from 'react'
import { MspCmd } from '@/component/msp/MspProtocol'
import { MspMsg } from '@/component/msp/MspDriver';
import { Card, CardContent, Paper } from '@material-ui/core';
import { parseMspMsg } from '@/component/msp/MspModel';

export const viewMspMsg = (msg: MspMsg) => {
  return mspOutputFunctions[msg.cmd](parseMspMsg(msg))
}

const mspOutputFunctions = [];

const renderDefault = (msg: string) => {
  return (
    <Card>
      <CardContent>
        Raw output: {msg}
      </CardContent>
    </Card>
  )
}

const renderString = (msg: string) => {
  return (
    <Card>
      <CardContent>
        {msg}
      </CardContent>
    </Card>
  )
}

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

mspOutputFunctions[MspCmd.MSP_FC_VARIANT] = renderString
