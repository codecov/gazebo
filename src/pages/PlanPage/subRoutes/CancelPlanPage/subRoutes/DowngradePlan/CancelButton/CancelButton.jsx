import { format, fromUnixTime } from 'date-fns'
import PropType from 'prop-types'
import { useState } from 'react'

import Button from 'ui/Button'
import Modal from 'ui/Modal'

import { useCancel } from './hooks'

const FALLBACK_PERIOD_TEXT = 'the end of the period'

function getEndPeriod(unixPeriodEnd) {
  return (
    unixPeriodEnd &&
    format(fromUnixTime(unixPeriodEnd), 'MMMM do yyyy, h:m aaaa')
  )
}

function CancelButton({ isFreePlan, upComingCancellation, currentPeriodEnd }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { cancelPlan, queryIsLoading } = useCancel()

  const isDisabled = [
    // disable button if
    queryIsLoading, // request in fly
    isFreePlan, // user is a free user
    upComingCancellation, // the subscription is already getting cancelled
  ].some(Boolean)
  const periodEnd = getEndPeriod(currentPeriodEnd)

  function handleOnClose() {
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
              variant="danger"
              hook="continue-cancellation-button"
              disabled={isDisabled}
              onClick={cancelPlan}
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
