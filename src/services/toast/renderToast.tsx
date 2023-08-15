import { toast, type ToastOptions } from 'react-hot-toast'

import ErrorToast from './ErrorToast'
import GenericToast from './GenericToast'

const TOAST_DURATION = 4000

export interface ToastProps {
  title: string
  content: string
}

export type ToastTypes = 'generic' | 'error'

export interface ToastArgs {
  title: string
  content: string
  type?: ToastTypes
  options?: ToastOptions
}

export const renderToast = ({
  title,
  content,
  type = 'generic',
  options = { duration: TOAST_DURATION },
}: ToastArgs) => {
  let component = <GenericToast title={title} content={content} />

  switch (type) {
    case 'error':
      component = <ErrorToast title={title} content={content} />
      break
    default:
      component = <GenericToast title={title} content={content} />
  }

  toast.custom(component, {
    duration: TOAST_DURATION,
    position: 'bottom-right',
    ...options,
  })
}
