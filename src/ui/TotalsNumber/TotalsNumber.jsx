import cs from 'classnames'
import PropTypes from 'prop-types'

const getNumberClasses = ({ value, plain, showChange }) =>
  cs({
    'bg-ds-coverage-covered font-lato': value > 0 && !plain,
    'bg-ds-coverage-uncovered font-lato': value < 0 && !plain,
    "before:content-['+'] font-lato": value > 0 && showChange,
  })

const validateValue = (value) => (value && !isNaN(value)) || value === 0

const TotalsNumber = ({ value, plain, light, showChange, large, ...props }) => {
  const numberClass = getNumberClasses({ value, plain, showChange })
  const isValid = validateValue(value)
  const numberValue = isValid && value?.toFixed(2)
  const { className, ...rest } = props

  return (
    <div {...rest}>
      {isValid ? (
        <span data-testid="number-value" className={numberClass}>
          {numberValue}%
        </span>
      ) : (
        <>-</>
      )}
    </div>
  )
}

TotalsNumber.propTypes = {
  value: PropTypes.number,
  plain: PropTypes.bool,
  large: PropTypes.bool,
  light: PropTypes.bool,
  showChange: PropTypes.bool,
}

export default TotalsNumber
