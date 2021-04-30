import React, { useEffect, useState } from 'react'
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles'
import { AppBar, CssBaseline, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography } from '@material-ui/core'
import { createDriver, getMspResponse$, MspMsg, MspState, mspRequest, useDriverEffect } from '@/component/msp/MspDriver'
import { MspCmd } from '@/component/msp/MspProtocol'
import { useStatefulObservable, useObservableEvent, useBehaviour } from '@/common/RxTools'
import { tap, map, filter, mapTo } from 'rxjs/operators'
import { respMspMsg } from '@/component/msp/MspConfigView'
import { useSnackbar } from 'notistack'

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

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export const ConfigurationPage = props => {
  const { serialPort } = props
  const { enqueueSnackbar } = useSnackbar()
  const [driver] = useState(createDriver(serialPort))
  const configMspMsg = useStatefulObservable<MspMsg>(getMspResponse$(driver)
    .pipe(
      map(respMspMsg)
  ))
  useEffect(useDriverEffect(driver, enqueueSnackbar), [])
  let intervalID;
  useEffect(() => {
    let messagenr = 1;
      intervalID = setInterval(() => {
        mspRequest(driver,MspCmd.MSP_READPARAMS,""+messagenr);
        messagenr = messagenr +1;
        if ( messagenr == 10 )
        { 
          messagenr = 1;
          clearInterval(intervalID);
        }
      }, 3000);
    return () => clearInterval(intervalID);
    mspRequest(driver,MspCmd.MSP_READPARAMS,"1")/* GPIO */
    sleep(1000).then(r => {
      // do something
      }) 
    mspRequest(driver,MspCmd.MSP_READPARAMS,"2")/* MULTIWII */
    sleep(1000).then(r => {
      // do something
      })
    mspRequest(driver,MspCmd.MSP_READPARAMS,"3")/* CANBUS */
    sleep(1000).then(r => {
      // do something
      })
    mspRequest(driver,MspCmd.MSP_READPARAMS,"4")/* PWM */
    sleep(1000).then(r => {
      // do something
      })
    mspRequest(driver,MspCmd.MSP_READPARAMS,"5")/* PID */
    sleep(1000).then(r => {
      // do something
      })
    mspRequest(driver,MspCmd.MSP_READPARAMS,"6")/* SMARTFS */
    sleep(1000).then(r => {
      // do something
      })
    mspRequest(driver,MspCmd.MSP_READPARAMS,"7")/* ADC */
    sleep(1000).then(r => {
      // do something
      })
    mspRequest(driver,MspCmd.MSP_READPARAMS,"8")/* SBUS */
    sleep(1000).then(r => {
      // do something
      })
    mspRequest(driver,MspCmd.MSP_READPARAMS,"9")/* SYSTEM */
    sleep(1000).then(r => {
      // do something
      })
    return
  }, [])
  return (
    <div>
      <h2>Configuration</h2>
      {configMspMsg}

    </div>
    
  )
}
