import { useCommits } from 'services/commits'
import { useParams } from 'react-router'
import CommitsTable from './CommitsTable'
import Checkbox from 'ui/Checkbox'
import { useState } from 'react'

function CommitsPage() {
  const { provider, owner, repo } = useParams()
  const [isCommitHidden, setIsCommitHidden] = useState(false)
  const { data: commits } = useCommits({
    provider,
    owner,
    repo,
    filter: isCommitHidden,
  })

  return (
    <div className="w-full h-screen overflow-scroll">
      <div className="mb-6">
        <Checkbox
          label="Hide commits without uploaded coverage (3)"
          name="test"
          onChange={function noRefCheck(e) {
            setIsCommitHidden(e.target.checked)
          }}
          value={isCommitHidden}
        />
      </div>
      <CommitsTable commits={commits} />
    </div>
  )
}

export default CommitsPage
