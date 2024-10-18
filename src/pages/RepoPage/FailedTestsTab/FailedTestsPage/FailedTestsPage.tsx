import { lazy } from 'react'

const FailedTestsTable = lazy(() => import('./FailedTestsTable'))
const MetricsSection = lazy(() =>
  import('./MetricsSection').then((module) => ({
    default: module.MetricsSection,
  }))
)
const SelectorSection = lazy(() =>
  import('./SelectorSection').then((module) => ({
    default: module.SelectorSection,
  }))
)
const TableHeader = lazy(() =>
  import('./TableHeader').then((module) => ({ default: module.TableHeader }))
)

function FailedTestsPage() {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <SelectorSection />
      <MetricsSection />
      <TableHeader />
      <FailedTestsTable />
    </div>
  )
}

export default FailedTestsPage
