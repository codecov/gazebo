import PropTypes from 'prop-types'

import { useLocationParams } from 'services/navigation'
import { useRepoFlagsSelect } from 'services/repo/useRepoFlagsSelect'
import A from 'ui/A'
import SearchField from 'ui/SearchField'
import Select from 'ui/Select'

import { TimeOptions } from '../constants'

const Header = ({ controlsDisabled, children }) => {
  const { params, updateParams } = useLocationParams({
    search: '',
    historicalTrend: '',
  })
  const { data: flagsData } = useRepoFlagsSelect()

  const value = TimeOptions.find(
    (item) => item.value === params.historicalTrend
  )

  return (
    <div className="flex flex-col justify-end divide-y divide-solid divide-ds-gray-secondary">
      <div className="flex divide-x divide-solid divide-ds-gray-secondary">
        <div className="mr-4 mb-4 px-4 flex flex-col justify-between gap-2">
          <h3 className="text-sm text-ds-gray-octonary font-semibold">
            Configured flags
          </h3>
          <p className="text-xl text-ds-gray-octonary font-light">
            {flagsData.length}
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
            value={value ?? TimeOptions[0]}
            onChange={(historicalTrend) =>
              updateParams({ historicalTrend: historicalTrend.value })
            }
            renderItem={({ label }) => label}
            renderSelected={({ label }) => label}
          />
        </div>
        <p className="w-1/5 text-xs pl-4">
          Please drop us a comment{' '}
          <A to={{ pageName: 'flagsFeedback' }}>here</A> and let us know what
          you think of these new changes.
        </p>
      </div>
      {children}
      <div className="flex justify-end pt-4">
        <SearchField
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
