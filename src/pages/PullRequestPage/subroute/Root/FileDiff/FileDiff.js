import PropTypes from 'prop-types'
import { Fragment } from 'react'

import {
  CODE_RENDERER_INFO,
  CODE_RENDERER_TYPE,
  LINE_TYPE,
} from 'shared/utils/fileviewer'
import CodeRenderer from 'ui/CodeRenderer'
import CodeRendererInfoRow from 'ui/CodeRenderer/CodeRendererInfoRow'
import CriticalFileLabel from 'ui/CodeRenderer/CriticalFileLabel'
import DiffLine from 'ui/CodeRenderer/DiffLine'
import FileHeader from 'ui/CodeRenderer/FileHeader'

function setFileLabel({ isNewFile, isRenamedFile, isDeletedFile }) {
  if (isNewFile) return 'New'
  if (isRenamedFile) return 'Renamed'
  if (isDeletedFile) return 'Deleted'
  return null
}

const FileDiff = ({
  headName,
  segments = [],
  headTotals,
  baseTotals,
  patchTotals,
  lineCoverageStatesAndSetters,
  isNewFile,
  isRenamedFile,
  isDeletedFile,
  isCriticalFile,
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
  const fileLabel = setFileLabel({ isNewFile, isRenamedFile, isDeletedFile })
  const coverage = [
    { label: 'HEAD', value: headCoverage },
    { label: 'Patch', value: patchCoverage },
    { label: 'Change', value: changeCoverage },
  ]
  return (
    <div>
      {/* Header */}
      <FileHeader
        headName={headName}
        coverage={coverage}
        fileLabel={fileLabel}
      />
      {/* Critical File Label */}
      {isCriticalFile ? <CriticalFileLabel /> : null}
      {/* CodeRenderer */}
      {segments.map((segment, segmentIndex) => {
        const content = segment.lines.map((line) => line.content).join('\n')
        return (
          <Fragment key={`${headName}-${segmentIndex}`}>
            <CodeRendererInfoRow
              patch={segment?.header}
              type={
                segment?.hasUnintendedChanges
                  ? CODE_RENDERER_INFO.UNEXPECTED_CHANGES
                  : CODE_RENDERER_INFO.EMPTY
              }
            />
            <CodeRenderer
              code={content}
              fileName={headName}
              rendererType={CODE_RENDERER_TYPE.DIFF}
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
  isDeletedFile: PropTypes.bool,
  isCriticalFile: PropTypes.bool,
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
