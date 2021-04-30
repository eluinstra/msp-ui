import React, { useEffect, useState } from 'react'
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles'
import { AppBar, CssBaseline, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography } from '@material-ui/core'
import { createDriver, getMspResponse$, MspMsg, mspRequest, useDriverEffect } from '@/component/msp/MspDriver'
import { MspCmd } from '@/component/msp/MspProtocol'
import { useStatefulObservable, useObservableEvent, useBehaviour } from '@/common/RxTools'
import { viewMspMsg } from '@/component/msp/MspView'
import { map, filter, mapTo } from 'rxjs/operators'

import ThumbUpTwoToneIcon from '@material-ui/icons/ThumbUpTwoTone';
import ThumbDownTwoToneIcon from '@material-ui/icons/ThumbDownTwoTone';

const MenuListItem = props => {
  const { serialPort, icon, text } = props
  return (
    <ListItem>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={text} />
    </ListItem>
  )
}

export const ConfigurationPage = props => {
  const { serialPort } = props
  const [driver] = useState(createDriver(serialPort))
  const mspMsg = useStatefulObservable<MspMsg>(getMspResponse$(driver)
  .pipe(
    map(viewMspMsg)
  ))
  useEffect(() => {
    mspRequest(driver,MspCmd.MSP_ECHO,"100")
    return
  })
  return (
    <div>
      <h2>Configuration</h2>
      {mspMsg}

      <List>
        <MenuListItem serialPort={serialPort} text="CANBUS" icon={<ThumbUpTwoToneIcon />} />
        <MenuListItem serialPort={serialPort} text="SYSTEM" icon={<ThumbDownTwoToneIcon />} />
      </List>
    </div>
    
  )
}
