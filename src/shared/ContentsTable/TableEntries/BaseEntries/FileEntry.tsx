import A from 'ui/A'
import Icon from 'ui/Icon'

import { displayTypeParameter } from '../../constants'

interface FileHeaderProps {
  displayAsList: boolean
  path: string
  name: string
}

const FileHeader = ({ displayAsList, path, name }: FileHeaderProps) => {
  return (
    <div className="flex items-center gap-1 break-all">
      {!displayAsList && <Icon name="document" size="md" />}
      {displayAsList ? path : name}
    </div>
  )
}

function FileEntry({
  linkRef,
  path,
  name,
  urlPath,
  displayType,
  runPrefetch = () => Promise.resolve(),
  pageName = 'fileViewer',
  commitSha,
  queryParams = {},
}: FileEntryProps) {
  const displayAsList = displayType === displayTypeParameter.list
  return (
    <div
      className="flex items-center"
      onMouseEnter={async () => await runPrefetch()}
    >
      <A
        to={{
          pageName,
          options: {
            ref: linkRef,
            commit: commitSha,
            tree: displayAsList ? path : urlPath ? `${urlPath}/${name}` : name,
            queryParams,
          },
        }}
        hook="expand-file-entry"
        isExternal={false}
      >
        <FileHeader displayAsList={displayAsList} path={path} name={name} />
      </A>
    </div>
  )
}

interface FileEntryProps {
  linkRef?: string
  path: string
  name: string
  displayType?: (typeof displayTypeParameter)[keyof typeof displayTypeParameter]
  urlPath: string
  runPrefetch?: () => Promise<void>
  pageName?: string
  commitSha?: string
  queryParams?: any
}

export default FileEntry
