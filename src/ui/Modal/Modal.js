import PropTypes from 'prop-types'
import ReactModal from 'react-modal'

import BaseModal from './BaseModal'

function Modal({
  isOpen,
  onClose,
  body,
  footer,
  title,
  subtitle,
  hasCloseButton = true,
  ...rest
}) {
  if (!isOpen) return null
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="h-screen w-screen flex items-center justify-center"
      overlayClassName="fixed top-0 bottom-0 left-0 right-0 bg-gray-900 bg-opacity-75 z-10"
      {...rest}
    >
      <div className="w-1/2">
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
}

export default Modal
