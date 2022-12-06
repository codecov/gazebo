import PropTypes from 'prop-types'

import A from 'ui/A'
import Button from 'ui/Button'
import Modal from 'ui/Modal'

function UpgradeModal({ isOpen, setIsOpen }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Upgrade to Pro"
      body={
        <div className="flex flex-col gap-6">
          <p>
            Your org has activated the maximum number of free users. You&apos;ll
            need to upgrade to Pro to add new seats.
          </p>
          <p>
            <span className="font-semibold">Need help upgrading? </span>
            <A to={{ pageName: 'sales' }}>Contact</A> our sales team today!
          </p>
        </div>
      }
      footer={
        <div className="flex gap-2">
          <Button
            hook="upgrade-modal-close"
            color="gray"
            className="rounded-none"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" to={{ pageName: 'upgradeOrgPlan' }}>
            Upgrade now
          </Button>
        </div>
      }
    />
  )
}

UpgradeModal.propTypes = {
  isOpen: PropTypes.bool,
  setIsOpen: PropTypes.func,
}

export default UpgradeModal
