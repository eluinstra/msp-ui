import { MspInput } from '@/component/msp/MspInput'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const MspInputPage = ({ serialPort }) => {
  const { t } = useTranslation()
  return (
    <React.Fragment>
      <h2>{t('lbl.msp')}</h2>
      <MspInput serialPort={serialPort} />
    </React.Fragment>
  )
}
