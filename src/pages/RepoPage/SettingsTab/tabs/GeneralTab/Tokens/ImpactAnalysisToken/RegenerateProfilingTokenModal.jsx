import PropTypes from 'prop-types'

import Button from 'ui/Button'
import Modal from 'ui/Modal'

const RegenerateProfilingTokenModal = ({
  showModal,
  regenerateToken,
  isLoading,
  closeModal,
}) => (
  <Modal
    isOpen={showModal}
    onClose={closeModal}
    title="New impact analysis token"
    body={
      <div className="flex  flex-col gap-4">
        <h2 className="font-semibold">Impact Analysis</h2>
        <p>If you save the new token, make sure to update your CI YAML</p>
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
            onClick={async () => {
              await regenerateToken()
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

RegenerateProfilingTokenModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  regenerateToken: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
}

export default RegenerateProfilingTokenModal
