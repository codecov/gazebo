import PropTypes, { type InferProps } from 'prop-types'

import { accountDetailsPropType } from 'services/account'
import { TrialStatuses } from 'services/trial'
import Button from 'ui/Button'

// eslint-disable-next-line complexity
function UpdateButton({
  isValid,
  getValues,
  value,
  quantity,
  disableInputs,
  isSentryUpgrade,
  organizationName,
  trialStatus,
}: InferProps<typeof UpdateButton.propTypes>) {
  const isSamePlan = getValues()?.newPlan === value
  const noChangeInSeats = getValues()?.seats === quantity
  const disabled = !isValid || (isSamePlan && noChangeInSeats) || disableInputs

  if (
    isSentryUpgrade &&
    organizationName &&
    trialStatus === TrialStatuses.NOT_STARTED
  ) {
    return (
      <div className="flex items-center gap-2">
        <Button
          data-cy="all-orgs-plan-update"
          disabled={disableInputs}
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
  trialStatus: PropTypes.string,
}

export default UpdateButton
