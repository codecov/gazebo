import PropTypes from 'prop-types'

import Button from 'ui/Button'
import Modal from 'ui/Modal'

const EraseRepoModal = ({ closeModal, eraseRepo, isLoading, showModal }) => {
  return (
    <Modal
      isOpen={showModal}
      onClose={closeModal}
      title="Are you sure you want to erase the repository?"
      body={
        <p>
          This will erase the repository, including all of its contents. This
          action is irreversible and will permanently erase any historical code
          coverage in Codecov for this repository. The repository will be
          recreated when resyncing the organization.
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

EraseRepoModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  eraseRepo: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
}

export default EraseRepoModal
