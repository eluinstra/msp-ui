import { ProviderContext, VariantType } from 'notistack'

export const showMessage = (enqueueSnackbar, message) => handleVariant('default')(enqueueSnackbar, message)
export const showSuccess = (enqueueSnackbar, message) => handleVariant('success')(enqueueSnackbar, message)
export const showWarning = (enqueueSnackbar, message) => handleVariant('warning')(enqueueSnackbar, message)
export const showError = (enqueueSnackbar, message) => handleVariant('error')(enqueueSnackbar, message)

const handleVariant = (variant: VariantType) => (snackbar: ProviderContext['enqueueSnackbar'], message: string) => {
  snackbar(message, { variant })
}
