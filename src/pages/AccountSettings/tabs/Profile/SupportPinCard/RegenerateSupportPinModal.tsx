import Button from 'ui/Button'
import Modal from 'ui/Modal'

const RegenerateSupportPinModal = ({
  closeModal,
  regeneratePin,
  isLoading,
}: {
  closeModal: () => void
  regeneratePin: () => Promise<unknown>
  isLoading: boolean
}) => (
  <Modal
    isOpen={true}
    onClose={closeModal}
    title="Confirm new support PIN"
    body={
      <div className="flex flex-col gap-4">
        <h2 className="font-semibold">
          Are you sure you want to regenerate your support PIN?
        </h2>
        <span>
          Your current PIN will stop working immediately. If you previously
          shared it with a support agent, you will need to provide the new PIN.
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
            hook="regenerate-support-pin"
            variant="primary"
            onClick={async () => {
              await regeneratePin()
              closeModal()
            }}
          >
            Generate New PIN
          </Button>
        </div>
      </div>
    }
  />
)

export default RegenerateSupportPinModal
