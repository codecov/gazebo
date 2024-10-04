import { useDeleteComponentMeasurements } from 'services/deleteComponentMeasurements'
import Button from 'ui/Button'
import Modal from 'ui/Modal'

type Props = {
  isOpen: boolean
  componentId?: string
  name?: string
  closeModal: () => void
}

const DeleteComponentModal = ({
  isOpen,
  closeModal,
  componentId,
  name,
}: Props) => {
  const { mutate } = useDeleteComponentMeasurements()

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      hasCloseButton={true}
      size="small"
      title={
        <span data-testid={`remove-${name}`} className="text-lg">
          Remove <span className="italic">{name}</span>
        </span>
      }
      body={
        <div>
          <p>
            This will remove the historical data of{' '}
            <span className="font-semibold italic">{name}</span> component in
            the app and we can’t retrieve the data.
          </p>
          <br></br>
          <p>
            <span className="font-semibold">Action required:</span> You’ll need
            to remove <span className="font-semibold italic">{name}</span>{' '}
            component in your yaml file otherwise you’ll still see it in this
            table.
          </p>
          <br></br>
          <p>It will take some time to reflect this deletion.</p>
        </div>
      }
      footer={
        <div className="flex gap-2">
          <button
            className="flex-none font-semibold text-ds-blue-default"
            onClick={() => {
              closeModal()
            }}
          >
            Cancel
          </button>
          <div>
            <Button
              hook="delete-component-modal"
              variant="danger"
              to={undefined}
              disabled={false}
              onClick={() => {
                // TODO: fix when we convert the hooks to TS
                // @ts-expect-error
                mutate({ componentId })
                closeModal()
              }}
              data-testid="delete-component-modal"
            >
              Remove
            </Button>
          </div>
        </div>
      }
    />
  )
}

export default DeleteComponentModal
