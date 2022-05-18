import cs from 'classnames'
import PropTypes from 'prop-types'

import {
  classNamePerLineState,
  getLineState,
  LINE_TYPE,
  lineStateToLabel,
} from 'shared/utils/fileviewer'

/**
 * Check if the first character is a + or -
 * @param {String} str
 * @returns {Boolean}
 */
const checkRawDiff = (str) => /^\+|-/i.test(str)

/**
 * Check if the line is part of a diff and it is the beginning or end of a segment
 * @param {Number} isEdge
 * @param {String} str
 * @returns
 */
const shouldHighlight = (isEdge) => (str) => checkRawDiff(str) || !isEdge

function DiffLine({
  edgeOfFile = false,
  getTokenProps,
  showLines,
  lineContent,
  headNumber,
  baseNumber,
  headCoverage,
  baseCoverage,
}) {
  const baseLineState = getLineState({ coverage: baseCoverage, showLines })
  const headLineState = getLineState({ coverage: headCoverage, showLines })
  const highlight = shouldHighlight(edgeOfFile)

  return (
    <tr data-testid="fv-diff-line">
      <td
        aria-label={lineStateToLabel[baseLineState]}
        className={cs(
          'line-number text-ds-gray-quaternary font-mono text-right border-solid px-2 select-none',
          classNamePerLineState[baseLineState]
        )}
      >
        {baseNumber}
      </td>
      <td
        aria-label={lineStateToLabel[headLineState]}
        className={cs(
          'line-number text-ds-gray-quaternary font-mono text-right border-solid px-2 select-none',
          classNamePerLineState[headLineState]
        )}
      >
        {headNumber}
      </td>
      <td
        data-testid="affected-lines"
        className={cs('pl-2 break-all', {
          'bg-ds-gray-secondary':
            highlight(lineContent[0]?.content) ||
            highlight(lineContent[1]?.content),
        })}
      >
        {lineContent.map((token, key) => (
          <span key={key} {...getTokenProps({ token, key })} />
        ))}
      </td>
    </tr>
  )
}

DiffLine.propTypes = {
  edgeOfFile: PropTypes.bool,
  lineContent: PropTypes.array.isRequired,
  showLines: PropTypes.shape({
    showCovered: PropTypes.bool.isRequired,
    showUncovered: PropTypes.bool.isRequired,
    showPartial: PropTypes.bool.isRequired,
  }).isRequired,
  headNumber: PropTypes.string,
  baseNumber: PropTypes.string,
  baseCoverage: PropTypes.oneOf(Object.values(LINE_TYPE)),
  headCoverage: PropTypes.oneOf(Object.values(LINE_TYPE)),
  getTokenProps: PropTypes.func,
}

export default DiffLine
