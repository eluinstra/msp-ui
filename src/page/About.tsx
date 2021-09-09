import { Card, CardContent } from '@material-ui/core'
import { remote } from 'electron'
import React from 'react'
import { useTranslation } from 'react-i18next'

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

export const AboutPage = () => {
  const { t } = useTranslation()
  return (
    <React.Fragment>
      <h2>{t('lbl.about')}</h2>
      <Card>
        <CardContent>
          {['node', 'electron', 'chrome'].map(a => <React.Fragment key={a}>{capitalize(a) + ': ' + process.versions[a]}<br /></React.Fragment>)}
          SerialPort: {remote.require('serialport/package').version}
        </CardContent>
      </Card>
    </React.Fragment>
  )
}
