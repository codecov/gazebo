import cs from 'classnames'
import PropTypes from 'prop-types'

import {
  classNamePerLineContent,
  classNamePerLineState,
  getLineState,
  LINE_TYPE,
  lineStateToLabel,
} from 'shared/utils/fileviewer'
import CoverageSelectIcon from 'ui/Icon/CoverageSelectIcon'

function DiffLine({
  getTokenProps,
  lineContent,
  headNumber,
  baseNumber,
  headCoverage,
  baseCoverage,
}) {
  const baseLineState = getLineState({ coverage: baseCoverage })
  const headLineState = getLineState({ coverage: headCoverage })

  return (
    <tr data-testid="fv-diff-line">
      <td
        aria-label={lineStateToLabel[baseLineState]}
        className={cs(
          'line-number text-ds-gray-quaternary font-mono text-right border-solid px-2 select-none font-bold',
          classNamePerLineState[baseLineState]
        )}
      >
        <span className="text-black">{baseNumber}</span>
      </td>
      <td
        aria-label={lineStateToLabel[headLineState]}
        className={cs(
          'line-number text-ds-gray-quaternary font-mono text-right border-solid px-2 select-none',
          classNamePerLineState[headLineState]
        )}
      >
        <span className="text-black">{headNumber}</span>
      </td>
      <td
        data-testid="affected-lines"
        className={cs('pl-2 break-all', classNamePerLineContent[headLineState])}
      >
        <div className="flex items-center justify-between">
          <div>
            {lineContent.map((token, key) => (
              <span key={key} {...getTokenProps({ token, key })} />
            ))}
          </div>
          <CoverageSelectIcon coverage={headLineState} />
        </div>
      </td>
    </tr>
  )
}

DiffLine.propTypes = {
  edgeOfFile: PropTypes.bool,
  lineContent: PropTypes.array.isRequired,
  headNumber: PropTypes.string,
  baseNumber: PropTypes.string,
  baseCoverage: PropTypes.oneOf(Object.values(LINE_TYPE)),
  headCoverage: PropTypes.oneOf(Object.values(LINE_TYPE)),
  getTokenProps: PropTypes.func,
}

export default DiffLine
