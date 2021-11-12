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
    filter: !isCommitHidden,
  })
  console.log(commits)

  return (
    <div className="w-full h-screen overflow-scroll">
      <div className="mb-6">
        <Checkbox
          ref={function noRefCheck() {}}
          label={
            <span className="text-ds-gray-quinary">
              Hide commits without uploaded coverage (3)
            </span>
          }
          name="test"
          onBlur={function noRefCheck() {}}
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
