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
      <div className="grid md:grid-cols-3 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x mb-4 divide-solid divide-ds-gray-secondary w-2/3 sm:w-full lg:w-2/3">
        <div className="mr-4 flex flex-col justify-between gap-2 p-4 sm:py-0">
          <h3 className="text-sm text-ds-gray-octonary font-semibold">
            Configured flags
          </h3>
          <p className="text-xl text-ds-gray-octonary font-light">
            {flagsData.length}
          </p>
        </div>
        <div className="flex flex-col p-4 justify-between gap-2 min-w-[15rem] sm:py-0">
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
        <p className="text-xs p-4 md:py-0">
          Please drop us a comment{' '}
          <A to={{ pageName: 'flagsFeedback' }}>here</A> and let us know what
          you think of our new Flags page.
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
