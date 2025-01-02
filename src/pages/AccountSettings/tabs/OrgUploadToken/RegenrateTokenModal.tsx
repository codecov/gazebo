import Button from 'ui/Button'
import Modal from 'ui/Modal'

const RegenerateTokenModal = ({
  closeModal,
  regenerateToken,
  isLoading,
}: {
  closeModal: () => void
  regenerateToken: () => Promise<unknown>
  isLoading: boolean
}) => (
  <Modal
    isOpen={true}
    onClose={closeModal}
    title="Confirm new upload token"
    body={
      <div className="flex  flex-col gap-4">
        <h2 className="font-semibold">
          Are you sure you want to regenerate the global token?
        </h2>
        <span>
          If you regenerate this token you will need to update every repository
          in your organization that is currently using it to use the new token.
          Otherwise, those repos may no longer be able to upload to Codecov.
        </span>
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
            Save New Token
          </Button>
        </div>
      </div>
    }
  />
)

export default RegenerateTokenModal
