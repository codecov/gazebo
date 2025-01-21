import omit from 'lodash/omit'
import PropTypes from 'prop-types'
import qs from 'qs'
import { useLocation, useParams } from 'react-router-dom'

import {
  commitFileviewString,
  commitTreeviewString,
} from 'pages/RepoPage/utils'
import { useRepoSettingsTeam } from 'services/repo'
import { useIsTeamPlan } from 'services/useIsTeamPlan'
import TabNavigation from 'ui/TabNavigation'

function CommitCoverageTabs({
  commitSha,
  indirectChangedFilesCount,
  directChangedFilesCount,
}) {
  const { provider, owner, repo } = useParams()
  const location = useLocation()
  const { data: isTeamPlan } = useIsTeamPlan({ owner, provider })
  const { data: repoData } = useRepoSettingsTeam()

  const showIndirectChanges = !(repoData?.repository?.private && isTeamPlan)

  const params = qs.parse(location.search, {
    ignoreQueryPrefix: true,
    depth: 1,
  })

  let queryParams = undefined
  if (Object.keys(params).length > 0) {
    queryParams = omit(params, ['search'])
  }

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
        ...(showIndirectChanges
          ? [
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
            ]
          : []),
        {
          pageName: 'commitTreeView',
          children: 'File explorer',
          options: { commit: commitSha, queryParams },
          location: customLocation,
        },
      ]}
    />
  )
}

CommitCoverageTabs.propTypes = {
  commitSha: PropTypes.string,
  indirectChangedFilesCount: PropTypes.number,
  directChangedFilesCount: PropTypes.number,
}

export default CommitCoverageTabs
