import { usePulls } from 'services/pulls'
import PullsTable from './PullsTable'
import { useParams } from 'react-router'

import { useSetCrumbs } from '../context'
function PullsTab() {
  const setCrumbs = useSetCrumbs()
  const { provider, owner, repo } = useParams()
  const { data: pulls } = usePulls({ provider, owner, repo })
  setCrumbs()
  return (
    <div className="flex-1">
      <PullsTable pulls={pulls} />
    </div>
  )
}

export default PullsTab
