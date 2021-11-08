import { usePulls } from 'services/pulls'
import PullsTable from './PullsTable'
import { useParams } from 'react-router'

function PullsPage() {
  const { provider, owner, repo } = useParams()
  const { data: pulls } = usePulls({ provider, owner, repo })

  return (
    <div className="w-full h-screen overflow-scroll">
      <PullsTable pulls={pulls} />
    </div>
  )
}

export default PullsPage
