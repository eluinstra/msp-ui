import React from 'react'
import { useTranslation } from 'react-i18next'

export const HomePage = () => {
  const { t } = useTranslation()
  return (
    <h2>{t('lbl.home')}</h2>
  )
}
