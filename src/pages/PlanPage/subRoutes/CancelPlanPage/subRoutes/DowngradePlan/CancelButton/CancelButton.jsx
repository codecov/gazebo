import PropType from 'prop-types'
import { useState } from 'react'

import { isFreePlan } from 'shared/utils/billing'
import Button from 'ui/Button'
import Modal from 'ui/Modal'

import { useCancel } from './hooks'
import { cleanupBaremetrics, getEndPeriod } from './utils'

const FALLBACK_PERIOD_TEXT = 'the end of the period'

function CancelButton({
  customerId,
  planCost,
  upComingCancelation,
  currentPeriodEnd,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { cancelPlan, baremetricsBlocked, queryIsLoading } = useCancel({
    customerId,
    isModalOpen,
  })

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

  function handleOnClose() {
    cleanupBaremetrics()
    setIsModalOpen(false)
  }

  return (
    <div>
      <Button
        hook="downgrade-button"
        variant="danger"
        onClick={() => setIsModalOpen(true)}
        disabled={isDisabled}
      >
        {isAlreadyFreeUser ? 'Already free user' : 'Cancel your plan'}
      </Button>
      <Modal
        customHeaderClassname="text-base"
        isOpen={isModalOpen}
        onClose={handleOnClose}
        title="Review plan cancellation"
        body={
          <div>
            <br></br>
            <p className="text-sm">Once you cancel your subscription:</p>
            <ul className="mt-4 list-disc pl-4 text-sm">
              <li>
                Your paid plan will remain active until{' '}
                {periodEnd || `${FALLBACK_PERIOD_TEXT}.`}
              </li>
              <li>
                Your organization will be placed on the Developer plan after{' '}
                {periodEnd || `${FALLBACK_PERIOD_TEXT}.`}
              </li>
              <li>You will not be charged again.</li>
            </ul>
            <br></br>
          </div>
        }
        footer={
          <div className="flex justify-end gap-3">
            <Button
              hook="close-button"
              variant="default"
              onClick={handleOnClose}
              disabled={isDisabled}
            >
              Cancel
            </Button>
            <Button
              id="barecancel-trigger"
              variant="danger"
              hook="continue-cancellation-button"
              disabled={isDisabled}
              onClick={completeCancelation}
            >
              Confirm Cancellation
            </Button>
          </div>
        }
      />
    </div>
  )
}

CancelButton.propTypes = {
  customerId: PropType.string,
  planCost: PropType.string.isRequired,
  upComingCancelation: PropType.bool,
  currentPeriodEnd: PropType.number,
}

export default CancelButton
