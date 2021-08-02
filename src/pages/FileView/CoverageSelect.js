import cs from 'classnames'
import PropTypes from 'prop-types'

function CoverageSelect({ coverage, checked, onChange }) {
  return (
    <div className="flex text-xs font-mono items-center">
      <input
        aria-label={`show-${
          coverage === 1 ? 'covered' : coverage === 2 ? 'partial' : 'uncovered'
        }-lines`}
        onChange={onChange}
        checked={checked}
        className="cursor-pointer mr-2"
        type="checkbox"
      />
      <span
        className={cs('px-2 border-r-2', {
          'bg-ds-coverage-covered border-ds-primary-green': coverage === 1,
          'bg-ds-coverage-uncovered border-ds-primary-red': coverage === 0,
          'bg-ds-coverage-partial border-ds-primary-yellow': coverage === 2,
        })}
      >
        {coverage === 1 ? 'Covered' : coverage === 2 ? 'Partial' : 'Uncovered'}
      </span>
    </div>
  )
}

CoverageSelect.propTypes = {
  coverage: PropTypes.bool.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default CoverageSelect
