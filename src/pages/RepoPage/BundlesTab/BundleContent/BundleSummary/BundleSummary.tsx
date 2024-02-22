import { SummaryField, SummaryRoot } from 'ui/Summary'

import BranchSelector from './BranchSelector'

const BundleSummary: React.FC = () => {
  return (
    <div className="flex flex-row gap-8 py-4">
      <div className="flex flex-row gap-4">
        <BranchSelector />
      </div>
      <SummaryRoot>
        <SummaryField>
          <p className="text-sm font-semibold">Total size</p>
        </SummaryField>
        <SummaryField>
          <p className="text-sm font-semibold">gzip size</p>
        </SummaryField>
        <SummaryField>
          <p className="text-sm font-semibold">Download time</p>
        </SummaryField>
        <SummaryField>
          <p className="text-sm font-semibold">Modules</p>
        </SummaryField>
      </SummaryRoot>
    </div>
  )
}

export default BundleSummary
