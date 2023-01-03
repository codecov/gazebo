import cs from 'classnames'
import PropTypes from 'prop-types'

import { LINE_STATE } from 'shared/utils/fileviewer'
import CoverageSelectIcon from 'ui/Icon/CoverageSelectIcon'

const classNamePerLineState = {
  [LINE_STATE.COVERED]:
    'bg-ds-coverage-covered border-ds-primary-green font-regular',
  [LINE_STATE.UNCOVERED]:
    'bg-ds-coverage-uncovered border-ds-primary-red border-r-2 font-bold',
  [LINE_STATE.PARTIAL]:
    'bg-ds-coverage-partial border-ds-primary-yellow border-r-2 border-dotted font-bold',
}

// classNamePerLineState[coverage]
function CoverageSelect({ coverage }) {
  return (
    <div
      className={cs(
        'px-2 capitalize flex text-xs font-mono items-center gap-2',
        classNamePerLineState[coverage]
      )}
    >
      <span className="text-black">{coverage.toLowerCase()}</span>
      <CoverageSelectIcon coverage={coverage} />
    </div>
  )
}

CoverageSelect.propTypes = {
  coverage: PropTypes.oneOf([
    LINE_STATE.COVERED,
    LINE_STATE.UNCOVERED,
    LINE_STATE.PARTIAL,
  ]).isRequired,
}

export default CoverageSelect
