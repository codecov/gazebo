import PropType from 'prop-types'
import { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import Button from 'old_ui/Button'
import Modal from 'old_ui/Modal'
import { isFreePlan } from 'shared/utils/billing'

import { useCancel } from './hooks'
import { getEndPeriod } from './utils'

function CancelButton({
  customerId,
  planCost,
  upComingCancelation,
  currentPeriodEnd,
}) {
  const { provider, owner } = useParams()
  const { push } = useHistory()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { cancelPlan, baremetricsBlocked, queryIsLoading } = useCancel(
    { customerId },
    {
      onSuccess: () => {
        console.log('canceled')
        sendUserToBilling()
      },
    }
  )

  const isAlreadyFreeUser = isFreePlan(planCost)
  const isDisabled = [
    // disable button if
    queryIsLoading, // request in fly
    isAlreadyFreeUser, // user is a free user
    upComingCancelation, // the subscription is already getting cancelled
  ].some(Boolean)
  const periodEnd = getEndPeriod(currentPeriodEnd)

  function completeCancelation() {
    if (baremetricsBlocked) {
      cancelPlan()
    }
  }

  function sendUserToBilling() {
    push(`/account/${provider}/${owner}/billing`)
  }

  return (
    <div className="text-center mt-4">
      <Button
        color="red"
        onClick={() => setIsModalOpen(true)}
        disabled={isDisabled}
      >
        {isAlreadyFreeUser ? 'Already free user' : 'Downgrade to Free'}
      </Button>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Are you sure you want to cancel your plan?"
      >
        <p className="text-sm">Cancelling your subscription will:</p>
        <ul className="mt-4 list-disc pl-4 text-sm">
          <li>Keep your subscription active until {periodEnd}</li>
          <li>Ensure you are not charged again.</li>
          <li>
            Place your organization on the Free Per User Billing tier after{' '}
            {periodEnd}
          </li>
        </ul>
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setIsModalOpen(false)}
            disabled={isDisabled}
          >
            Close
          </Button>
          <Button
            color="red"
            id="barecancel-trigger"
            disabled={isDisabled}
            onClick={completeCancelation}
          >
            Continue Cancellation
          </Button>
        </div>
      </Modal>
    </div>
  )
}

CancelButton.propTypes = {
  customerId: PropType.string,
  planCost: PropType.string.isRequired,
  upComingCancelation: PropType.bool.isRequired,
  currentPeriodEnd: PropType.number.isRequired,
}

export default CancelButton
