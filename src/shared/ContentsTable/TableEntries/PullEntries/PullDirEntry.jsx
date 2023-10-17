import PropTypes from 'prop-types'

import { usePrefetchPullDirEntry } from 'services/pathContents/pull/dir'

import DirEntry from '../BaseEntries/DirEntry'

function PullDirEntry({ pullId, urlPath, name, filters }) {
  const flags = filters?.flags?.length > 0 ? filters?.flags : []

  const { runPrefetch } = usePrefetchPullDirEntry({
    pullId,
    path: name,
    filters,
  })

  return (
    <DirEntry
      name={name}
      urlPath={urlPath}
      runPrefetch={runPrefetch}
      pageName="pullTreeView"
      queryParams={{ flags }}
    />
  )
}

PullDirEntry.propTypes = {
  pullId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  urlPath: PropTypes.string,
  filters: PropTypes.shape({
    ordering: PropTypes.shape({
      direction: PropTypes.string,
      parameter: PropTypes.any,
    }),
    searchValue: PropTypes.any,
    flags: PropTypes.arrayOf(PropTypes.string),
  }),
}

export default PullDirEntry
