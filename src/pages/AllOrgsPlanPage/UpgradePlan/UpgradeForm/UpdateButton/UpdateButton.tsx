import isNull from 'lodash/isNull'
import PropTypes, { type InferProps } from 'prop-types'

import { accountDetailsPropType } from 'services/account'
import Button from 'ui/Button'

// eslint-disable-next-line complexity, max-statements
function UpdateButton({
  isValid,
  getValues,
  value,
  quantity,
  disableInputs,
  accountDetails,
  isSentryUpgrade,
  organizationName,
}: InferProps<typeof UpdateButton.propTypes>) {
  const isSamePlan = getValues()?.newPlan === value
  const noChangeInSeats = getValues()?.seats === quantity
  const disabled = !isValid || (isSamePlan && noChangeInSeats) || disableInputs
  const trialEndTimestamp = accountDetails?.subscriptionDetail?.trialEnd

  if (isSentryUpgrade && organizationName && isNull(trialEndTimestamp)) {
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
      data-cy="all-orgs-plan-update"
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
  disableInputs: PropTypes.bool.isRequired,
  accountDetails: accountDetailsPropType,
  isSentryUpgrade: PropTypes.bool.isRequired,
  organizationName: PropTypes.string,
}

export default UpdateButton
