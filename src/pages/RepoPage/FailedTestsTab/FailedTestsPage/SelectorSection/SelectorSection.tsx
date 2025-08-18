import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  MEASUREMENT_INTERVAL,
  MeasurementInterval,
  MeasurementTimeOption,
  MeasurementTimeOptions,
} from 'pages/RepoPage/shared/constants'
import { useLocationParams } from 'services/navigation/useLocationParams'
import { useRepoOverview } from 'services/repo'
import A from 'ui/A'
import Icon from 'ui/Icon'
import MultiSelect from 'ui/MultiSelect'
import Select from 'ui/Select'

import BranchSelector from './BranchSelector'

import { TestResultsFilterParameterType } from '../hooks/useInfiniteTestResults/useInfiniteTestResults'
import { useTestResultsFlags } from '../hooks/useTestResultsFlags/useTestResultsFlags'
import { useTestResultsTestSuites } from '../hooks/useTestResultsTestSuites/useTestResultsTestSuites'

interface URLParams {
  provider: string
  owner: string
  repo: string
  branch?: string
}

export const defaultQueryParams = {
  term: '',
  flags: [] as string[],
  historicalTrend: '' as MeasurementInterval,
  parameter: '' as TestResultsFilterParameterType,
  testSuites: [] as string[],
}

const getDecodedBranch = (branch?: string) =>
  branch ? decodeURIComponent(branch) : undefined

function SelectorSection() {
  const { params, updateParams } = useLocationParams(defaultQueryParams)

  // @ts-expect-error need to type out useLocationParams
  const [selectedFlags, setSelectedFlags] = useState(params?.flags)
  const [flagSearch, setFlagSearch] = useState('')

  const [selectedTestSuites, setSelectedTestSuites] = useState(
    // @ts-expect-error need to type out useLocationParams
    params?.testSuites
  )
  const [testSuiteSearch, setTestSuiteSearch] = useState('')

  useEffect(() => {
    // @ts-expect-error need to type out useLocationParams
    if (!params?.flags || params.flags.length === 0) {
      setSelectedFlags([])
    }
    // @ts-expect-error need to type out useLocationParams
    if (!params?.testSuites || params.testSuites.length === 0) {
      setSelectedTestSuites([])
    }
    // @ts-expect-error need to type out useLocationParams
  }, [params?.flags, params?.testSuites])

  const { provider, owner, repo, branch } = useParams<URLParams>()

  const { data: overview } = useRepoOverview({
    provider,
    owner,
    repo,
  })

  const { data: flagResults } = useTestResultsFlags({ term: flagSearch })
  const { data: testSuiteResults } = useTestResultsTestSuites({
    term: testSuiteSearch,
  })

  const decodedBranch = getDecodedBranch(branch)
  const selectedBranch = decodedBranch ?? ''

  const timeValue = MeasurementTimeOptions.find(
    // @ts-expect-error need to type out useLocationParams
    (item) => item.value === params.historicalTrend
  )

  const defaultTimeValue = MeasurementTimeOptions.find(
    (option) => option.value === MEASUREMENT_INTERVAL.INTERVAL_30_DAY
  )

  return (
    <div className="flex flex-1 flex-col gap-2 md:flex-row md:justify-between md:gap-0">
      <BranchSelector />
      {selectedBranch === overview?.defaultBranch || selectedBranch === '' ? (
        <>
          <div className="flex flex-col gap-1 px-4">
            <h3 className="text-sm font-semibold text-ds-gray-octonary">
              Historical trend
            </h3>
            <div className="w-full lg:w-64 xl:w-80">
              <Select
                // @ts-expect-error Select is not typed
                dataMarketing="select-historical-trend"
                disabled={false}
                ariaName="Select historical trend"
                items={MeasurementTimeOptions}
                value={timeValue ?? defaultTimeValue}
                onChange={(historicalTrend: MeasurementTimeOption) =>
                  updateParams({ historicalTrend: historicalTrend.value })
                }
                renderItem={({ label }: { label: string }) => label}
                renderSelected={({ label }: { label: string }) => label}
              />
            </div>
            <A
              to={{ pageName: 'testsAnalyticsDataRetention' }}
              isExternal
              hook="60-day-retention"
            >
              60 day retention
            </A>
          </div>
          <div className="flex flex-col gap-1 px-4 md:py-0">
            <h3 className="text-sm font-semibold text-ds-gray-octonary">
              Test suites
            </h3>
            <div className="w-full lg:w-64 xl:w-80">
              <MultiSelect
                // @ts-expect-error MultiSelect is not typed
                dataMarketing="select-test-suites"
                ariaName="Select Test Suites"
                selectedItemsOverride={selectedTestSuites}
                onChange={(testSuites: string[]) => {
                  setSelectedTestSuites(testSuites)
                  updateParams({ testSuites })
                }}
                onSearch={(term: string) => setTestSuiteSearch(term)}
                items={testSuiteResults?.testSuites ?? []}
                renderSelected={(selectedItems: string[]) => (
                  <span className="flex items-center gap-2">
                    <Icon variant="solid" name="folder" />
                    {selectedItems.length === 0 ? (
                      'All test suites'
                    ) : (
                      <span>{selectedItems.length} selected test suites</span>
                    )}
                  </span>
                )}
                resourceName="Test Suites"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1 px-4 md:pl-4">
            <h3 className="text-sm font-semibold text-ds-gray-octonary">
              Flags
            </h3>
            <div className="w-full lg:w-64 xl:w-80">
              <MultiSelect
                // @ts-expect-error MultiSelect is not typed
                dataMarketing="select-flags"
                ariaName="Select Flags"
                resourceName="Flags"
                selectedItemsOverride={selectedFlags}
                onChange={(flags: string[]) => {
                  setSelectedFlags(flags)
                  updateParams({ flags })
                }}
                onSearch={(term: string) => setFlagSearch(term)}
                items={flagResults?.flags ?? []}
                renderSelected={(selectedItems: string[]) => (
                  <span className="flex items-center gap-2">
                    <Icon variant="solid" name="flag" />
                    {selectedItems.length === 0 ? (
                      'All flags'
                    ) : (
                      <span>{selectedItems.length} selected flags</span>
                    )}
                  </span>
                )}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default SelectorSection
