import uniqueId from 'lodash/uniqueId'
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import { useParams } from 'react-router-dom'

import { useNavLinks } from 'services/navigation'
import { useSingularImpactedFileComparison } from 'services/pull'
import { CODE_RENDERER_TYPE } from 'shared/utils/fileviewer'
import A from 'ui/A'
import CodeRenderer from 'ui/CodeRenderer'
import CodeRendererInfoRow from 'ui/CodeRenderer/CodeRendererInfoRow'
import CriticalFileLabel from 'ui/CodeRenderer/CriticalFileLabel'
import DiffLine from 'ui/CodeRenderer/DiffLine'
import Spinner from 'ui/Spinner'

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

function FileDiff({ path }) {
  const { provider, owner, repo, pullId } = useParams()
  const { pullFileView } = useNavLinks()
  const { data, isLoading } = useSingularImpactedFileComparison({
    provider,
    owner,
    repo,
    pullId,
    path,
    filters: { hasUnintendedChanges: true },
  })

  if (isLoading) {
    return <Loader />
  }

  const { fileLabel, headName, isCriticalFile, segments } = data

  return (
    <>
      {isCriticalFile && <CriticalFileLabel variant="borderTop" />}
      {segments?.map((segment, segmentIndex) => {
        const content = segment.lines.map((line) => line.content).join('\n')
        return (
          <Fragment key={`${headName}-${segmentIndex}`}>
            <CodeRendererInfoRow>
              <div className="flex w-full justify-between">
                <div className="flex gap-1">
                  <span data-testid="patch">{segment?.header}</span>
                  {fileLabel && (
                    <span className="border-l-2 pl-2">{fileLabel}</span>
                  )}
                </div>
                <A
                  href={pullFileView.path({ pullId, tree: path })}
                  isExternal
                  hook="pull full file"
                >
                  View full file
                </A>
              </div>
            </CodeRendererInfoRow>
            <CodeRenderer
              code={content}
              fileName={headName}
              rendererType={CODE_RENDERER_TYPE.DIFF}
              LineComponent={({ i, line, ...props }) => (
                <DiffLine
                  // If this line one of the first 3 or last three lines of the segment
                  key={uniqueId(i)}
                  lineContent={line}
                  edgeOfFile={i <= 2 || i >= segment.lines.length - 3}
                  path={data?.hashedPath}
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
}

FileDiff.propTypes = {
  path: PropTypes.string,
}

export default FileDiff
