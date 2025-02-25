import PropTypes from 'prop-types'
import { useState } from 'react'

import {
  TIME_OPTION_VALUES,
  TimeOptions,
} from 'pages/RepoPage/shared/constants'
import { useLocationParams } from 'services/navigation/useLocationParams'
import { useRepoBackfilled, useRepoFlagsSelect } from 'services/repo'
import A from 'ui/A'
import Icon from 'ui/Icon'
import MultiSelect from 'ui/MultiSelect'
import Select from 'ui/Select'

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
    <div className="flex flex-col justify-end gap-4 divide-y divide-solid divide-ds-gray-secondary">
      <div className="grid w-2/3 divide-y divide-solid divide-ds-gray-secondary sm:w-full sm:grid-cols-2 sm:divide-x sm:divide-y-0 md:grid-cols-4">
        <div className="mr-4 flex flex-col justify-between gap-2 p-4 sm:border-l sm:border-ds-gray-secondary sm:py-0 md:border-l-0">
          <h3 className="text-sm font-semibold text-ds-gray-octonary">
            Configured flags
          </h3>
          <p className="flex flex-1 text-xl font-light text-ds-gray-octonary">
            {data?.flagsCount}
          </p>
        </div>
        <div className="flex flex-col justify-between gap-2 p-4 sm:py-0">
          <h3 className="text-sm font-semibold text-ds-gray-octonary">
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
        <div className="flex flex-col justify-between gap-2 border-ds-gray-secondary p-4 sm:py-0">
          <h3 className="text-sm font-semibold text-ds-gray-octonary">
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
        <p className="p-4 text-xs md:py-0">
          Please drop us a comment{' '}
          <A to={{ pageName: 'flagsFeedback' }}>here</A> and let us know what
          you think of our new Flags page.
        </p>
      </div>
      {children}
    </div>
  )
}

Header.propTypes = {
  controlsDisabled: PropTypes.bool,
}

export default Header
