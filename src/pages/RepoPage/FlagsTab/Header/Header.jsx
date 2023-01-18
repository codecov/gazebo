import PropTypes from 'prop-types'
import { useState } from 'react'

import { useLocationParams } from 'services/navigation'
import { useRepoBackfilled, useRepoFlagsSelect } from 'services/repo'
import A from 'ui/A'
import Icon from 'ui/Icon'
import MultiSelect from 'ui/MultiSelect'
import SearchField from 'ui/SearchField'
import Select from 'ui/Select'

import { TIME_OPTION_VALUES, TimeOptions } from '../constants'

const Header = ({ controlsDisabled, children }) => {
  const [selectedFlags, setSelectedFlags] = useState([])
  const [search, setSearch] = useState()

  const { params, updateParams } = useLocationParams({
    search: '',
    historicalTrend: '',
    flags: [],
  })
  const { data } = useRepoBackfilled()
  const {
    data: flagsData,
    isLoading,
    hasNextPage,
    fetchNextPage,
  } = useRepoFlagsSelect({
    filters: { term: search },
    options: { suspense: false },
  })

  const flagNames = flagsData?.map((flag) => flag?.name)

  const value = TimeOptions.find(
    (item) => item.value === params.historicalTrend
  )

  const defaultValue = TimeOptions.find(
    (option) => option.value === TIME_OPTION_VALUES.LAST_3_MONTHS
  )

  return (
    <div className="flex flex-col justify-end divide-y divide-solid divide-ds-gray-secondary">
      <div className="grid md:grid-cols-4 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x mb-4 divide-solid divide-ds-gray-secondary w-2/3 sm:w-full">
        <div className="flex flex-col justify-between gap-2 mr-4 p-4 sm:py-0 sm:border-l md:border-l-0 sm:border-ds-gray-secondary">
          <h3 className="text-sm text-ds-gray-octonary font-semibold">
            Configured flags
          </h3>
          <p className="flex flex-1 text-xl text-ds-gray-octonary font-light">
            {data?.flagsCount}
          </p>
        </div>
        <div className="flex flex-col p-4 justify-between gap-2 sm:py-0">
          <h3 className="text-sm text-ds-gray-octonary font-semibold">
            Historical trend
          </h3>
          <Select
            dataMarketing="select-historical-trend"
            disabled={controlsDisabled}
            ariaName="Select Historical Trend"
            items={TimeOptions}
            value={value ?? defaultValue}
            onChange={(historicalTrend) =>
              updateParams({ historicalTrend: historicalTrend.value })
            }
            renderItem={({ label }) => label}
            renderSelected={({ label }) => label}
          />
        </div>
        <div className="flex flex-col border-ds-gray-secondary p-4 justify-between gap-2 sm:py-0">
          <h3 className="text-sm text-ds-gray-octonary font-semibold">
            Show by
          </h3>
          <MultiSelect
            disabled={controlsDisabled}
            dataMarketing="flags-tab-multi-select"
            hook="flags-tab-multi-select"
            ariaName="Select flags to show"
            items={flagNames}
            selectedItems={selectedFlags}
            resourceName="Flag"
            isLoading={isLoading}
            onLoadMore={() => hasNextPage && fetchNextPage()}
            onChange={(flags) => {
              setSelectedFlags(flags)
              updateParams({ flags })
            }}
            onSearch={(term) => setSearch(term)}
            renderSelected={(selectedItems) => (
              <span className="flex gap-2 items-center">
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
        <p className="text-xs p-4 md:py-0">
          Please drop us a comment{' '}
          <A to={{ pageName: 'flagsFeedback' }}>here</A> and let us know what
          you think of our new Flags page.
        </p>
      </div>
      {children}
      <div className="flex justify-end pt-4">
        <SearchField
          dataMarketing="flags-search"
          disabled={controlsDisabled}
          placeholder={'Search for flags'}
          searchValue={params?.search}
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
