import { useCommits } from 'services/commits'
import { useParams } from 'react-router'
import CommitsTable from './CommitsTable'

function CommitsPage() {
  const { provider, owner, repo } = useParams()
  const { data: commits } = useCommits({ provider, owner, repo })

  return (
    <div className="w-full h-screen overflow-scroll">
      <CommitsTable commits={commits} />
    </div>
  )
}

export default CommitsPage
