import PropTypes from 'prop-types'
import ReactModal from 'react-modal'

import BaseModal from './BaseModal'

const modalSizes = Object.freeze({
  medium: 'w-11/12 md:w-3/4 xl:w-1/2',
  small: 'w-3/4 md:w-2/4 xl:w-2/4 2xl:w-1/4',
})

function Modal({
  isOpen,
  onClose,
  body,
  footer,
  title,
  subtitle,
  hasCloseButton = true,
  size = 'medium',
  ...rest
}) {
  if (!isOpen) return null
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="flex h-screen w-screen items-center justify-center"
      overlayClassName="fixed inset-0 bg-gray-900 bg-opacity-75 z-10"
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

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  hasCloseButton: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  body: PropTypes.oneOfType([
    PropTypes.element.isRequired,
    PropTypes.string.isRequired,
  ]),
  footer: PropTypes.element,
  size: PropTypes.string,
}

export default Modal
