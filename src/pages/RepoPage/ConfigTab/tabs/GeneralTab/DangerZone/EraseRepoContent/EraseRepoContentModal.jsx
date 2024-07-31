import PropTypes from 'prop-types'

import Button from 'ui/Button'
import Modal from 'ui/Modal'

const EraseRepoContentModal = ({
  closeModal,
  eraseRepoContent,
  isLoading,
  showModal,
}) => {
  return (
    <Modal
      isOpen={showModal}
      onClose={closeModal}
      title="Are you sure you want to erase the repo coverage content?"
      body={
        <p>
          This will erase repo coverage content should erase all coverage data
          contained in the repo. This action is irreversible and if you proceed,
          you will permanently erase any historical code coverage in Codecov for
          this repository.
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
                await eraseRepoContent()
                closeModal()
              }}
            >
              Erase Content
            </Button>
          </div>
        </div>
      }
    />
  )
}

EraseRepoContentModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  eraseRepoContent: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
}

export default EraseRepoContentModal
