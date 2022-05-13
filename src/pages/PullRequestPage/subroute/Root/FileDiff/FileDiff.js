import PropTypes from 'prop-types'

import { LINE_TYPE } from 'shared/utils/fileviewerLines'
import CodeRenderer from 'ui/CodeRenderer'
import CodeRendererCoverageHeader from 'ui/CodeRenderer/CodeRendererCoverageHeader'
import DiffLine from 'ui/CodeRenderer/DiffLine'

const FileDiff = ({
  headName,
  segments = [],
  headTotals,
  baseTotals,
  patchTotals,
  lineCoverageStatesAndSetters,
  isNewFile,
  isRenamedFile,
  ...rest
}) => {
  console.log('\n')
  console.log('file diff - segments')
  console.log(segments)

  const { covered, uncovered, partial } = lineCoverageStatesAndSetters
  const showLines = {
    showCovered: covered,
    showPartial: partial,
    showUncovered: uncovered,
  }

  const headCoverage = headTotals?.percentCovered
  const changeCoverage = headCoverage - baseTotals?.percentCovered
  const header = segments[0]?.header

  return (
    <div>
      {/* Header */}
      <CodeRendererCoverageHeader
        header={header}
        headName={headName}
        headCoverage={headCoverage}
        changeCoverage={changeCoverage}
        isNewFile={isNewFile}
        isRenamedFile={isRenamedFile}
      />
      {/* CodeRenderer */}
      {segments.map((segment, segmentIndex) => {
        const content = segment.lines.map((line) => line.content).join('\n')
        return (
          <CodeRenderer
            code={content}
            key={`${headName}-${segmentIndex}`}
            fileName={headName}
            rendererType="diff"
            LineComponent={({ i, line, ...props }) => (
              <DiffLine
                // If this line one of the first 3 or last three lines of the segment
                edgeOfFile={i <= 2 || i >= segment.lines.length - 3}
                key={i + 1}
                showLines={showLines}
                lineContent={line}
                {...props}
                {...segment.lines[i]}
              />
            )}
          />
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
}

export default FileDiff
