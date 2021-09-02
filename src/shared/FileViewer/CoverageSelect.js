import cs from 'classnames'
import PropTypes from 'prop-types'
import { LINE_STATE } from './lineStates'

const classNamePerLineState = {
  [LINE_STATE.COVERED]: 'bg-ds-coverage-covered border-ds-primary-green',
  [LINE_STATE.UNCOVERED]: 'bg-ds-coverage-uncovered border-ds-primary-red',
  [LINE_STATE.PARTIAL]: 'bg-ds-coverage-partial border-ds-primary-yellow',
}

function CoverageSelect({ coverage, checked, onChange }) {
  const lineState = getLineState()

  function getLineState() {
    if (coverage === 0) {
      return LINE_STATE.UNCOVERED
    } else if (coverage === 1) {
      return LINE_STATE.COVERED
    } else if (coverage === 2) {
      return LINE_STATE.PARTIAL
    }
  }

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
      <span className={cs('px-2 border-r-2', classNamePerLineState[lineState])}>
        {coverage === 1 ? 'Covered' : coverage === 2 ? 'Partial' : 'Uncovered'}
      </span>
    </div>
  )
}

CoverageSelect.propTypes = {
  coverage: PropTypes.number.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default CoverageSelect
