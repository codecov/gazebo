import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import NotFound from 'pages/NotFound'
import { useOwner } from 'services/user'
import { useOrgCoverage } from 'services/charts'

import LogoSpinner from 'old_ui/LogoSpinner'

import Header from './Header'
import Tabs from './Tabs'

const Chart = lazy(() => import('./Chart'))

function AnalyticsPage() {
  const { owner, provider } = useParams()
  const { data: ownerData } = useOwner({ username: owner })
  const { data: chartData } = useOrgCoverage({
    provider,
    owner,
    query: { groupingUnit: 'month' },
  })

  if (!ownerData) {
    return <NotFound />
  }

  return (
    <div className="flex flex-col gap-4">
      <Header owner={ownerData} />
      <div>{ownerData?.isCurrentUserPartOfOrg && <Tabs />}</div>
      <Suspense fallback={<LogoSpinner />}>
        <Chart data={chartData?.coverage} />
      </Suspense>
    </div>
  )
}

export default AnalyticsPage
