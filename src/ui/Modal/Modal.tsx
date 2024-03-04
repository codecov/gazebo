import React, { ReactElement } from 'react'
import ReactModal from 'react-modal'

import BaseModal from './BaseModal'

const modalSizes = Object.freeze({
  medium: 'w-11/12 md:w-3/4 xl:w-1/2',
  small: 'w-3/4 md:w-2/4 xl:w-2/4 2xl:w-1/4',
})

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  body: ReactElement | string
  footer?: ReactElement
  title: ReactElement | string
  subtitle?: ReactElement | string
  hasCloseButton?: boolean
  size?: 'medium' | 'small'
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  body,
  footer,
  title,
  subtitle,
  hasCloseButton = true,
  size = 'medium',
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
          title={title}
          hasCloseButton={hasCloseButton}
          subtitle={subtitle}
          body={body}
          footer={footer}
          onClose={onClose}
        />
      </div>
    </ReactModal>
  )
}

export default Modal
