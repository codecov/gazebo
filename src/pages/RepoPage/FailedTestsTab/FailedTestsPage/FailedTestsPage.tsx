import FailedTestsTable from './FailedTestsTable'
import { MetricsSection } from './MetricsSection'
import { SelectorSection } from './SelectorSection'
import { TableHeader } from './TableHeader'

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
