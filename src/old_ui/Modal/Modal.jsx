import PropTypes from 'prop-types'
import ReactModal from 'react-modal'

import Button from 'old_ui/Button'
import Card from 'old_ui/Card'
import Icon from 'old_ui/Icon'

function Modal({ isOpen, onClose, children, title, ...rest }) {
  if (!isOpen) return null
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="flex h-screen w-screen items-center justify-center"
      overlayClassName="fixed inset-0 bg-gray-900 bg-opacity-75"
      {...rest}
    >
      <Card variant="old" className="w-1/2 p-8">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl">{title}</h2>
          <Button variant="text" onClick={onClose} aria-label="Close">
            <Icon name="times" />
          </Button>
        </header>
        {children}
      </Card>
    </ReactModal>
  )
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
}

export default Modal
