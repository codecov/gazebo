// import Select from "old_ui/Select";
import { useParams } from 'react-router'
import { usePulls } from 'services/pulls'
import PullsTabel from './PullsTable'

function PullsPage() {
  const { provider, owner, repo } = useParams()
  const { data: pulls } = usePulls({ provider, owner, repo })

  return (
    <div>
      <PullsTabel pulls={pulls} />
    </div>
  )
}

export default PullsPage
