import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import { forwardRef, useState } from 'react'
import { useParams } from 'react-router'

import { BranchBundlesNamesQueryOpts } from 'services/bundleAnalysis/BranchBundlesNamesQueryOpts'
import { useLocationParams } from 'services/navigation'
import { useRepoOverview } from 'services/repo'
import MultiSelect from 'ui/MultiSelect'

import {
  BUNDLE_LOAD_TYPE_ITEMS,
  BundleLoadTypes,
  findBundleTypeEnum,
} from '../constants'

interface URLParams {
  provider: string
  owner: string
  repo: string
  branch?: string
  bundle?: string
}

const defaultQueryParams = {
  loading: [],
}

export const LoadSelector = forwardRef((_, ref) => {
  const { params, updateParams } = useLocationParams(defaultQueryParams)
  // @ts-expect-error - useLocationParams needs typing
  const [selectedLoading, setSelectedLoading] = useState(params?.loading ?? [])

  const { provider, owner, repo, branch: branchParam } = useParams<URLParams>()

  const { data: overviewData } = useRepoOverview({
    provider,
    owner,
    repo,
  })

  const branch = branchParam ?? overviewData?.defaultBranch ?? ''

  const { data: bundleData, isFetching: bundlesIsFetching } =
    useSuspenseQueryV5(
      BranchBundlesNamesQueryOpts({
        provider,
        owner,
        repo,
        branch,
      })
    )

  return (
    <div className="md:w-64">
      <h3 className="flex items-center gap-1 text-sm font-semibold text-ds-gray-octonary">
        Show by loading
      </h3>
      <span className="max-w-64 text-sm">
        <MultiSelect
          ref={ref}
          // @ts-ignore
          disabled={bundleData?.bundles?.length === 0 || bundlesIsFetching}
          hook="bundle-loading-selector"
          ariaName="bundle tab loading selector"
          dataMarketing="bundle-loading-selector"
          items={BUNDLE_LOAD_TYPE_ITEMS}
          resourceName="load type"
          selectedItemsOverride={selectedLoading}
          onChange={(loading: BundleLoadTypes[]) => {
            setSelectedLoading(loading)
            updateParams({ loading: loading })
          }}
          renderItem={(item: BundleLoadTypes) => findBundleTypeEnum(item) ?? ''}
        />
      </span>
    </div>
  )
})

LoadSelector.displayName = 'LoadSelector'
