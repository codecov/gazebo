import { forwardRef, useEffect, useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import { useBranchBundlesNames } from 'services/bundleAnalysis'
import { useNavLinks } from 'services/navigation'
import { useRepoOverview } from 'services/repo'
import Select from 'ui/Select'

export const BundleSelectorSkeleton: React.FC = () => {
  return (
    <div className="md:w-[16rem]">
      <h3 className="flex items-center gap-1 text-sm font-semibold text-ds-gray-octonary">
        Bundle
      </h3>
      <span className="max-w-[16rem] text-sm">
        <Select
          // @ts-expect-error
          disabled={true}
          resourceName="bundle"
          placeholder="Select bundle"
          dataMarketing="bundle-selector-bundle-tab"
          ariaName="bundle tab bundle selector"
          variant="gray"
          isLoading={false}
          items={[]}
          value={'Select bundle'}
        />
      </span>
    </div>
  )
}

interface URLParams {
  provider: string
  owner: string
  repo: string
  branch?: string
  bundle?: string
}

// eslint-disable-next-line no-empty-pattern
const BundleSelector = forwardRef(({}, ref) => {
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
    () => {
      if (bundle) {
        return decodeURIComponent(bundle)
      }
      return undefined
    }
  )

  const { data: overviewData } = useRepoOverview({
    provider,
    owner,
    repo,
  })

  const branch = branchParam ?? overviewData?.defaultBranch ?? ''

  const { data: bundleData, isLoading: bundlesIsLoading } =
    useBranchBundlesNames({
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
  const [bundlesState, setBundlesState] = useState(bundles)

  useEffect(() => {
    setBundlesState(bundles)
  }, [bundles, branch])

  return (
    <div className="md:w-[16rem]">
      <h3 className="flex items-center gap-1 text-sm font-semibold text-ds-gray-octonary">
        Bundle
      </h3>
      <span className="max-w-[16rem] text-sm">
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
          items={bundlesState}
          value={selectedBundle ?? 'Select bundle'}
          onChange={(name: string) => {
            setSelectedBundle(name)
            if (branch && name) {
              history.push(
                bundlesLink.path({
                  // @ts-expect-error - useNavLinks needs to be typed
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
              setBundlesState(
                bundles.filter((bundle) =>
                  bundle.toLowerCase().includes(term.toLowerCase())
                )
              )
            } else {
              setBundlesState(bundles)
            }
          }}
          searchValue={search}
        />
      </span>
    </div>
  )
})

BundleSelector.displayName = 'BundleSelector'

export default BundleSelector
