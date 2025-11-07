import Button from 'ui/Button'
import Modal from 'ui/Modal'

interface EraseRepoModalProps {
  showModal: boolean
  closeModal: () => void
  eraseRepo: () => void
  isLoading: boolean
}

const EraseRepoModal = ({
  closeModal,
  eraseRepo,
  isLoading,
  showModal,
}: EraseRepoModalProps) => {
  return (
    <Modal
      isOpen={showModal}
      onClose={closeModal}
      title="Are you sure you want to erase the repository?"
      body={
        <p>
          This will erase the repository, including all of its contents. This
          action is irreversible and will permanently erase all data associated
          with this repository. The repository will be recreated when resyncing
          the organization.
        </p>
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
              hook="erase-repo-content"
              variant="danger"
              onClick={async () => {
                await eraseRepo()
                closeModal()
              }}
            >
              Erase Repository
            </Button>
          </div>
        </div>
      }
    />
  )
}

export default EraseRepoModal
