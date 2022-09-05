import PropTypes from 'prop-types'
import { useState } from 'react'

import { useLocationParams } from 'services/navigation'
import { useRepoFlagsTotalCount } from 'services/repo/useRepoFlags'
import { useRepoFlagsSelect } from 'services/repo/useRepoFlagsSelect'
import Icon from 'ui/Icon'
import MultipleSelect from 'ui/MultipleSelect'
import SearchField from 'ui/SearchField'
import Select from 'ui/Select'

import { TimeOptions } from '../constants'

const Header = ({ controlsDisabled, children }) => {
  const { params, updateParams } = useLocationParams({
    search: '',
    historicalTrend: '',
    selectedFlags: [],
  })

  const { search, selectedFlags } = params
  const [multiSelectSearchTerm, setMultiSelectSearchTerm] = useState('')

  const {
    data: flagsData,
    hasNextPage,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
  } = useRepoFlagsSelect({
    filters: { term: multiSelectSearchTerm },
    suspense: false,
  })

  const { data: totalFlagsCount } = useRepoFlagsTotalCount()

  const historicalTrendValue = TimeOptions.find(
    (item) => item.value === params.historicalTrend
  )

  const handleLoadMoreFlags = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  const handleFlagsChange = (flags) => {
    const selectedFlags = flags.map(({ name }) => name)
    updateParams({ selectedFlags: selectedFlags })
  }

  return (
    <div className="flex flex-col justify-end divide-y divide-solid divide-ds-gray-secondary">
      <div className="flex divide-x divide-solid divide-ds-gray-secondary">
        <div className="mr-4 mb-4 px-4 flex flex-col justify-between gap-2">
          <h3 className="text-sm text-ds-gray-octonary font-semibold">
            Configured flags
          </h3>
          <p className="text-xl text-ds-gray-octonary font-light">
            {totalFlagsCount}
          </p>
        </div>
        <div className="mb-4 px-4 flex flex-col justify-between gap-2 min-w-[15rem]">
          <h3 className="text-sm text-ds-gray-octonary font-semibold">
            Historical trend
          </h3>
          <Select
            disabled={controlsDisabled}
            ariaName="Select Historical Trend"
            items={TimeOptions}
            value={historicalTrendValue ?? TimeOptions[0]}
            onChange={(historicalTrend) =>
              updateParams({ historicalTrend: historicalTrend.value })
            }
            renderItem={({ label }) => label}
            renderSelected={({ label }) => label}
          />
        </div>
        <div className="mb-4 px-4 flex flex-col justify-between gap-2 min-w-[15rem]">
          <h3 className="text-sm text-ds-gray-octonary font-semibold">
            Show by
          </h3>
          <MultipleSelect
            disabled={controlsDisabled}
            items={flagsData ?? []}
            onChange={handleFlagsChange}
            value={selectedFlags?.map((flagName) => ({ name: flagName }))}
            renderItem={({ name }) => name}
            renderSelected={(selectedItems) => (
              <span className="flex gap-2 items-center">
                <Icon variant="solid" name="flag" />
                {selectedItems.length === 0 ? (
                  'All Flags'
                ) : (
                  <span>{selectedItems.length} selected flags</span>
                )}
              </span>
            )}
            resourceName="Flags"
            onLoadMore={handleLoadMoreFlags}
            onSearch={(term) => setMultiSelectSearchTerm(term)}
            isLoading={isLoading || isFetchingNextPage}
            ariaName="Select flags"
          />
        </div>
      </div>
      {children}
      <div className="flex justify-end pt-4">
        <SearchField
          disabled={controlsDisabled}
          placeholder={'Search for flags'}
          searchValue={search}
          setSearchValue={(search) => updateParams({ search })}
        />
      </div>
    </div>
  )
}

Header.propTypes = {
  controlsDisabled: PropTypes.bool,
}

export default Header
