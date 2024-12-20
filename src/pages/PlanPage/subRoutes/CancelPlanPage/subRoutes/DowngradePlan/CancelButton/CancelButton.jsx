import PropType from 'prop-types'
import { useState } from 'react'

import Button from 'ui/Button'
import Modal from 'ui/Modal'

import { useCancel } from './hooks'
import { cleanupBaremetrics, getEndPeriod } from './utils'

const FALLBACK_PERIOD_TEXT = 'the end of the period'

function CancelButton({
  customerId,
  isFreePlan,
  upComingCancellation,
  currentPeriodEnd,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { cancelPlan, baremetricsBlocked, queryIsLoading } = useCancel({
    customerId,
    isModalOpen,
  })

  const isDisabled = [
    // disable button if
    queryIsLoading, // request in fly
    isFreePlan, // user is a free user
    upComingCancellation, // the subscription is already getting cancelled
  ].some(Boolean)
  const periodEnd = getEndPeriod(currentPeriodEnd)

  function completeCancellation() {
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
        {isFreePlan ? 'Already free user' : 'Cancel your plan'}
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
              // This ID is needed to render the baremetrics form. DO NOT CHANGE
              id="barecancel-trigger"
              variant="danger"
              hook="continue-cancellation-button"
              disabled={isDisabled}
              onClick={completeCancellation}
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
  isFreePlan: PropType.bool,
  upComingCancellation: PropType.bool,
  currentPeriodEnd: PropType.number,
}

export default CancelButton
