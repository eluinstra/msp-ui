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
