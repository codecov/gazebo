import { useRepoSettings } from 'services/repo'

import Badges from './Badges/Badges'

function BadgesAndGraphsTab() {
  const { data } = useRepoSettings()
  const repository = data?.repository

  return (
    <div className="flex flex-col gap-4">
      {repository?.graphToken && (
        <Badges
          graphToken={repository?.graphToken}
          defaultBranch={repository?.defaultBranch}
        />
      )}
    </div>
  )
}

export default BadgesAndGraphsTab
