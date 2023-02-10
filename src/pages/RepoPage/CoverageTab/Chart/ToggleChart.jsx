import cs from 'classnames'
import { lazy, useState } from 'react'
import { useParams } from 'react-router-dom'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'
import { useBranches } from 'services/branches'
import { useRepoOverview } from 'services/repo'
import Icon from 'ui/Icon'

import { useBranchSelector, useRepoCoverageTimeseries } from '../hooks'

const Chart = lazy(() => import('./Chart'))

const chartKey = 'is-chart-hidden'

function ToggleChart() {
  const [isHidden, setIsHidden] = useState(
    () => localStorage.getItem(chartKey) === 'true'
  )

  const { provider, owner, repo } = useParams()
  const { data: overview } = useRepoOverview({
    provider,
    repo,
    owner,
  })
  const { data: branchesData } = useBranches({ repo, provider, owner })
  const { selection } = useBranchSelector({
    branches: branchesData?.branches,
    defaultBranch: overview?.defaultBranch,
  })

  const { isPreviousData, isSuccess } = useRepoCoverageTimeseries(
    {
      branch: selection?.name,
    },
    {
      enabled: !!selection?.name,
      suspense: false,
      keepPreviousData: true,
    }
  )

  if (!isPreviousData && !isSuccess) {
    return null
  }

  return (
    <SilentNetworkErrorWrapper>
      <button
        className="flex items-center text-ds-blue cursor-pointer hover:underline mt-2"
        onClick={() => {
          setIsHidden(!isHidden)
          localStorage.setItem(chartKey, !isHidden)
        }}
        data-cy="toggle-chart"
        data-marketing="toggle-chart"
      >
        <Icon
          size="md"
          name={isHidden ? 'chevron-right' : 'chevron-down'}
          variant="solid"
        />
        {isHidden ? 'Show Chart' : 'Hide Chart'}
      </button>
      <div
        className={cs({
          hidden: isHidden,
        })}
      >
        <Chart />
      </div>
    </SilentNetworkErrorWrapper>
  )
}

export default ToggleChart
