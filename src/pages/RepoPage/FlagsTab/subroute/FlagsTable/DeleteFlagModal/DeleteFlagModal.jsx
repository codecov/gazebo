import PropTypes from 'prop-types'

import { useDeleteFlag } from 'services/deleteFlag'
import Button from 'ui/Button'
import Modal from 'ui/Modal'

const DeleteFlagModal = ({ flagName, closeModal }) => {
  const { mutate } = useDeleteFlag()

  return (
    <Modal
      isOpen={true}
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
                mutate({ flagName: 'asdfasdf' })
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
  flagName: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
}

export default DeleteFlagModal
