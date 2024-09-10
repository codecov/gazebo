import BranchSelector from './BranchSelector'
import FailedTestsTable from './FailedTestsTable'
import { MetricsSection } from './MetricsSection'

function FailedTestsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <BranchSelector />
      <hr />
      <MetricsSection />
      <FailedTestsTable />
    </div>
  )
}

export default FailedTestsPage
