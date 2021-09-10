import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import { orderingOptions, nonActiveOrderingOptions } from 'services/repos'
import { useLocationParams } from 'services/navigation'
import ReposTable from 'shared/ListRepo/ReposTable'
import ChartSelectors from './ChartSelectors'
import { useOwner } from 'services/user'
import { useOrgCoverage } from 'services/charts'

import NotFound from 'pages/NotFound'
import LogoSpinner from 'old_ui/LogoSpinner'

import Header from './Header'
import Tabs from './Tabs'

const Chart = lazy(() => import('./Chart'))

const defaultQueryParams = {
  search: '',
  repositories: [],
  ordering: orderingOptions[0]['ordering'],
  direction: orderingOptions[0]['direction'],
  startDate: '',
  endDate: '',
}

function chartQuery({ params }) {
  const groupingUnit = 'day'
  const startDate = params?.startDate ? params?.startDate : undefined
  const endDate = params?.endDate ? params?.endDate : undefined
  const repositories =
    params?.repositories?.length > 0 ? params?.repositories : undefined

  return { groupingUnit, startDate, endDate, repositories }
}

function AnalyticsPage() {
  const { params, updateParams } = useLocationParams(defaultQueryParams)
  const { owner, provider } = useParams()
  const { data: ownerData } = useOwner({ username: owner })

  const { data: chartData } = useOrgCoverage({
    provider,
    owner,
    query: chartQuery({ params }),
  })

  const orderOptions = nonActiveOrderingOptions

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
    <div className="flex flex-col gap-4">
      <Header owner={ownerData} />
      <div>{ownerData?.isCurrentUserPartOfOrg && <Tabs />}</div>
      <ChartSelectors
        params={params}
        updateParams={updateParams}
        owner={owner}
        active={true}
        sortItem={sortItem}
      />
      <Suspense fallback={<LogoSpinner />}>
        <Chart data={chartData?.coverage} />
      </Suspense>
      <ReposTable
        owner={owner}
        active={true}
        sortItem={sortItem}
        searchValue={params?.search}
        filterValues={params?.repositories}
      />
    </div>
  )
}

export default AnalyticsPage
