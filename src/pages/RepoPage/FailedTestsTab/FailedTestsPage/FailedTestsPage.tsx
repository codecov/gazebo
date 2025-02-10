import { lazy } from 'react'

import FailedTestsTable from './FailedTestsTable'
import { MetricsSection } from './MetricsSection'
import { SelectorSection } from './SelectorSection'

const FailedTestsErrorBanner = lazy(() => import('./FailedTestsErrorBanner'))

function FailedTestsPage() {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <FailedTestsErrorBanner />
      <SelectorSection />
      <MetricsSection />
      <FailedTestsTable />
    </div>
  )
}

export default FailedTestsPage
