import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useBranches } from 'services/branches'
import { useSunburstCoverage } from 'services/charts'
import { useRepoOverview } from 'services/repo'
import SunburstChart from 'ui/SunburstChart'

import { useBranchSelector } from '../../hooks'

const Placeholder = () => (
  <div
    data-testid="placeholder"
    className="animate-pulse bg-ds-gray-tertiary rounded-full aspect-square"
  />
)

// eslint-disable-next-line max-statements
function Sunburst() {
  const [currentPath, setCurrentPath] = useState('/.')
  const { provider, owner, repo } = useParams()
  const { data: overview } = useRepoOverview({
    provider,
    repo,
    owner,
  })
  const { data: branchesData } = useBranches({ repo, provider, owner })
  const { selection } = useBranchSelector(
    branchesData?.branches,
    overview?.defaultBranch
  )

  const { data, isFetching, isError } = useSunburstCoverage(
    { provider, owner, repo, query: { branch: selection?.name } },
    {
      enabled: !!selection?.name,
      suspense: false,
      select: (data) => data[0],
    }
  )

  if (isFetching) {
    return <Placeholder />
  }

  if (isError) {
    return <p>The sunburst chart failed to load.</p>
  }

  return (
    <>
      <SunburstChart
        data={data}
        svgFontSize="24px"
        svgRenderSize={930}
        selector={(data) => data?.coverage}
        onHover={(path) => setCurrentPath(`${path}`)}
      />
      <span dir="rtl" className="truncate text-left">
        {currentPath}
      </span>
    </>
  )
}

export default Sunburst
