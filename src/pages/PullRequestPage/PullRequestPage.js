import { useParams } from 'react-router-dom'

import Breadcrumb from 'ui/Breadcrumb'

function PullRequestPage() {
  const { owner, repo, pullid } = useParams()

  return (
    <div className="divide-y space-y-4">
      <Breadcrumb
        paths={[
          { pageName: 'owner', text: owner },
          { pageName: 'repo', text: repo },
          { pageName: 'pulls', text: 'Pulls' },
          {
            pageName: 'pull',
            options: { pullid },
            readOnly: true,
            text: pullid,
          },
        ]}
      />
      <div className="pt-4">todo</div>
    </div>
  )
}

export default PullRequestPage
