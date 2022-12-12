import cs from 'classnames'
import { lazy, useState } from 'react'
import { useParams } from 'react-router-dom'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'
import { useBranches } from 'services/branches'
import { useRepoOverview } from 'services/repo'
import A from 'ui/A'
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
  const { selection } = useBranchSelector(
    branchesData?.branches,
    overview?.defaultBranch
  )
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

  return isPreviousData || isSuccess ? (
    <SilentNetworkErrorWrapper>
      <div className="mt-2">
        <A
          hook="toggle-chart"
          onClick={() => {
            setIsHidden(!isHidden)
            localStorage.setItem(chartKey, !isHidden)
          }}
        >
          <Icon
            size="md"
            name={isHidden ? 'chevron-right' : 'chevron-down'}
            variant="solid"
          />
          {isHidden ? 'Show Chart' : 'Hide Chart'}
        </A>
        <div
          className={cs({
            hidden: isHidden,
          })}
        >
          <Chart />
        </div>
      </div>
    </SilentNetworkErrorWrapper>
  ) : null
}

export default ToggleChart
