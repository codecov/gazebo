import PropTypes from 'prop-types'

import { useDeleteFlag } from 'services/deleteFlag'
import Button from 'ui/Button'
import Modal from 'ui/Modal'

const DeleteFlagModal = ({ flagName, closeModal, isOpen }) => {
  const { mutate } = useDeleteFlag()

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      hasCloseButton={true}
      size="small"
      title={<span className="text-lg">Delete Flag</span>}
      body={
        <p>
          This will remove the <span className="font-semibold">{flagName}</span>{' '}
          flag from the reports in app. You will also need to remove this flag
          in your CI and codecov.yaml to stop uploads.
        </p>
      }
      footer={
        <div className="flex gap-2">
          <button
            className="flex-none font-semibold text-ds-blue"
            onClick={() => {
              closeModal()
            }}
          >
            Cancel
          </button>
          <div>
            <Button
              hook="update-default-org"
              variant="danger"
              onClick={() => {
                mutate({ flagName })
                closeModal()
              }}
            >
              Delete flag
            </Button>
          </div>
        </div>
      }
    />
  )
}

DeleteFlagModal.propTypes = {
  flagName: PropTypes.string,
  closeModal: PropTypes.func,
  isOpen: PropTypes.bool.isRequired,
}

export default DeleteFlagModal
