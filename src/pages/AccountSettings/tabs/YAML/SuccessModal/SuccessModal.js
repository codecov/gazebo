import Modal from 'ui/Modal'
import Button from 'ui/Button'
import PropTypes from 'prop-types'

function ResModal({ closeModal, owner, ...props }) {
  const title = 'Yaml configuration updated'
  const body = (
    <p>
      {owner} yaml configuration has been successfully saved. New coverage
      reports will reflect these changes. Repositories with a codecov.yaml file
      extend this account level Codecov config.
    </p>
  )

  return (
    <Modal
      shouldCloseOnOverlayClick={true}
      onClose={() => closeModal()}
      title={title}
      body={body}
      footer={<Button onClick={closeModal}>Done</Button>}
      {...props}
    />
  )
}

ResModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  owner: PropTypes.string.isRequired,
}

export default ResModal
