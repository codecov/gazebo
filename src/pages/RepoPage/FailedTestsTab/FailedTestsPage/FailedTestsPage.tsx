import {
  TIME_OPTION_VALUES,
  TimeOption,
  TimeOptions,
} from 'pages/RepoPage/shared/constants'
import { useLocationParams } from 'services/navigation'
import MultiSelect from 'ui/MultiSelect'
import Select from 'ui/Select'

import BranchSelector from './BranchSelector'
import FailedTestsTable from './FailedTestsTable'
import { MetricsSection } from './MetricsSection'

function FailedTestsPage() {
  const { params, updateParams } = useLocationParams({
    search: '',
    historicalTrend: '',
  })

  const value = TimeOptions.find(
    // @ts-expect-error need to type out useLocationParams
    (item) => item.value === params.historicalTrend
  )

  const defaultValue = TimeOptions.find(
    (option) => option.value === TIME_OPTION_VALUES.LAST_3_MONTHS
  )

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-1 flex-row items-center justify-between">
        <BranchSelector />
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-ds-gray-octonary">
            Historical trend
          </h3>
          <div className="sm:w-52 lg:w-80">
            <Select
              // @ts-expect-error Select is not typed
              dataMarketing="select-historical-trend"
              disabled={false}
              ariaName="Select historical trend"
              items={TimeOptions}
              value={value ?? defaultValue}
              onChange={(historicalTrend: TimeOption) =>
                updateParams({ historicalTrend: historicalTrend.value })
              }
              renderItem={({ label }: { label: string }) => label}
              renderSelected={({ label }: { label: string }) => label}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-ds-gray-octonary">
            Test suites
          </h3>
          <div className="sm:w-52 lg:w-80">
            <MultiSelect
              // @ts-expect-error MultiSelect is not typed
              dataMarketing="select-test-suites"
              ariaName="Select Test Suites"
              value={undefined}
              items={[1, 2, 3, 4]}
              renderItem={(item: any) => item}
              resourceName="Test Suites"
              onChange={() => {}}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-ds-gray-octonary">Flags</h3>
          <div className="sm:w-52 lg:w-80">
            <MultiSelect
              // @ts-expect-error MultiSelect is not typed
              dataMarketing="select-flags"
              ariaName="Select Flags"
              value={undefined}
              items={[1, 2, 3, 4]}
              renderItem={(item: any) => item}
              resourceName="Flags"
              onChange={() => {}}
            />
          </div>
        </div>
      </div>
      <hr />
      <MetricsSection />
      <FailedTestsTable />
    </div>
  )
}

export default FailedTestsPage
