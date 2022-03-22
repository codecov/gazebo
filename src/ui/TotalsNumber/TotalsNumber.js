import cs from 'classnames'
import PropTypes from 'prop-types'

const getVariantClasses = ({ inline, large }) =>
  cs({
    'text-xl text-center font-light': large,
    'flex justify-end font-semibold': !large,
    'w-full': !inline,
  })

const getNumberClasses = ({ value, plain, showChange }) =>
  cs({
    'bg-ds-coverage-covered': value > 0 && !plain,
    'bg-ds-coverage-uncovered': value < 0 && !plain,
    "before:content-['+']": value > 0 && showChange,
  })

const validateValue = (value) => (value && !isNaN(value)) || value === 0

const TotalsNumber = ({
  value,
  plain,
  inline,
  showChange,
  large,
  ...props
}) => {
  const containerClass = getVariantClasses({ inline, large })
  const numberClass = getNumberClasses({ value, plain, showChange })
  const isValid = validateValue(value)
  const numberValue = isValid && value?.toFixed(2)
  const { className, ...rest } = props

  return (
    <div className={containerClass} {...rest}>
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
  inline: PropTypes.bool,
  large: PropTypes.bool,
  showChange: PropTypes.bool,
}

export default TotalsNumber
