import { useRepoSettings } from 'services/repo'

import Badges from './Badges/Badges'

function BadgesAndGraphsTab() {
  const { data } = useRepoSettings()
  const defaultBranch = data?.repository?.defaultBranch
  const graphToken = data?.repository?.graphToken

  return (
    <div className="flex flex-col gap-4">
      {graphToken && (
        <Badges graphToken={graphToken} defaultBranch={defaultBranch} />
      )}
    </div>
  )
}

export default BadgesAndGraphsTab
