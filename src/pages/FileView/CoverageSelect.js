import cs from 'classnames'
import PropTypes from 'prop-types'

function CoverageSelect({ covered, checked, onChange }) {
  return (
    <div className="flex text-xs font-mono items-center">
      <input
        aria-label={`show-${covered ? 'covered' : 'uncovered'}-lines`}
        onChange={onChange}
        checked={checked}
        className="cursor-pointer mr-2"
        type="checkbox"
      />
      <span
        className={cs('px-2 border-r-2', {
          'bg-ds-coverage-covered border-ds-primary-green': covered,
          'bg-ds-coverage-uncovered border-ds-primary-red': !covered,
        })}
      >
        {covered ? 'Covered' : 'Uncovered'}
      </span>
    </div>
  )
}

CoverageSelect.propTypes = {
  covered: PropTypes.bool.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default CoverageSelect
