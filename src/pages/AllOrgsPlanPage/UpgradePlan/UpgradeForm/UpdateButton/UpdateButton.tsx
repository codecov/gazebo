import PropTypes from 'prop-types'

import Button from 'ui/Button'

interface UpdateButtonProps {
  isValid: boolean
  getValues: () => { newPlan: string; seats: number }
  value: string | undefined
  quantity: number | undefined
  disableInputs: boolean
}

const UpdateButton: React.FC<UpdateButtonProps> = ({
  isValid,
  getValues,
  value,
  quantity,
  disableInputs,
}) => {
  const isSamePlan = getValues()?.newPlan === value
  const noChangeInSeats = getValues()?.seats === quantity
  const disabled = !isValid || (isSamePlan && noChangeInSeats) || disableInputs

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
}

export default UpdateButton
