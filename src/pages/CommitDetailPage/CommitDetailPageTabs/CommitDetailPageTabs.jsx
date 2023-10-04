import omit from 'lodash/omit'
import PropTypes from 'prop-types'
import qs from 'qs'
import { useLocation, useParams } from 'react-router-dom'

import {
  commitFileviewString,
  commitTreeviewString,
} from 'pages/RepoPage/utils'
import ToggleHeader from 'ui/FileViewer/ToggleHeader'
import TabNavigation from 'ui/TabNavigation'

function CommitDetailPageTabs({
  commitSHA,
  indirectChangedFilesCount,
  directChangedFilesCount,
}) {
  const { provider, owner, repo } = useParams()
  const location = useLocation()
  const params = qs.parse(location.search, {
    ignoreQueryPrefix: true,
    depth: 1,
  })

  let queryParams = undefined
  if (Object.keys(params).length > 0) {
    queryParams = omit(params, ['search'])
  }

  const blobPath = location.pathname.includes(
    `/${provider}/${commitFileviewString({ owner, repo, commitSHA })}`
  )

  const filePath = location.pathname.includes(
    `/${provider}/${commitTreeviewString({ owner, repo, commitSHA })}`
  )

  let customLocation = undefined
  if (blobPath || filePath) {
    customLocation = {
      pathname: `/${provider}/${owner}/${repo}/commit/${commitSHA}/tree`,
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
          options: { commit: commitSHA, queryParams },
          exact: true,
        },
        {
          pageName: 'commitIndirectChanges',
          options: { commit: commitSHA, queryParams },
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
          options: { commit: commitSHA, queryParams },
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
