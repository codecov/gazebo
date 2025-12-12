import { IndividualPlan } from 'services/account/useAvailablePlans'
import { Plan } from 'services/account/usePlanData'
import { BillingRate } from 'shared/utils/billing'

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
  const currentIsTeam = currentPlan?.isTeamPlan
  const selectedIsTeam = newPlan?.isTeamPlan
  const diffPlanType = currentIsFree || currentIsTeam !== selectedIsTeam

  const currentIsAnnual = currentPlan?.billingRate === BillingRate.ANNUALLY

  const diffSeats = currentPlan?.planUserCount !== seats

  const hasDiff = diffPlanType || diffSeats || currentIsAnnual

  // A plan is considered an upgrade if we increase the number of seats,
  // go from team -> pro or the current plan is a free plan
  // (previously also from monthly -> annual billing)
  const isUpgrade =
    seats > Number(currentPlan?.planUserCount) ||
    (currentIsTeam && !selectedIsTeam) ||
    currentIsFree

  if (!hasDiff) {
    return null
  }

  return (
    <div>
      <ul className="list-inside list-disc">
        {diffPlanType && (
          <li className="pl-2">{`You are changing from the ${
            currentIsFree ? 'Developer' : currentIsTeam ? 'Team' : 'Pro'
          } plan to the [${selectedIsTeam ? 'Team' : 'Pro'} plan]`}</li>
        )}
        {diffSeats && (
          <li className="pl-2">{`You are changing seats from ${currentPlan?.planUserCount} to [${seats}]`}</li>
        )}
        {currentIsAnnual && !currentIsFree && (
          <li className="pl-2">
            {'You are changing your billing cycle from Annual to [Monthly]'}
          </li>
        )}
      </ul>
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
