import React from 'react'
import { Card, CardContent } from '@material-ui/core'
import { MspCmd } from '@/component/msp/MspProtocol'
import { MspMsg, MspState } from '@/component/msp/MspDriver'
import { parseMspMsg } from '@/component/msp/MspModel'
import { AppBar, CssBaseline, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography } from '@material-ui/core'
import ThumbUpTwoToneIcon from '@material-ui/icons/ThumbUpTwoTone';
import ThumbDownTwoToneIcon from '@material-ui/icons/ThumbDownTwoTone';

export const respMspMsg = (msg: MspMsg) => msg.state == MspState.MSP_COMMAND_RECEIVED ? mspOutputFunctions[msg.cmd](parseMspMsg(msg)) : console.log(msg)

let valuegpio = <ThumbDownTwoToneIcon />;
let valuemultiwii = <ThumbDownTwoToneIcon />;
let valuecanbus = <ThumbDownTwoToneIcon />;
let valuepwm = <ThumbDownTwoToneIcon />;
let valuepid = <ThumbDownTwoToneIcon />;
let valuesmartfs = <ThumbDownTwoToneIcon />;
let valueadc = <ThumbDownTwoToneIcon />;
let valuesbus = <ThumbDownTwoToneIcon />;
let valuesystem = <ThumbDownTwoToneIcon />;

const renderError = (msg: MspMsg) => {
  return (
    <Card>
      <CardContent>
        MSP error received! {msg}
      </CardContent>
    </Card>
  )
}

const renderDefault = (msg: string) => {
  return (
    <Card>
      <CardContent>
        [Raw] output: {msg}
      </CardContent>
    </Card>
  )
}

const MenuListItem = props => {
  const { serialPort, icon, text } = props
  return (
    <ListItem>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={text} />
    </ListItem>
  )
}

const mspOutputFunctions = []

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

mspOutputFunctions[MspCmd.MSP_READPARAMS] = (msg: string) => {
  var res = msg.split("_");
  if (res[0] == "1" && res[1] == "1")
  {
    valuegpio = <ThumbUpTwoToneIcon />;
  }
  if (res[0] == "2" && res[1] == "1")
  {
    valuemultiwii = <ThumbUpTwoToneIcon />;
  }
  if (res[0] == "3" && res[1] == "1")
  {
    valuecanbus = <ThumbUpTwoToneIcon />;
  }
  if (res[0] == "4" && res[1] == "1")
  {
    valuepwm = <ThumbUpTwoToneIcon />;
  }
  if (res[0] == "5" && res[1] == "1")
  {
    valuepid = <ThumbUpTwoToneIcon />;
  }
  if (res[0] == "6" && res[1] == "1")
  {
    valuesmartfs = <ThumbUpTwoToneIcon />;
  }
  if (res[0] == "7" && res[1] == "1")
  {
    valueadc = <ThumbUpTwoToneIcon />;
  }
  if (res[0] == "8" && res[1] == "1")
  {
    valuesbus = <ThumbUpTwoToneIcon />;
  }
  if (res[0] == "9" && res[1] == "1")
  {
    valuesystem = <ThumbUpTwoToneIcon />;
  }
  return (
    <List>
    <MenuListItem text="GPIO" icon={valuegpio} />
    <MenuListItem text="MULTIWII" icon={valuemultiwii} />
    <MenuListItem text="CANBUS" icon={valuecanbus} />
    <MenuListItem text="PWM" icon={valuepwm} />
    <MenuListItem text="PID" icon={valuepid} />
    <MenuListItem text="SMARTFS" icon={valuesmartfs} />
    <MenuListItem text="ADC" icon={valueadc} />
    <MenuListItem text="SBUS" icon={valuesbus} />
    <MenuListItem text="SYSTEM" icon={valuesystem} />
    </List>
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

mspOutputFunctions[MspCmd.MSP_SAVE] = (msg: string) => {
  return (
    <Card>
      <CardContent>
        Respons: {msg}
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

mspOutputFunctions[MspCmd.MSP_ECHO] = (msg: string) => {
  return (
    <Card>
      <CardContent>
        Echo: {msg}
      </CardContent>
    </Card>
  )
}

mspOutputFunctions[MspCmd.MSP_SET_FB_STEER_LOW] = (msg: string) => {
  return (
    <Card>
      <CardContent>
        Waarde: {msg}
      </CardContent>
    </Card>
  )
}

mspOutputFunctions[MspCmd.MSP_SET_FB_STEER_HIGH] = (msg: string) => {
  return (
    <Card>
      <CardContent>
        Waarde: {msg}
      </CardContent>
    </Card>
  )
}

mspOutputFunctions[MspCmd.MSP_SET_FB_BRAKE_LOW] = (msg: string) => {
  return (
    <Card>
      <CardContent>
        Waarde: {msg}
      </CardContent>
    </Card>
  )
}

mspOutputFunctions[MspCmd.MSP_SET_FB_BRAKE_HIGH] = (msg: string) => {
  return (
    <Card>
      <CardContent>
        Waarde: {msg}
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

mspOutputFunctions[MspCmd.MSP_ANALOG] = (msg: { battery_voltage: number, mah_drawn: number, rssi: number, amperage: number }) => {
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
