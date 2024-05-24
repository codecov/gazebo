import { forwardRef, useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import { useBranchBundlesNames } from 'services/bundleAnalysis'
import { useNavLinks } from 'services/navigation'
import { useRepoOverview } from 'services/repo'
import FormLabel from 'ui/FormLabel/FormLabel'
import Select from 'ui/Select'

export const BundleSelectorSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-1 md:w-[16rem]">
      <FormLabel label="Bundle" />
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
          onChange={() => {}}
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
  const [filteredBundles, setFilteredBundles] = useState<Array<string>>([])

  return (
    <div className="flex flex-col gap-1 md:w-[16rem]">
      <FormLabel label="Bundle" />
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
          items={search !== '' ? filteredBundles : bundles}
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
})

BundleSelector.displayName = 'BundleSelector'

export default BundleSelector
