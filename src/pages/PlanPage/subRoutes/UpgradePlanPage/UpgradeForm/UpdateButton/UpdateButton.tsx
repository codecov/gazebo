import PropTypes, { type InferProps } from 'prop-types'

import { isFreePlan } from 'shared/utils/billing'
import Button from 'ui/Button'

function UpdateButton({
  isValid,
  getValues,
  value,
  quantity,
}: InferProps<typeof UpdateButton.propTypes>) {
  const isSamePlan = getValues()?.newPlan === value
  const noChangeInSeats = getValues()?.seats === quantity
  const disabled = !isValid || (isSamePlan && noChangeInSeats)

  return (
    <Button
      data-cy="plan-page-plan-update"
      disabled={disabled}
      type="submit"
      variant="primary"
      hook="submit-upgrade"
      to={undefined}
    >
      {isFreePlan(value) ? 'Proceed to Checkout' : 'Update'}
    </Button>
  )
}

UpdateButton.propTypes = {
  isValid: PropTypes.bool.isRequired,
  getValues: PropTypes.func.isRequired,
  value: PropTypes.string,
  quantity: PropTypes.number,
}

export default UpdateButton
