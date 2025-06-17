import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account/useAccountDetails'
import { IndividualPlan } from 'services/account/useAvailablePlans'
import { usePlanData } from 'services/account/usePlanData'
import { useOwner } from 'services/user'
import { Provider } from 'shared/api/helpers'
import { getNextBillingDate } from 'shared/utils/billing'
import Avatar from 'ui/Avatar'
import Button from 'ui/Button'
import Modal from 'ui/Modal'

import { PersonalOrgWarning } from '../PersonalOrgWarning'
import UpdateBlurb from '../UpdateBlurb'

interface BillingControlsProps {
  seats: number
  isValid: boolean
  newPlan?: IndividualPlan
  onSubmit: () => void
  isLoading: boolean
}

const UpdateButton: React.FC<BillingControlsProps> = ({
  isValid,
  newPlan,
  seats,
  onSubmit,
  isLoading,
}) => {
  const { provider, owner } = useParams<{ provider: Provider; owner: string }>()
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const { data: ownerData } = useOwner({ username: owner })
  const { data: planData } = usePlanData({ provider, owner })
  const { data: accountDetails } = useAccountDetails({ provider, owner })

  const currentPlanValue = planData?.plan?.value
  const currentPlanQuantity = planData?.plan?.planUserCount || 0

  const isSamePlan = newPlan?.value === currentPlanValue
  const noChangeInSeats = seats === currentPlanQuantity
  const disabled = !isValid || (isSamePlan && noChangeInSeats)

  return (
    <>
      <div className="inline-flex">
        <Button
          type="button"
          data-cy="plan-page-plan-update"
          disabled={disabled}
          variant="primary"
          hook="confirm-upgrade"
          onClick={() => {
            if (!disabled) {
              setShowConfirmationModal(true)
            }
          }}
          isLoading={isLoading}
        >
          {planData?.plan?.isFreePlan ? 'Proceed to checkout' : 'Update'}
        </Button>
      </div>
      <Modal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        body={
          <div className="flex flex-col gap-4 px-4 py-2">
            <div className="inline-flex items-center gap-1">
              By proceeding, you are making the following changes to{' '}
              <Avatar user={ownerData} className="size-4" />
              <span className="font-bold text-ds-pink-default">{owner}</span>
              &apos;s plan:
            </div>
            <UpdateBlurb
              currentPlan={planData?.plan}
              newPlan={newPlan}
              seats={Number(seats)}
              nextBillingDate={getNextBillingDate(accountDetails)!}
            />
            <PersonalOrgWarning />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                hook="cancel-upgrade"
                variant="default"
                onClick={() => setShowConfirmationModal(false)}
              >
                Go back
              </Button>
              <Button
                type="submit"
                hook="submit-upgrade"
                variant="primary"
                onClick={() => {
                  onSubmit()
                  setShowConfirmationModal(false)
                }}
              >
                {planData?.plan?.isFreePlan ? 'Proceed to checkout' : 'Update'}
              </Button>
            </div>
          </div>
        }
        title="Review plan changes"
      />
    </>
  )
}

export default UpdateButton
