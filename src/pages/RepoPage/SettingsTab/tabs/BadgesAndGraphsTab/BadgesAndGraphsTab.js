import { useRepoSettings } from 'services/repo'

import Badges from './Badges/Badges'
import Graphs from './Graphs'

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
      {repository?.graphToken && <Graphs graphToken={repository?.graphToken} />}
    </div>
  )
}

export default BadgesAndGraphsTab
