import Button from 'ui/Button'
import Modal from 'ui/Modal'

interface EraseOwnerModelProps {
  isPersonalSettings: boolean
  isLoading: boolean
  showModal: boolean
  closeModal: () => void
  eraseOwner: () => void
}

function EraseOwnerModal({
  isPersonalSettings,
  closeModal,
  eraseOwner,
  isLoading,
  showModal,
}: EraseOwnerModelProps) {
  const title = isPersonalSettings
    ? 'Are you sure you want to delete your personal account?'
    : 'Are you sure you want to erase this organization?'
  let text = isPersonalSettings
    ? 'This action will delete all personal data, including login information and personal tokens.'
    : 'This action will delete all organization content and associated tokens.'
  text +=
    ' It will also erase all of the repositories, including all of their contents.'
  text +=
    ' This action is irreversible and if you proceed, you will permanently erase all of the associated content.'
  const button = isPersonalSettings
    ? 'Erase Personal Account'
    : 'Erase Organization'

  return (
    <Modal
      isOpen={showModal}
      onClose={closeModal}
      title={title}
      body={<p>{text}</p>}
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
              hook="erase-owner-content"
              variant="danger"
              onClick={async () => {
                await eraseOwner()
                closeModal()
              }}
            >
              {button}
            </Button>
          </div>
        </div>
      }
    />
  )
}

export default EraseOwnerModal
