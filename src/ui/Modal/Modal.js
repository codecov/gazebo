import PropTypes from 'prop-types'
import ReactModal from 'react-modal'

import Icon from 'ui/Icon'

function Modal({ isOpen, onClose, body, footer, title, ...rest }) {
  if (!isOpen) return null
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="h-screen w-screen flex items-center justify-center"
      overlayClassName="fixed top-0 bottom-0 left-0 right-0 bg-gray-900 bg-opacity-75"
      {...rest}
    >
      <div className="w-1/2 bg-white rounded">
        <header className="flex justify-between items-center p-4">
          <h2 className="font-semibold">{title}</h2>
          <span
            className="cursor-pointer fill-current text-ds-gray-septenary"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="x" />
          </span>
        </header>
        {body && (
          <div className="w-full p-4 text-ds-gray-octonary border-t text-sm">
            {body}
          </div>
        )}
        {footer && (
          <footer className="border-t flex justify-end rounded-b p-4 bg-ds-gray-primary">
            {footer}
          </footer>
        )}
      </div>
    </ReactModal>
  )
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  body: PropTypes.oneOfType([
    PropTypes.element.isRequired,
    PropTypes.string.isRequired,
  ]),
  footer: PropTypes.element,
}

export default Modal
