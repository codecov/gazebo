import isString from 'lodash/isString'
import { forwardRef, useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import { useBranchBundlesNames } from 'services/bundleAnalysis/useBranchBundlesNames'
import { useNavLinks } from 'services/navigation'
import { useRepoOverview } from 'services/repo'
import Select from 'ui/Select'

interface URLParams {
  provider: string
  owner: string
  repo: string
  branch?: string
  bundle?: string
}

interface BranchSelectorProps {
  resetFilterSelects: () => void
}

// eslint-disable-next-line no-empty-pattern
const BundleSelector = forwardRef<any, BranchSelectorProps>(
  ({ resetFilterSelects }, ref) => {
    const history = useHistory()
    const [search, setSearch] = useState('')
    const { bundles: bundlesLink } = useNavLinks()
    const {
      provider,
      owner,
      repo,
      branch: branchParam,
      bundle,
    } = useParams<URLParams>()

    const [selectedBundle, setSelectedBundle] = useState<string | undefined>(
      bundle ? decodeURIComponent(bundle) : undefined
    )

    const { data: overviewData } = useRepoOverview({
      provider,
      owner,
      repo,
    })

    const branch = branchParam ?? overviewData?.defaultBranch ?? ''

    const {
      data: bundleData,
      isLoading: bundlesIsLoading,
      isFetching: bundlesIsFetching,
    } = useBranchBundlesNames({
      provider,
      owner,
      repo,
      branch,
    })

    // Note: There's no real way to test this as the data is resolved during
    // suspense and the component is not rendered until the data is resolved.
    const bundles = useMemo(
      () => bundleData?.bundles ?? [],
      [bundleData?.bundles]
    )
    const [filteredBundles, setFilteredBundles] = useState<Array<string>>([])

    if (!isString(selectedBundle) && bundles.length > 0 && !bundlesIsFetching) {
      history.push(
        bundlesLink.path({
          branch,
          // @ts-expect-error - useNavLinks needs to be typed
          bundle: encodeURIComponent(bundles[0]),
        })
      )
      setSelectedBundle(bundles[0])
    }

    return (
      <div className="md:w-64">
        <h3 className="flex items-center gap-1 text-sm font-semibold text-ds-gray-octonary">
          Bundle
        </h3>
        <span className="max-w-64 text-sm">
          <Select
            ref={ref}
            // @ts-expect-error
            // using bundles here and not bundlesState because we don't want to disable the select if there aren't any matching bundles in the search
            disabled={bundles.length === 0}
            resourceName="bundle"
            placeholder="Select bundle"
            dataMarketing="bundle-selector-bundle-tab"
            ariaName="bundle tab bundle selector"
            variant="gray"
            isLoading={bundlesIsLoading}
            items={search !== '' ? filteredBundles : bundles}
            value={selectedBundle ?? 'Select bundle'}
            onChange={(name: string) => {
              resetFilterSelects()
              setSelectedBundle(name)
              if (branch && name) {
                history.push(
                  bundlesLink.path({
                    branch,
                    // @ts-expect-error - useNavLinks needs to be typed
                    bundle: encodeURIComponent(name),
                  })
                )
              }
            }}
            onSearch={(term: string) => {
              setSearch(term)
              if (term !== '') {
                setFilteredBundles(
                  bundles.filter((bundle) =>
                    bundle.toLowerCase().includes(term.toLowerCase())
                  )
                )
              } else {
                setFilteredBundles([])
              }
            }}
            searchValue={search}
          />
        </span>
      </div>
    )
  }
)

BundleSelector.displayName = 'BundleSelector'

export default BundleSelector
