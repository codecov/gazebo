import PropTypes from 'prop-types'

import Button from 'ui/Button'
import Modal from 'ui/Modal'

const RegenerateProfilingTokenModal = ({
  closeModal,
  regenerateToken,
  isLoading,
}) => (
  <Modal
    isOpen={true}
    onClose={closeModal}
    title="New impact analysis token"
    body={
      <div className="flex  flex-col gap-4">
        <h2 className="font-semibold">Impact Analysis</h2>
        <p>If you save the new token, make sure to update your CI yml</p>
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
  closeModal: PropTypes.func.isRequired,
  regenerateToken: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
}

export default RegenerateProfilingTokenModal
