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
  ...rest
}) => {
  console.log('\n')
  console.log('file diff - segments')
  console.log(segments)

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
              // <DoubleLine
              console.log('segment.lines[i]')
              console.log(segment.lines[i])
              return (
                <DiffLine
                  key={i + 1}
                  line={line}
                  number={i + 1}
                  showLines={{
                    showCovered: false,
                    showPartial: false,
                    showUncovered: false,
                  }}
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
