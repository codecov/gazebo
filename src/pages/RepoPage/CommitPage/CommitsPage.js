import { useCommits } from 'services/commits'
import { useParams } from 'react-router'
import CommitsTable from './CommitsTable'
import Checkbox from 'ui/Checkbox'
import { useState } from 'react'
import PropTypes from 'prop-types'

function CommitsPage({ branchName }) {
  const { provider, owner, repo } = useParams()
  const [hideFailedCI, setHideFailedCI] = useState(false)
  const { data: commits } = useCommits({
    provider,
    owner,
    repo,
    filters: {
      hideFailedCI,
      branchName,
    },
  })

  return (
    <div className="w-full h-screen overflow-scroll">
      <div className="mb-4 flex mt-2 sm:justify-end sm:mt-0">
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
CommitsPage.propTypes = {
  branchName: PropTypes.string,
}

export default CommitsPage
