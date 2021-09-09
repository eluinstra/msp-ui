import { PortList } from '@/component/serialport/SerialPortList'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const PortsPage = () => {
  const { t } = useTranslation()
  return (
    <React.Fragment>
      <h2>{t('lbl.ports')}</h2>
      <PortList />
    </React.Fragment>
  )
}
