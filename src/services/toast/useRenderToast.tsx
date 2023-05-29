/* eslint-disable react/prop-types */
import { toast, type ToastOptions } from 'react-hot-toast'

import GenericToast from './GenericToast'

export interface ToastProps {
  title: string
  content: string
}

export type ToastTypes = 'generic' // | 'success' | ...

export interface ToastArgs {
  title: string
  content: string
  type?: ToastTypes
  options?: ToastOptions
}

const renderToast = ({
  title,
  content,
  type = 'generic',
  options = {},
}: ToastArgs) => {
  let component = <GenericToast title={title} content={content} />

  // TODO: once new designs have been done up for new toasts
  // if (type === "success") {
  //   component = ...
  // }

  toast.custom(component, {
    duration: 5000,
    position: 'bottom-right',
    ...options,
  })
}

export const useRenderToast = () => ({
  renderToast,
})
