import PropTypes from 'prop-types'

import Button from 'ui/Button'
import Modal from 'ui/Modal'

const DeactivateRepoModal = ({
  closeModal,
  deactivateRepo,
  isLoading,
  activated,
}) => (
  <Modal
    isOpen={true}
    onClose={closeModal}
    title="Are you sure you want to deactivate the repo?"
    body={
      <p>
        Deactivate repo will deactivate a repo and prevent the upload of
        coverage information to that repo going forward. You will be able to
        reactivate the repo at any time.
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
            hook="deactivate-repo"
            variant="danger"
            onClick={async () => {
              await deactivateRepo(activated)
              closeModal()
            }}
          >
            Deactivate repo
          </Button>
        </div>
      </div>
    }
  />
)

DeactivateRepoModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  deactivateRepo: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  activated: PropTypes.bool.isRequired,
}

export default DeactivateRepoModal
