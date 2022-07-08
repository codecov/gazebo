import { format, fromUnixTime } from 'date-fns'
import PropType from 'prop-types'
import { useState } from 'react'
import { useHistory } from 'react-router-dom'

import Modal from 'old_ui/Modal'
import { accountDetailsPropType, useCancelPlan } from 'services/account'
import { useAddNotification } from 'services/toastNotification'
import { isFreePlan } from 'shared/utils/billing'
import Button from 'ui/Button'

import useBarecancel from './barecancel'

function getEndPeriod(accountDetails) {
  const unixPeriodEnd = accountDetails.subscriptionDetail?.currentPeriodEnd
  return (
    unixPeriodEnd &&
    format(fromUnixTime(unixPeriodEnd), 'MMMM do yyyy, h:m aaaa')
  )
}

function useCancelSubmit({ provider, owner }) {
  const redirect = useHistory().push
  const addToast = useAddNotification()
  const { mutate, ...rest } = useCancelPlan({ provider, owner })

  function cancelPlan() {
    mutate(null, {
      onSuccess: () => {
        redirect(`/account/${provider}/${owner}/billing`)
      },
      onError: () =>
        addToast({
          type: 'error',
          text: 'Something went wrong',
        }),
    })
  }

  return { cancelPlan, ...rest }
}

function DowngradeToFree({ accountDetails, provider, owner }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { cancelPlan, isLoading } = useCancelSubmit({ provider, owner })
  const isAlreadyFreeUser = isFreePlan(accountDetails.plan?.value)
  const isDisabled = [
    // disable button if
    isLoading, // request in fly
    isAlreadyFreeUser, // user is a free user
    accountDetails.subscriptionDetail?.cancelAtPeriodEnd, // the subscription is already getting cancelled
  ].some(Boolean)
  const periodEnd = getEndPeriod(accountDetails)

  useBarecancel(accountDetails, cancelPlan)

  return (
    <>
      <Button
        variant="danger"
        onClick={() => setIsModalOpen(true)}
        disabled={isDisabled}
      >
        {isAlreadyFreeUser ? 'Already free user' : 'Downgrade to Free Plan'}
      </Button>
      {/* TODO: Add this when merging to the new page; this will go to a non-existent route */}
      {/* <Button
        type="button"
        variant="plain"
        disabled={isLoading}
        onClick={closeForm}
      >
        Cancel
      </Button> */}
      {/* TODO: Change this to new modal UI + Ask for designs here*/}
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
            onClick={() => {
              setIsModalOpen(false)
              cancelPlan()
            }}
          >
            Continue Cancellation
          </Button>
        </div>
      </Modal>
    </>
  )
}

DowngradeToFree.propTypes = {
  provider: PropType.string.isRequired,
  owner: PropType.string.isRequired,
  accountDetails: accountDetailsPropType.isRequired,
}

export default DowngradeToFree
