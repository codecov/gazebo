import PropTypes from 'prop-types'

import Button from 'ui/Button'
import Modal from 'ui/Modal'

function SuccessModal({ closeModal, owner, ...props }) {
  const title = 'YAML configuration updated'
  const body = (
    <p>
      {owner} YAML configuration has been successfully saved. New coverage
      reports will reflect these changes. Repositories with a codecov.yaml file
      extend and override this account level Codecov config.
    </p>
  )

  return (
    <Modal
      shouldCloseOnOverlayClick={true}
      onClose={() => closeModal()}
      title={title}
      body={body}
      footer={
        <Button hook="close-modal" onClick={closeModal}>
          Done
        </Button>
      }
      {...props}
    />
  )
}

SuccessModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  owner: PropTypes.string.isRequired,
}

export default SuccessModal
