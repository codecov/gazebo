import cs from 'classnames'
import PropTypes from 'prop-types'

// TODO: This is likely fixed in the future when looking at CSS/styling on tables
// There should only be 2 classes, default and coverageCard for variantClasses and textVariants for Change component
const variantClasses = {
  default: `flex justify-end w-full font-semibold`,
  fileViewer: `flex justify-end font-semibold text-sm`,
  coverageCard: `text-xl text-center font-light`
}

const textVariants = {
  default: {
       covered:"bg-ds-coverage-covered",
       uncovered:"bg-ds-coverage-uncovered",
  },
  fileViewer: {
       covered:"bg-ds-coverage-covered",
       uncovered:"bg-ds-coverage-uncovered",
  },
  coverageCard:{
       covered:"text-ds-primary-green",
       uncovered:"text-ds-primary-red",
  }
}

const validateValue = (value) => (value && !isNaN(value) && value !== 0) ? true : false

// TODO: Change this component to something like "TotalsNumber" or "Delta" to be reused by Coverage, Patch and Change throughout our codebase
const Change = ({value, variant='default'}) => {
  const containerClass = variantClasses[variant]
  const isValid = validateValue(value)

  return (
    <div className={containerClass} data-testid="change-value">
      { isValid ?
        <span
          className={cs({
            [textVariants[variant]['covered']]: value > 0,
            [textVariants[variant]['uncovered']]: value < 0,
         })}
        >
          {value.toFixed(2)}%
        </span>
        :
        <>
          ø
        </>
      }
    </div>
  )
}

Change.propTypes = {
  value: PropTypes.number,
  variant: PropTypes.string
}

export default Change