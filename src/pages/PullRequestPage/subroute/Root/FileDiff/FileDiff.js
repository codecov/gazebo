import PropTypes from 'prop-types'
import { Fragment } from 'react'
import { useParams } from 'react-router-dom'

import { useSingularImpactedFileComparison } from 'services/pull'
import { CODE_RENDERER_INFO, CODE_RENDERER_TYPE } from 'shared/utils/fileviewer'
import CodeRenderer from 'ui/CodeRenderer'
import CodeRendererInfoRow from 'ui/CodeRenderer/CodeRendererInfoRow'
import CriticalFileLabel from 'ui/CodeRenderer/CriticalFileLabel'
import DiffLine from 'ui/CodeRenderer/DiffLine'

function FileDiff({ path }) {
  const { provider, owner, repo, pullId } = useParams()
  const { data, isLoading } = useSingularImpactedFileComparison({
    provider,
    owner,
    repo,
    pullId,
    path,
  })

  const { headName, isCriticalFile, segments } = data

  return (
    !isLoading && (
      <Fragment>
        {isCriticalFile && <CriticalFileLabel variant="borderBottom" />}
        {segments?.map((segment, segmentIndex) => {
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
      </Fragment>
    )
  )
}

FileDiff.propTypes = {
  path: PropTypes.string,
}

export default FileDiff
