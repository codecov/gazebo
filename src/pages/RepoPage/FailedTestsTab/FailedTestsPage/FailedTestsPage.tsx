import { FailedTestsErrorBanner } from './FailedTestsErrorBanner'
import FailedTestsTable from './FailedTestsTable'
import { MetricsSection } from './MetricsSection'
import { SelectorSection } from './SelectorSection'

function FailedTestsPage() {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex gap-2">
        <SelectorSection />
        <FailedTestsErrorBanner />
      </div>
      <MetricsSection />
      <FailedTestsTable />
    </div>
  )
}

export default FailedTestsPage
