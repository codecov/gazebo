import PropTypes from 'prop-types'

import A from 'ui/A'
import Icon from 'ui/Icon'

function DirEntry({
  linkRef,
  name,
  urlPath,
  runPrefetch = () => Promise.resolve(),
  pageName = 'treeView',
  commitSha,
  queryParams,
}: DirEntryProps) {
  return (
    <div className="flex gap-3" onMouseEnter={async () => await runPrefetch()}>
      <A
        to={{
          pageName: pageName,
          options: {
            ref: linkRef,
            commit: commitSha,
            tree: urlPath ? `${urlPath}/${name}` : name,
            queryParams,
          },
        }}
        hook="expand-dir-entry"
        isExternal={false}
      >
        <Icon name="folder" size="md" variant="solid" />
        <span className="whitespace-pre">{name}</span>
      </A>
    </div>
  )
}

interface DirEntryProps {
  linkRef?: string
  name: string
  urlPath?: string
  runPrefetch?: () => Promise<void>
  pageName?: string
  commitSha?: string
  queryParams?: any
}

DirEntry.propTypes = {
  linkRef: PropTypes.string,
  name: PropTypes.string.isRequired,
  urlPath: PropTypes.string,
  runPrefetch: PropTypes.func,
  pageName: PropTypes.string,
  commitSha: PropTypes.string,
  queryParams: PropTypes.object,
}

export default DirEntry
