import { remote } from 'electron'
import React from 'react'
import { Paper, Typography } from '@material-ui/core'

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

export const About = () => {
  return (
    <React.Fragment>
      <h2>About</h2>
      <Paper>
        <Typography variant="body2" component="p">
          {['node', 'electron', 'chrome'].map(a => <React.Fragment>{capitalize(a) + ': ' + process.versions[a]}<br /></React.Fragment>)}
          SerialPort: {remote.require('serialport/package').version}
        </Typography>
      </Paper>
    </React.Fragment>
  )
}
