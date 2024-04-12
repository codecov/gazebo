import { useDeleteComponentMeasurements } from 'services/deleteComponentMeasurements'
import Button from 'ui/Button'
import Modal from 'ui/Modal'

type Props = {
  isOpen: boolean
  componentId?: string
  closeModal: () => void
}

const DeleteComponentModal = ({ isOpen, closeModal, componentId }: Props) => {
  const { mutate } = useDeleteComponentMeasurements()

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      hasCloseButton={true}
      size="small"
      title={<span className="text-lg">Delete Component</span>}
      body={
        <p>
          This will remove the{' '}
          <span className="font-semibold">{componentId}</span> component from
          the reports in app. You will also need to remove this component in
          your CI and codecov.yaml to stop uploads.
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
              to={undefined}
              disabled={false}
              onClick={() => {
                // TODO: fix when we convert the hooks to TS
                // @ts-expect-error
                mutate({ componentId })
                closeModal()
              }}
            >
              Delete component
            </Button>
          </div>
        </div>
      }
    />
  )
}

export default DeleteComponentModal
