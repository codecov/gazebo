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
      className="h-screen w-screen flex items-center justify-center"
      overlayClassName="fixed top-0 bottom-0 left-0 right-0 bg-gray-900 bg-opacity-75"
      {...rest}
    >
      <Card className="w-1/2 p-8">
        <header className="flex justify-between items-center mb-4">
          <h2 className="text-2xl bold">{title}</h2>
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
