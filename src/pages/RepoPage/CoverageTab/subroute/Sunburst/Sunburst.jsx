import { useParams } from 'react-router-dom'

import { useBranches } from 'services/branches'
import { useSunburstCoverage } from 'services/charts'
import { useRepoOverview } from 'services/repo'
import SunburstChart from 'ui/SunburstChart'

import { useBranchSelector } from '../../hooks'

const Placeholder = () => (
  <div
    data-testid="placeholder"
    className=" w-full h-full animate-pulse bg-ds-gray-tertiary rounded-full"
  />
)

function Sunburst() {
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
  const { data, isSuccess } = useSunburstCoverage(
    { provider, owner, repo, query: { branch: selection?.name } },
    {
      enabled: !!selection?.name,
      select: (data) => {
        return data[0]
      },
    }
  )

  console.log(branchesData)
  console.log(isSuccess)
  if (!isSuccess) {
    return <Placeholder />
  }

  return (
    <SunburstChart
      data={data}
      svgFontSize="24px"
      svgRenderSize={930}
      selector={(data) => data?.coverage}
    />
  )
}

export default Sunburst
