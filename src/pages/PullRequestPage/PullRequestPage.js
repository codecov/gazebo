import { Suspense } from 'react'
import { useParams } from 'react-router-dom'

import Breadcrumb from 'ui/Breadcrumb'
import Spinner from 'ui/Spinner'

import PullDetail from './PullDetail'

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
      <div className="pt-4">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-16">
              <Spinner />
            </div>
          }
        >
          <PullDetail />
        </Suspense>
      </div>
    </div>
  )
}

export default PullRequestPage
