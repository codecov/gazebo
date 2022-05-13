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
      />
      {/* CodeRenderer */}
      {segments.map((segment, segmentIndex) => {
        const content = segment.lines.map((line) => line.content).join('\n')
        return (
          <CodeRenderer
            code={content}
            key={segmentIndex}
            fileName={headName}
            rendererType="diff"
            LineComponent={({ i, line, getLineProps, getTokenProps }) => {
              // Wdyt
              const currentLine = segment.lines[i]
              return (
                <DiffLine
                  key={i + 1}
                  // Question: I added this so I don't have to recreate currentLine for every line, but it isn't as clear; thoughts?
                  segmentLine={segment.lines[i]}
                  rendererLine={line}
                  showLines={showLines}
                  // coverage={coverageData && coverageData[i + 1]}
                  getLineProps={getLineProps}
                  getTokenProps={getTokenProps}
                />
              )
            }}
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
}

export default FileDiff
