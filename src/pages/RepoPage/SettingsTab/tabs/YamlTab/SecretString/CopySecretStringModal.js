import PropTypes from 'prop-types'

import Button from 'ui/Button'
import Modal from 'ui/Modal'
import TokenWrapper from 'ui/TokenWrapper'

const CopySecretStringModal = ({ closeModal, isLoading, value }) => {
  return (
    <Modal
      isOpen={true}
      onClose={closeModal}
      title="New secret string"
      body={<TokenWrapper token={value} />}
      footer={
        <Button
          isLoading={isLoading}
          hook="close-modal"
          variant="primary"
          onClick={() => closeModal()}
        >
          Close
        </Button>
      }
    />
  )
}

CopySecretStringModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  value: PropTypes.string.isRequired,
}

export default CopySecretStringModal
