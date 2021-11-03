import { useParams } from 'react-router-dom'

import { usePull } from 'services/pull/hooks'
import PullHeader from './components/PullHeader'

function PullDetail() {
  const { provider, owner, repo, pullid } = useParams()
  const { data: pull } = usePull({ provider, owner, repo, pullid })

  return (
    <div className="divide-y space-y-4">
      <PullHeader pull={pull} />
      <div className="pt-4">TODO</div>
    </div>
  )
}

export default PullDetail
