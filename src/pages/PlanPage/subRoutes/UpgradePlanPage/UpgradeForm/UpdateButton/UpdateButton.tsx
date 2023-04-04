import PropTypes from 'prop-types'

import Button from 'ui/Button'

interface UpdateButtonProps {
  isValid: boolean
  getValues: () => { newPlan: string; seats: number }
  value: string | undefined
  quantity: number | undefined
}

const UpdateButton: React.FC<UpdateButtonProps> = ({
  isValid,
  getValues,
  value,
  quantity,
}) => {
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
      Update
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
