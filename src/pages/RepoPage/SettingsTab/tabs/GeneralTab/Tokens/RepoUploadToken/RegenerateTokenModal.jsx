import PropTypes from 'prop-types'

import Button from 'ui/Button'
import Modal from 'ui/Modal'

const RegenerateTokenModal = ({
  closeModal,
  regenerateToken,
  isLoading,
  showModal,
}) => (
  <Modal
    isOpen={showModal}
    onClose={closeModal}
    title="New repository upload token"
    body={
      <div className="flex  flex-col gap-4">
        <h2 className="font-semibold">Repository API token</h2>
        <span>If you save the new token, make sure to update your CI YAML</span>
      </div>
    }
    footer={
      <div className="flex gap-2">
        <div>
          <Button hook="close-modal" onClick={closeModal}>
            Cancel
          </Button>
        </div>
        <div>
          <Button
            isLoading={isLoading}
            hook="generate-token"
            variant="primary"
            onClick={() => {
              regenerateToken()
              closeModal()
            }}
          >
            Generate New Token
          </Button>
        </div>
      </div>
    }
  />
)

RegenerateTokenModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  regenerateToken: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  showModal: PropTypes.bool.isRequired,
}

export default RegenerateTokenModal
