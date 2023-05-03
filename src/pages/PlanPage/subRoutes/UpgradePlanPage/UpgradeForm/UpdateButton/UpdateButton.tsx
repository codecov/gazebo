import isNull from 'lodash/isNull'
import PropTypes, { type InferProps } from 'prop-types'

import { accountDetailsPropType } from 'services/account'
import Button from 'ui/Button'

// eslint-disable-next-line complexity
function UpdateButton({
  isValid,
  getValues,
  value,
  quantity,
  accountDetails,
  isSentryUpgrade,
}: InferProps<typeof UpdateButton.propTypes>) {
  const isSamePlan = getValues()?.newPlan === value
  const noChangeInSeats = getValues()?.seats === quantity
  const disabled = !isValid || (isSamePlan && noChangeInSeats)
  const trialEndTimestamp = accountDetails?.subscriptionDetail?.trialEnd ?? null

  if (isSentryUpgrade && isNull(trialEndTimestamp)) {
    return (
      <div className="flex items-center gap-2">
        <Button
          data-cy="all-orgs-plan-update"
          disabled={false}
          type="submit"
          variant="primary"
          hook="submit-upgrade"
          to={undefined}
        >
          Start trial
        </Button>
        <p>No credit card required!</p>
      </div>
    )
  }

  return (
    <Button
      data-cy="plan-page-plan-update"
      disabled={disabled}
      type="submit"
      variant="primary"
      hook="submit-upgrade"
      to={undefined}
    >
      Update
    </Button>
  )
}

UpdateButton.propTypes = {
  isValid: PropTypes.bool.isRequired,
  getValues: PropTypes.func.isRequired,
  value: PropTypes.string,
  quantity: PropTypes.number,
  accountDetails: accountDetailsPropType,
  isSentryUpgrade: PropTypes.bool.isRequired,
}

export default UpdateButton
