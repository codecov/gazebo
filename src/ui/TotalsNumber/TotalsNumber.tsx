import cs from 'classnames'

const getVariantClasses = ({
  light,
  large,
}: {
  light?: boolean
  large?: boolean
}) =>
  cs({
    'text-xl font-light': large,
    'font-semibold': !large && !light,
  })

const getNumberClasses = ({
  value,
  plain,
  showChange,
}: {
  value: number
  plain: boolean
  showChange?: boolean
}) =>
  cs({
    'bg-ds-coverage-covered': value > 0 && !plain,
    'bg-ds-coverage-uncovered': value < 0 && !plain,
    "before:content-['+']": value > 0 && showChange,
  })

const validateValue = (value: number) => (value && !isNaN(value)) || value === 0

const TotalsNumber = ({
  value,
  plain,
  light,
  showChange,
  large,
  ...props
}: {
  value: number
  plain: boolean
  light?: boolean
  showChange?: boolean
  large?: boolean
  className?: string
  variant?: string
}) => {
  const containerClass = getVariantClasses({ light, large })
  const numberClass = getNumberClasses({ value, plain, showChange })
  const isValid = validateValue(value)
  const numberValue = isValid && value?.toFixed(2)
  const { className, ...rest } = props

  return (
    <div className={containerClass} {...rest}>
      {isValid ? (
        <span data-testid="number-value" className={`font-lato ${numberClass}`}>
          {numberValue}%
        </span>
      ) : (
        <>-</>
      )}
    </div>
  )
}

export default TotalsNumber
