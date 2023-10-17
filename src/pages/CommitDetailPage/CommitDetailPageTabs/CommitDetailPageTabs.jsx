import omit from 'lodash/omit'
import PropTypes from 'prop-types'
import qs from 'qs'
import { useLocation, useParams } from 'react-router-dom'

import {
  commitFileviewString,
  commitTreeviewString,
} from 'pages/RepoPage/utils'
import { useFlags } from 'shared/featureFlags'
import ToggleHeader from 'ui/FileViewer/ToggleHeader'
import TabNavigation from 'ui/TabNavigation'

function CommitDetailPageTabs({
  commitSha,
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

  const { commitTabFlagMultiSelect } = useFlags({
    commitTabFlagMultiSelect: false,
  })

  const blobPath = location.pathname.includes(
    `/${provider}/${commitFileviewString({ owner, repo, commitSha })}`
  )

  const filePath = location.pathname.includes(
    `/${provider}/${commitTreeviewString({ owner, repo, commitSha })}`
  )

  let customLocation = undefined
  if (blobPath || filePath) {
    customLocation = {
      pathname: `/${provider}/${owner}/${repo}/commit/${commitSha}/tree`,
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
          options: { commit: commitSha, queryParams },
          exact: true,
        },
        {
          pageName: 'commitIndirectChanges',
          options: { commit: commitSha, queryParams },
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
          options: { commit: commitSha, queryParams },
          location: customLocation,
        },
      ]}
      component={
        <ToggleHeader
          coverageIsLoading={false}
          showHitCount={true}
          showFlagsSelect={commitTabFlagMultiSelect}
        />
      }
    />
  )
}

CommitDetailPageTabs.propTypes = {
  commitSha: PropTypes.string,
  indirectChangedFilesCount: PropTypes.number,
  directChangedFilesCount: PropTypes.number,
}

export default CommitDetailPageTabs
