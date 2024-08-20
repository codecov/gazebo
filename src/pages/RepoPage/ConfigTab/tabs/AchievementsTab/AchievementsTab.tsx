import { useParams } from 'react-router-dom'

import badges from 'assets/svg/badges.svg'
import A from 'ui/A'

import { useAchievements } from './hooks/useAchievements'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

function AchievementsTab() {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data } = useAchievements({
    provider,
    owner,
    repo,
  })

  if (!data?.active) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-semibold">Leaderboards</h1>
        <p>
          This leaderboard highlights the top performers in maintaining high
          code coverage, increasing the number of covered lines, and actively
          reviewing and merging PRs over the last 30 days. It recognizes
          teammates who consistently contribute to code quality and
          collaboration.
        </p>
        <hr />
        <div className="mt-4 flex flex-col items-center gap-3">
          <img src={badges} alt="badges" width="287px" />
          <h2 className="text-lg font-semibold">No data displayed</h2>
          <p className="text-sm text-gray-500">
            To view the leaderboards,{' '}
            <A
              to={{ pageName: 'new' }}
              hook="configure-repo"
              isExternal={false}
            >
              configure
            </A>{' '}
            your repo.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-bold">Leaderboards</h1>
      <p className="text-sm text-gray-500">Coming soon...</p>
    </div>
  )
}

export default AchievementsTab
