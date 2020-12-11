import PropType from 'prop-types'
import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { format, fromUnixTime } from 'date-fns'

import Button from 'ui/Button'
import Modal from 'ui/Modal'
import { useCancelPlan, accountDetailsPropType } from 'services/account'
import { useAddNotification } from 'services/toastNotification'

function getEndPeriod(accountDetails) {
  const periodEnd = fromUnixTime(
    accountDetails.subscriptionDetail.currentPeriodEnd
  )
  return format(periodEnd, 'MMMM do yyyy, h:m aaaa')
}

function useCancelSubmit({ provider, owner }) {
  const redirect = useHistory().push
  const addToast = useAddNotification()
  return useCancelPlan({
    provider,
    owner,
    onSuccess: () => {
      addToast({
        type: 'success',
        text: 'Successfully downgraded to: Free Plan',
      })
      redirect(`/account/${provider}/${owner}`)
    },
    onError: () =>
      addToast({
        type: 'error',
        text: 'Something went wrong',
      }),
    useErrorBoundary: false,
  })
}

function DowngradeToFree({ accountDetails, provider, owner }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cancelPlan, { isLoading }] = useCancelSubmit({ provider, owner })

  const isAlreadyFreeUser = accountDetails.plan?.value === 'users-free'
  const isDisabled = [
    // disable button if
    isLoading, // request in fly
    isAlreadyFreeUser, // user is a free user
    accountDetails.subscriptionDetail?.cancelAtPeriodEnd, // the subscription is already getting cancelled
  ].some(Boolean)
  const periodEnd = getEndPeriod(accountDetails)

  return (
    <>
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
          <Button color="red" onClick={cancelPlan} disabled={isDisabled}>
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
