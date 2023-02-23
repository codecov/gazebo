import PropTypes from 'prop-types'

import { usePrefetchPullDirEntry } from 'services/pathContentsTable/pull/dir'

import DirEntry from '../BaseEntries/DirEntry'

function PullDirEntry({ pullId, urlPath, name, filters }) {
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
  }),
}

export default PullDirEntry
