import { z } from 'zod'

import { PlanSchema } from 'services/account'
import { isAnnualPlan, isFreePlan, isTeamPlan } from 'shared/utils/billing'

import { NewPlanType } from '../constants'

const UpdateBlurb = ({
  currentPlan,
  selectedPlan,
  newPlanName,
  seats,
  nextBillingDate,
}: {
  currentPlan?: z.infer<typeof PlanSchema>
  selectedPlan?: z.infer<typeof PlanSchema>
  newPlanName: NewPlanType
  seats: number
  nextBillingDate: string
}) => {
  const currentIsFree = isFreePlan(currentPlan?.value)
  const currentIsTeam = isTeamPlan(currentPlan?.value)
  const selectedIsTeam = isTeamPlan(selectedPlan?.value)
  const diffPlanType = currentIsTeam !== selectedIsTeam

  const currentIsAnnual = isAnnualPlan(currentPlan?.value)
  const selectedIsAnnual = isAnnualPlan(newPlanName)
  const diffBillingType = currentIsAnnual !== selectedIsAnnual

  const diffSeats = currentPlan?.quantity !== seats

  const hasDiff = diffPlanType || diffBillingType || diffSeats

  // A plan is considered an upgrade if we increase the number of seats,
  // go from team -> pro, from monthly -> annual billing, or the current plan is a free plan
  const isUpgrade =
    seats > Number(currentPlan?.quantity) ||
    (currentIsTeam && !selectedIsTeam) ||
    (!currentIsAnnual && selectedIsAnnual) ||
    currentIsFree

  if (!hasDiff) {
    return null
  }

  return (
    <div>
      <h3 className="pb-2 font-semibold">Review your plan changes</h3>
      {diffPlanType && (
        <li className="pl-2">{`You are changing from the ${
          currentIsFree ? 'Developer' : currentIsTeam ? 'Team' : 'Pro'
        } plan to the [${selectedIsTeam ? 'Team' : 'Pro'} plan]`}</li>
      )}
      {diffSeats && (
        <li className="pl-2">{`You are changing seats from ${currentPlan?.quantity} to [${seats}]`}</li>
      )}
      {diffBillingType && (
        <li className="pl-2">{`You are changing your billing cycle from ${
          currentIsAnnual ? 'Annual' : 'Monthly'
        } to [${currentIsAnnual ? 'Monthly' : 'Annual'}]`}</li>
      )}
      <br />

      <h3 className="font-medium">
        {isUpgrade
          ? 'Your changes will take effect immediately.'
          : `Your changes will take effect at the beginning of your next billing cycle on [${nextBillingDate}].`}
      </h3>
    </div>
  )
}

export default UpdateBlurb
