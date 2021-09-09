import { MspConfiguration } from '@/component/msp/MspConfiguration'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const ConfigurationPage = ({ serialPort }) => {
  const { t } = useTranslation()
  return (
    <React.Fragment>
      <h2>{t('lbl.configuration')}</h2>
      <MspConfiguration serialPort={serialPort} />
    </React.Fragment>
  )
}
