import PropTypes from 'prop-types'
import qs from 'qs'
import { useLocation } from 'react-router-dom'

import { usePrefetchPullDirEntry } from 'services/pathContents/pull/dir'

import DirEntry from '../BaseEntries/DirEntry'

function PullDirEntry({ pullId, urlPath, name, filters }) {
  const { search } = useLocation()
  const searchParams = qs.parse(search, { ignoreQueryPrefix: true })

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
      queryParams={searchParams}
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
