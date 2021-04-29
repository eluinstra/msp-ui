import React, { useEffect, useState } from 'react'
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles'
import { AppBar, CssBaseline, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography } from '@material-ui/core'

import ThumbUpTwoToneIcon from '@material-ui/icons/ThumbUpTwoTone';
import ThumbDownTwoToneIcon from '@material-ui/icons/ThumbDownTwoTone';

const MenuListItem = props => {
  const { text, to, icon } = props
  return (
    <ListItem button key={text} >
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={text} />
    </ListItem>
  )
}

export const ConfigurationPage = () => {
  return (
    <div>
      <h2>Configuration</h2>

      <List>
        <MenuListItem text="CANBUS" to="/" icon={<ThumbUpTwoToneIcon />} />
        <MenuListItem text="SYSTEM" to="/settings" icon={<ThumbDownTwoToneIcon />} />
      </List>
    </div>
    
  )
}
