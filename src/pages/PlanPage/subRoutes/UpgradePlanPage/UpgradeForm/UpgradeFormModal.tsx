import A from 'ui/A'
import Button from 'ui/Button'
import Icon from 'ui/Icon'
import Modal from 'ui/Modal'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  url: string
  isUpgrading?: boolean
}

const UpgradeFormModal = ({
  isOpen,
  onClose,
  onConfirm,
  url,
  isUpgrading = false,
}: UpgradeModalProps) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={
      <p className="flex items-center gap-2 text-base">
        <Icon
          name="exclamationTriangle"
          size="sm"
          className="fill-ds-primary-yellow"
        />
        Incomplete Plan Upgrade
      </p>
    }
    body={
      <div className="flex flex-col gap-4">
        <div>
          You have an incomplete plan upgrade that is awaiting payment
          verification{' '}
          <A
            href={url}
            isExternal
            hook={'verify-payment-method'}
            to={undefined}
          >
            here
          </A>
          .
        </div>
        <p>
          Are you sure you wish to abandon the pending upgrade and start a new
          one?
        </p>
      </div>
    }
    footer={
      <div className="flex gap-2">
        <Button hook="cancel-upgrade" onClick={onClose} disabled={isUpgrading}>
          Cancel
        </Button>
        <Button
          hook="confirm-upgrade"
          variant="primary"
          onClick={onConfirm}
          disabled={isUpgrading}
        >
          {isUpgrading ? 'Processing...' : 'Yes, Start New Upgrade'}
        </Button>
      </div>
    }
  />
)

export default UpgradeFormModal
