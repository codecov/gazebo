import { forwardRef, useState } from 'react'
import { useParams } from 'react-router'

import { useBranchBundlesNames } from 'services/bundleAnalysis'
import { useLocationParams } from 'services/navigation'
import { useRepoOverview } from 'services/repo'
import MultiSelect from 'ui/MultiSelect'

import { BundleReportGroups, type BundleReportTypes } from '../constants'

interface URLParams {
  provider: string
  owner: string
  repo: string
  branch?: string
  bundle?: string
}

const defaultQueryParams = {
  types: [],
}

export const TypeSelector = forwardRef((_, ref) => {
  const { params, updateParams } = useLocationParams(defaultQueryParams)
  // @ts-expect-error - useLocationParams needs typing
  const [selectedTypes, setSelectedTypes] = useState(params?.types ?? [])
  const { provider, owner, repo, branch: branchParam } = useParams<URLParams>()

  const { data: overviewData } = useRepoOverview({
    provider,
    owner,
    repo,
  })

  const branch = branchParam ?? overviewData?.defaultBranch ?? ''

  const { data: bundleData, isFetching: bundlesIsFetching } =
    useBranchBundlesNames({
      provider,
      owner,
      repo,
      branch,
    })

  return (
    <div className="md:w-64">
      <h3 className="flex items-center gap-1 text-sm font-semibold text-ds-gray-octonary">
        Show by type
      </h3>
      <span className="max-w-64 text-sm">
        <MultiSelect
          ref={ref}
          // @ts-ignore
          disabled={bundleData?.bundles?.length === 0 || bundlesIsFetching}
          hook="bundle-type-selector"
          ariaName="bundle tab types selector"
          dataMarketing="bundle-type-selector"
          items={Object.keys(BundleReportGroups)}
          resourceName="type"
          selectedItemsOverride={selectedTypes}
          onChange={(types: BundleReportTypes[]) => {
            setSelectedTypes(types)
            updateParams({
              types: types.map((item) => BundleReportGroups[item]),
            })
          }}
        />
      </span>
    </div>
  )
})

TypeSelector.displayName = 'TypeSelector'
