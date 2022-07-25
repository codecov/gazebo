import cs from 'classnames'
import PropTypes from 'prop-types'

import { LINE_STATE } from 'shared/utils/fileviewer'

const classNamePerLineState = {
  [LINE_STATE.COVERED]: 'bg-ds-coverage-covered border-ds-primary-green',
  [LINE_STATE.UNCOVERED]:
    'text-[#E1B3BA] bg-ds-coverage-uncovered border-ds-primary-red pattern-dots',
  [LINE_STATE.PARTIAL]:
    'text-[#E8DFB2] bg-ds-coverage-partial border-ds-primary-yellow pattern-grid',
}

function CoverageSelect({ coverage, checked, onChange }) {
  const id = `show-${coverage.toLowerCase()}-lines`

  return (
    <div className="flex text-xs font-mono items-center gap-2">
      <input
        id={id}
        aria-label={id}
        onChange={onChange}
        checked={checked}
        className="cursor-pointer"
        type="checkbox"
      />
      <label
        htmlFor={id}
        className={cs(
          'cursor-pointer px-2 border-r-2 capitalize',
          classNamePerLineState[coverage]
        )}
      >
        <span className="text-black">{coverage.toLowerCase()}</span>
      </label>
    </div>
  )
}

CoverageSelect.propTypes = {
  coverage: PropTypes.oneOf([
    LINE_STATE.COVERED,
    LINE_STATE.UNCOVERED,
    LINE_STATE.PARTIAL,
  ]).isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default CoverageSelect
