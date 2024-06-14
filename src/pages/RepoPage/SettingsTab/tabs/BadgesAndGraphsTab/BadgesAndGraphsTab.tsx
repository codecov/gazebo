import { useRepoSettings } from 'services/repo'

import Badges from './Badges/Badges'
import Graphs from './Graphs'

function BadgesAndGraphsTab() {
  const { data } = useRepoSettings()
  const graphToken = data?.repository?.graphToken

  return (
    <div className="flex flex-col gap-4 lg:w-3/4">
      {graphToken && <Badges graphToken={graphToken} />}
      {graphToken && <Graphs graphToken={graphToken} />}
    </div>
  )
}

export default BadgesAndGraphsTab
