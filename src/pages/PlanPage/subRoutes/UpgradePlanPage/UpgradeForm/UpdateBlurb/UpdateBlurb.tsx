import { IndividualPlan, Plan } from 'services/account'
import { BillingRate, isTeamPlan } from 'shared/utils/billing'

const UpdateBlurb = ({
  currentPlan,
  newPlan,
  seats,
  nextBillingDate,
}: {
  currentPlan?: Plan | null
  newPlan?: IndividualPlan
  seats: number
  nextBillingDate: string
}) => {
  const currentIsFree = currentPlan?.isFreePlan
  const currentIsTeam = isTeamPlan(currentPlan?.value)
  const selectedIsTeam = isTeamPlan(newPlan?.value)
  const diffPlanType = currentIsFree || currentIsTeam !== selectedIsTeam

  const currentIsAnnual = currentPlan?.billingRate === BillingRate.ANNUALLY
  const selectedIsAnnual = newPlan?.billingRate === BillingRate.ANNUALLY
  const diffBillingType = currentIsAnnual !== selectedIsAnnual

  const diffSeats = currentPlan?.planUserCount !== seats

  const hasDiff = diffPlanType || diffBillingType || diffSeats

  // A plan is considered an upgrade if we increase the number of seats,
  // go from team -> pro, from monthly -> annual billing, or the current plan is a free plan
  const isUpgrade =
    seats > Number(currentPlan?.planUserCount) ||
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
        <li className="pl-2">{`You are changing seats from ${currentPlan?.planUserCount} to [${seats}]`}</li>
      )}
      {diffBillingType && !currentIsFree && (
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
