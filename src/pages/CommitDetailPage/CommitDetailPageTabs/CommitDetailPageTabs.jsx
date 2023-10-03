import PropTypes from 'prop-types'
import qs from 'qs'
import { useLocation, useParams } from 'react-router-dom'

import {
  commitFileviewString,
  commitTreeviewString,
} from 'pages/RepoPage/utils'
import { useLocationParams } from 'services/navigation'
import ToggleHeader from 'ui/FileViewer/ToggleHeader'
import TabNavigation from 'ui/TabNavigation'

function CommitDetailPageTabs({
  commitSHA,
  indirectChangedFilesCount,
  directChangedFilesCount,
}) {
  const { params } = useLocationParams()
  const { pathname } = useLocation()
  const { provider, owner, repo } = useParams()

  let queryParams = {}
  if (Object.keys(params).length > 0) {
    queryParams = params
  }

  const blobPath = pathname.includes(
    `/${provider}/${commitFileviewString({ owner, repo, commitSHA })}`
  )

  const filePath = pathname.includes(
    `/${provider}/${commitTreeviewString({ owner, repo, commitSHA })}`
  )

  let customLocation = undefined
  if (blobPath || filePath) {
    let queryString = qs.stringify(queryParams, { addQueryPrefix: true })
    customLocation = {
      pathname: `/${provider}/${owner}/${repo}/commit/${commitSHA}/tree${queryString}`,
    }
  }

  return (
    <TabNavigation
      tabs={[
        {
          pageName: 'commit',
          children: (
            <>
              Files changed
              <sup className="text-xs">{directChangedFilesCount}</sup>
            </>
          ),
          options: { commit: commitSHA, ...queryParams },
          exact: true,
        },
        {
          pageName: 'commitIndirectChanges',
          options: { commit: commitSHA, ...queryParams },
          children: (
            <>
              Indirect changes
              <sup className="text-xs">{indirectChangedFilesCount}</sup>
            </>
          ),
        },
        {
          pageName: 'commitTreeView',
          children: 'File explorer',
          options: { commit: commitSHA, ...queryParams },
          location: customLocation,
        },
      ]}
      component={<ToggleHeader coverageIsLoading={false} showHitCount={true} />}
    />
  )
}

CommitDetailPageTabs.propTypes = {
  commitSHA: PropTypes.string,
  indirectChangedFilesCount: PropTypes.number,
  directChangedFilesCount: PropTypes.number,
}

export default CommitDetailPageTabs
