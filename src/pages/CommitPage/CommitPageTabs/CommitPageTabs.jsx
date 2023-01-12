import PropTypes from 'prop-types'
import { useLocation, useParams } from 'react-router-dom'

import {
  commitFileviewString,
  commitTreeviewString,
} from 'pages/RepoPage/utils'
import TabNavigation from 'ui/TabNavigation'

function CommitPageTabs({ commitSHA }) {
  const location = useLocation()
  const { provider, owner, repo } = useParams()

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
          children: 'Impacted Files',
          options: { commit: commitSHA },
          exact: true,
        },
        {
          pageName: 'commitTreeView',
          children: 'Files',
          options: { commit: commitSHA },
          location: customLocation,
        },
      ]}
    />
  )
}

CommitPageTabs.propTypes = {
  commitSHA: PropTypes.string,
}

export default CommitPageTabs
