import { cn } from 'shared/utils/cn'

const getVariantClasses = ({
  light,
  large,
}: {
  light?: boolean
  large?: boolean
}) =>
  cn({
    'text-xl font-light': large,
    'font-semibold': !large && !light,
  })

const getNumberClasses = ({
  value,
  plain,
  showChange,
}: {
  value?: number | null
  plain?: boolean
  showChange?: boolean
}) => {
  const hasValue = typeof value === 'number'

  return cn({
    'bg-ds-coverage-uncovered':
      hasValue && parseFloat(value.toFixed(2)) < 0 && !plain,
    'bg-ds-coverage-covered':
      hasValue && parseFloat(value.toFixed(2)) >= 0 && !plain,
    "before:content-['+']": hasValue && showChange,
  })
}

const validateValue = (value?: number | null) =>
  (value && !isNaN(value)) || value === 0

const TotalsNumber = ({
  value,
  plain,
  light,
  showChange,
  large,
  ...props
}: {
  value?: number | null
  plain?: boolean
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
