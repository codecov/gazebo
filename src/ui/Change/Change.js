import cs from 'classnames'
import PropTypes from 'prop-types'

// TODO: This is likely fixed in the future when looking at CSS/styling on tables
const variantClasses = {
  table: `flex justify-end w-full font-semibold`,
  fileViewer: `flex justify-end font-semibold text-sm`,
  coverageCard: `text-xl text-center font-light`
}

const Change = ({value, variant}) => {
  const className = variantClasses[variant]

  return (
    <div className={`${className}`}>
      {(!isNaN(value) && value !== 0) ?
        <span className={cs({
          'bg-ds-coverage-uncovered': value < 0 ,
          'bg-ds-coverage-covered': value > 0,
          'text-ds-primary-red bg-ds-coverage-transparent': value < 0 && variant === "coverageCard",
          'text-ds-primary-green bg-ds-coverage-transparent': value > 0 && variant === "coverageCard",
        })}>
          {value.toFixed(2)}%
        </span>
        :
        <span>
          ø
        </span>
      }
    </div>
  )
}

Change.propTypes = {
  value: PropTypes.number,
  variant: PropTypes.string
}

export default Change




{/* <span
  className={cs('text-xl text-center font-light', {
    'text-ds-primary-red': change < 0,
    'text-ds-primary-green': change >= 0,
  })}
>
  {coverage && parentCoverage ? `${change} %` : '-'}
</span> */}