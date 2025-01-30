import React, { ReactElement } from 'react'
import ReactModal from 'react-modal'

import BaseModal from './BaseModal'

const modalSizes = Object.freeze({
  medium: 'w-11/12 md:w-3/4 xl:w-1/2 4xl:w-[1000px]',
  small: 'w-3/4 md:w-2/4 xl:w-2/4 2xl:w-1/4 3xl:w-[448px]',
})

export interface ModalProps {
  body: ReactElement | string
  customHeaderClassname?: string
  isOpen: boolean
  footer?: ReactElement
  hasCloseButton?: boolean
  onClose: () => void
  size?: 'medium' | 'small'
  subtitle?: ReactElement | string
  title: ReactElement | string
}

const Modal: React.FC<ModalProps> = ({
  body,
  customHeaderClassname,
  footer,
  hasCloseButton = true,
  isOpen,
  onClose,
  size = 'medium',
  subtitle,
  title,
  ...rest
}) => {
  if (!isOpen) return null

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="flex h-screen w-screen items-center justify-center"
      overlayClassName="fixed inset-0 bg-gray-900 bg-opacity-75 z-30"
      {...rest}
    >
      <div className={modalSizes[size]}>
        <BaseModal
          body={body}
          customHeaderClassname={customHeaderClassname}
          footer={footer}
          hasCloseButton={hasCloseButton}
          onClose={onClose}
          subtitle={subtitle}
          title={title}
        />
      </div>
    </ReactModal>
  )
}

export default Modal
