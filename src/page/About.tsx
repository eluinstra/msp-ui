import { remote } from 'electron'
import React from 'react'
import { Card, CardContent } from '@material-ui/core'

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

export const AboutPage = () => {
  return (
    <React.Fragment>
      <h2>About</h2>
      <Card>
        <CardContent>
          {['node', 'electron', 'chrome'].map(a => <React.Fragment key={a}>{capitalize(a) + ': ' + process.versions[a]}<br /></React.Fragment>)}
          SerialPort: {remote.require('serialport/package').version}
        </CardContent>
      </Card>
    </React.Fragment>
  )
}
