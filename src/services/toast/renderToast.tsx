/* eslint-disable react/prop-types */
import { toast, type ToastOptions } from 'react-hot-toast'

import GenericToast from './GenericToast'

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
  options = { duration: 4000 },
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
    duration: 5000,
    position: 'bottom-right',
    ...options,
  })
}
