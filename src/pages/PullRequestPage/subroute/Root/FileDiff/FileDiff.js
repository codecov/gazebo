import PropTypes from 'prop-types'
import { Fragment } from 'react'

import { LINE_TYPE } from 'shared/utils/fileviewerLines'
import CodeRenderer from 'ui/CodeRenderer'
import CodeRendererCoverageHeader from 'ui/CodeRenderer/CodeRendererCoverageHeader'
import CodeRendererInfoRow from 'ui/CodeRenderer/CodeRendererInfoRow'
import DiffLine from 'ui/CodeRenderer/DiffLine'

const FileDiff = ({
  headName,
  segments = [],
  headTotals,
  baseTotals,
  patchTotals,
  lineCoverageStatesAndSetters,
  hasChanges,
  isNewFile,
  isRenamedFile,
  ...rest
}) => {
  const { covered, uncovered, partial } = lineCoverageStatesAndSetters
  const showLines = {
    showCovered: covered,
    showPartial: partial,
    showUncovered: uncovered,
  }

  const headCoverage = headTotals?.percentCovered
  const changeCoverage = headCoverage - baseTotals?.percentCovered
  const patchCoverage = patchTotals?.percentCovered
  const header = segments[0]?.header

  return (
    <div>
      {/* Header */}
      <CodeRendererCoverageHeader
        header={header}
        headName={headName}
        headCoverage={headCoverage}
        changeCoverage={changeCoverage}
        patchCoverage={patchCoverage}
        isNewFile={isNewFile}
        isRenamedFile={isRenamedFile}
      />
      {/* CodeRenderer */}
      {segments.map((segment, segmentIndex) => {
        const content = segment.lines.map((line) => line.content).join('\n')
        return (
          <Fragment key={`${headName}-${segmentIndex}`}>
            {hasChanges && <CodeRendererInfoRow type={'unexpectedChanges'} />}
            <CodeRenderer
              code={content}
              fileName={headName}
              rendererType="diff"
              LineComponent={({ i, line, ...props }) => (
                <DiffLine
                  // If this line one of the first 3 or last three lines of the segment
                  key={i + 1}
                  showLines={showLines}
                  lineContent={line}
                  edgeOfFile={i <= 2 || i >= segment.lines.length - 3}
                  {...props}
                  {...segment.lines[i]}
                />
              )}
            />
          </Fragment>
        )
      })}
    </div>
  )
}

FileDiff.propTypes = {
  headName: PropTypes.string,
  segments: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.string,
      lines: PropTypes.arrayOf(
        PropTypes.shape({
          baseNumber: PropTypes.string,
          headNumber: PropTypes.string,
          baseCoverage: PropTypes.oneOf([
            LINE_TYPE.HIT,
            LINE_TYPE.MISS,
            LINE_TYPE.PARTIAL,
          ]),
          headCoverage: PropTypes.oneOf([
            LINE_TYPE.HIT,
            LINE_TYPE.MISS,
            LINE_TYPE.PARTIAL,
          ]),
          content: PropTypes.string,
        })
      ),
    })
  ),
  isNewFile: PropTypes.bool,
  isRenamedFile: PropTypes.bool,
  headTotals: PropTypes.shape({
    percentCovered: PropTypes.number,
  }),
  baseTotals: PropTypes.shape({
    percentCovered: PropTypes.number,
  }),
  patchTotals: PropTypes.shape({
    percentCovered: PropTypes.number,
  }),
  lineCoverageStatesAndSetters: PropTypes.shape({
    covered: PropTypes.bool,
    uncovered: PropTypes.bool,
    partial: PropTypes.bool,
  }),
  hasChanges: PropTypes.bool,
}

export default FileDiff
