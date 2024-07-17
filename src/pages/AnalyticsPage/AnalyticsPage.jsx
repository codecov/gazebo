import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import NotFound from 'pages/NotFound'
import { useLocationParams } from 'services/navigation'
import { orderingOptions } from 'services/repos'
import { useOwner } from 'services/user'
import { useFlags } from 'shared/featureFlags'
import ReposTable from 'shared/ListRepo/ReposTable'
import { cn } from 'shared/utils/cn'
import LoadingLogo from 'ui/LoadingLogo'

import ChartSelectors from './ChartSelectors'
import './analytics.css'
import Header from './Header'
import Tabs from './Tabs'

const Chart = lazy(() => import('./Chart'))

function SuspenseFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <LoadingLogo />
    </div>
  )
}

const defaultQueryParams = {
  search: '',
  repositories: [],
  ordering: orderingOptions[0]['ordering'],
  direction: orderingOptions[0]['direction'],
  startDate: null,
  endDate: null,
}

function AnalyticsPage() {
  const { params, updateParams } = useLocationParams(defaultQueryParams)
  const { owner } = useParams()
  const { data: ownerData } = useOwner({ username: owner })

  const { newHeader } = useFlags({
    newHeader: false,
  })

  const orderOptions = orderingOptions

  const sortItem =
    orderOptions.find(
      (option) =>
        option.ordering === params.ordering &&
        option.direction === params.direction
    ) || orderOptions[0]

  if (!ownerData) {
    return <NotFound />
  }

  return (
    <div className={cn({ 'mt-2': !newHeader })}>
      {newHeader ? null : <Header />}
      <div className="flex flex-col gap-4">
        {ownerData?.isCurrentUserPartOfOrg ? <Tabs /> : null}
        <ChartSelectors
          params={params}
          updateParams={updateParams}
          active={true}
          sortItem={sortItem}
        />
        <Suspense fallback={<SuspenseFallback />}>
          <Chart params={params} />
        </Suspense>
        <ReposTable
          owner={owner}
          searchValue={params?.search}
          filterValues={params?.repositories}
        />
      </div>
    </div>
  )
}

export default AnalyticsPage
