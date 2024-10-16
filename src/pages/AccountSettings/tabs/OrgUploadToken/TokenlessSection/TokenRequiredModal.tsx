import Button from 'ui/Button'
import Icon from 'ui/Icon'
import Modal from 'ui/Modal'

interface TokenlessModalProps {
  closeModal: () => void
  setTokenRequired: (value: boolean) => void
  isLoading: boolean
}

const TokenRequiredModal = ({
  closeModal,
  setTokenRequired,
  isLoading,
}: TokenlessModalProps) => (
  <Modal
    isOpen={true}
    onClose={closeModal}
    title={
      <p className="flex items-center gap-2 text-base">
        <Icon
          name="exclamationTriangle"
          size="sm"
          className="fill-ds-primary-yellow"
        />
        Require token for uploads
      </p>
    }
    body={
      <div className="flex flex-col gap-4">
        <p>
          Enforcing token authentication for uploads within your organization
          will cause uploads without a token to be rejected for all of your
          repositories.
        </p>
        <p>
          Before proceeding, make sure all of your repositories can access
          either your global upload token or a repository-specific token in your
          CI configuration and that your CI jobs are using one of them when
          submitting uploads.
        </p>
        <p>
          Click <span className="font-semibold">Require token for upload</span>{' '}
          to enforce the use of the global token for uploads.
        </p>
      </div>
    }
    footer={
      <div className="flex gap-2">
        <Button
          hook="cancel-token-requirement"
          onClick={() => {
            closeModal()
          }}
          to={undefined}
          disabled={undefined}
        >
          Cancel
        </Button>
        <Button
          isLoading={isLoading}
          hook="require-token-upload"
          variant="primary"
          onClick={() => {
            setTokenRequired(true)
            closeModal()
          }}
          to={undefined}
          disabled={undefined}
        >
          Require token for upload
        </Button>
      </div>
    }
  />
)

export default TokenRequiredModal
