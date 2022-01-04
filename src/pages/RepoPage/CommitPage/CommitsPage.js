import { useCommits } from 'services/commits'
import { useParams } from 'react-router'
import CommitsTable from './CommitsTable'
import Checkbox from 'ui/Checkbox'
import { useState } from 'react'

function CommitsPage() {
  const { provider, owner, repo } = useParams()
  const [hideFailedCI, setHideFailedCI] = useState(false)
  const { data: commits } = useCommits({
    provider,
    owner,
    repo,
    filters: {
      hideFailedCI,
    },
  })

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mb-4">
        <Checkbox
          label="Hide commits with failed CI"
          name="filter commits"
          onChange={(e) => setHideFailedCI(e.target.checked)}
          value={hideFailedCI}
        />
      </div>
      <CommitsTable commits={commits} />
    </div>
  )
}

export default CommitsPage
