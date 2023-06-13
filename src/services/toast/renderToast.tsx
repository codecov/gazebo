/* eslint-disable react/prop-types */
import { toast, type ToastOptions } from 'react-hot-toast'

import GenericToast from './GenericToast'

const TOAST_DURATION = 4000

export interface ToastProps {
  title: string
  content: string
}

// TODO: once new designs have been done up for new toasts
export type ToastTypes = 'generic' // | 'success' | ...

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

  // TODO: once new designs have been done up for new toasts
  switch (type) {
    // case 'success':
    //   component = <SuccessToast title={title} content={content} />
    //   break
    // ...
    default:
      component = <GenericToast title={title} content={content} />
  }

  toast.custom(component, {
    duration: TOAST_DURATION,
    position: 'bottom-right',
    ...options,
  })
}
