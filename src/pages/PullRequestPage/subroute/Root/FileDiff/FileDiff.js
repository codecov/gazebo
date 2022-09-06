import PropTypes from 'prop-types'
import { Fragment } from 'react'
import { useParams } from 'react-router-dom'

import { useSingularImpactedFileComparison } from 'services/pull'
import { CODE_RENDERER_TYPE } from 'shared/utils/fileviewer'
import A from 'ui/A'
import CodeRenderer from 'ui/CodeRenderer'
import CodeRendererInfoRow from 'ui/CodeRenderer/CodeRendererInfoRow'
import CriticalFileLabel from 'ui/CodeRenderer/CriticalFileLabel'
import DiffLine from 'ui/CodeRenderer/DiffLine'
import Icon from 'ui/Icon'

function FileDiff({ path }) {
  const { provider, owner, repo, pullId } = useParams()
  const { data, isLoading } = useSingularImpactedFileComparison({
    provider,
    owner,
    repo,
    pullId,
    path,
  })

  const { fileLabel, headName, isCriticalFile, segments } = data

  return (
    !isLoading && (
      <>
        {isCriticalFile && <CriticalFileLabel variant="borderBottom" />}
        {segments?.map((segment, segmentIndex) => {
          const content = segment.lines.map((line) => line.content).join('\n')
          return (
            <Fragment key={`${headName}-${segmentIndex}`}>
              <CodeRendererInfoRow>
                <span data-testid="patch">{segment?.header}</span>
                {segment?.hasUnintendedChanges && (
                  <div className="flex gap-1">
                    <Icon
                      variant="outline"
                      name="information-circle"
                      size="sm"
                    />
                    <span>
                      indirect coverage change{' '}
                      <A to={{ pageName: 'unexpectedChanges' }}>learn more</A>
                    </span>
                  </div>
                )}
                {fileLabel && (
                  <span className="border-l-2 pl-2">{fileLabel}</span>
                )}
              </CodeRendererInfoRow>
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
      </>
    )
  )
}

FileDiff.propTypes = {
  path: PropTypes.string,
}

export default FileDiff
