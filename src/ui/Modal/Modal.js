import PropTypes from 'prop-types'
import ReactModal from 'react-modal'

import Card from 'ui/Card'
import Button from 'ui/Button'
import Icon from 'ui/Icon'

ReactModal.setAppElement('#root')

function Modal({ isOpen, onClose, children, title, ...rest }) {
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
          <Button variant="text" onClick={onClose}>
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
