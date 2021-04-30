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