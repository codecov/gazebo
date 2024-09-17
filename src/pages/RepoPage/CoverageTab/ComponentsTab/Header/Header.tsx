import { useState } from 'react'

import {
  TIME_OPTION_VALUES,
  TimeOption,
  TimeOptions,
} from 'pages/RepoPage/shared/constants'
import { useLocationParams } from 'services/navigation'
import { useComponentsBackfilled } from 'services/repo'
import { useRepoComponentsSelect } from 'services/repo/useRepoComponentsSelect'
import A from 'ui/A'
import Icon from 'ui/Icon'
import MultiSelect from 'ui/MultiSelect'
import Select from 'ui/Select'

import BranchSelector from './BranchSelector'

type Component = {
  name: string
  id: string
}

const Header = ({
  controlsDisabled,
  children,
}: {
  controlsDisabled?: boolean
  children?: React.ReactNode
}) => {
  const [search, setSearch] = useState('')

  const { params, updateParams } = useLocationParams({
    historicalTrend: '',
    components: [] as Component[],
  })
  const [selectedComponents, setSelectedComponents] = useState<Component[]>(
    // @ts-expect-error need to type out useLocationParams
    params?.components
  )

  const { data } = useComponentsBackfilled()
  const { data: componentsData, isLoading } = useRepoComponentsSelect({
    termId: search,
    opts: { suspense: false },
  })

  const componentNames = componentsData?.components?.map(
    (component) => component?.id
  )

  const value = TimeOptions.find(
    // @ts-expect-error need to type out useLocationParams
    (item) => item.value === params.historicalTrend
  )

  const defaultValue = TimeOptions.find(
    (option) => option.value === TIME_OPTION_VALUES.LAST_3_MONTHS
  )

  return (
    <div className="flex flex-col justify-end">
      <div className="grid w-2/3 divide-y divide-solid divide-ds-gray-secondary sm:w-full sm:grid-cols-2 sm:divide-x sm:divide-y-0 md:grid-cols-4">
        <BranchSelector isDisabled={controlsDisabled} />
        <div className="flex flex-col justify-between gap-2 p-4 sm:py-0">
          <h3 className="text-sm font-semibold text-ds-gray-octonary">
            Configured components
          </h3>
          <p className="flex flex-1 text-xl font-light text-ds-gray-octonary">
            {data?.coverageAnalytics?.componentsCount}
          </p>
          <p className="text-xs">
            {/* @ts-expect-error */}
            <A to={{ pageName: 'components' }}>Learn more</A>
          </p>
        </div>
        <div className="flex flex-col gap-2 p-4 sm:py-0">
          <h3 className="text-sm font-semibold text-ds-gray-octonary">
            Historical trend
          </h3>
          <Select
            // @ts-expect-error Select is not typed
            dataMarketing="select-historical-trend"
            disabled={controlsDisabled}
            ariaName="Select Historical Trend"
            items={TimeOptions}
            value={value ?? defaultValue}
            onChange={(historicalTrend: TimeOption) =>
              updateParams({ historicalTrend: historicalTrend.value })
            }
            renderItem={({ label }: { label: string }) => label}
            renderSelected={({ label }: { label: string }) => label}
          />
        </div>
        <div className="flex flex-col gap-2 p-4 sm:py-0">
          <h3 className="text-sm font-semibold text-ds-gray-octonary">
            Show by
          </h3>
          <MultiSelect
            // @ts-expect-error something funky with this component
            disabled={controlsDisabled}
            dataMarketing="components-tab-multi-select"
            hook="components-tab-multi-select"
            ariaName="Select components to show"
            items={componentNames}
            selectedItemsOverride={selectedComponents}
            resourceName="Component"
            isLoading={isLoading}
            onChange={(components: Component[]): void => {
              setSelectedComponents(components)
              updateParams({ components })
            }}
            onSearch={(termId: string) => setSearch(termId)}
            renderSelected={(selectedItems: Component[]) => (
              <span className="flex items-center gap-2">
                <Icon variant="solid" name="database" />
                {selectedItems.length === 0 ? (
                  'All Components'
                ) : (
                  <span>{selectedItems.length} selected components</span>
                )}
              </span>
            )}
          />
        </div>
      </div>
      {children}
    </div>
  )
}

export default Header
