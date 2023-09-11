import cs from 'classnames'
import eq from 'lodash/eq'
import isUndefined from 'lodash/isUndefined'
import PropTypes from 'prop-types'
import { useState } from 'react'

import { useLocationParams } from 'services/navigation'
import { useRepoBackfilled, useRepoFlagsSelect } from 'services/repo'
import { useFlags } from 'shared/featureFlags'
import Icon from 'ui/Icon'
import MultiSelect from 'ui/MultiSelect'

import CoverageSelect from './CoverageSelect'

export default function Title({ title, children, sticky = false }) {
  return (
    <div
      data-testid="title-wrapper-div"
      className={cs(
        { 'z-10 sticky top-[4.5rem]': sticky },
        'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap bg-white px-3 sm:px-0'
      )}
    >
      {title && (
        <span className="text-base font-semibold text-ds-gray-senary">
          {title}
        </span>
      )}
      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
        {children}
      </div>
    </div>
  )
}

Title.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  Flags: PropTypes.func,
  sticky: PropTypes.bool,
}

export const TitleCoverage = CoverageSelect

const defaultQueryParams = {
  flags: [],
}

export const TitleFlags = () => {
  const { params, updateParams } = useLocationParams(defaultQueryParams)
  const [selectedFlags, setSelectedFlags] = useState(params?.flags)
  const [flagSearch, setFlagSearch] = useState(null)

  const { data: repoBackfilledData } = useRepoBackfilled()

  const isTimeScaleEnabled = !!repoBackfilledData?.isTimeScaleEnabled
  const flagsMeasurementsActive = !!repoBackfilledData?.flagsMeasurementsActive
  const noFlagsPresent = eq(repoBackfilledData?.flagsCount, 0)

  const { coverageTabFlagMultiSelect } = useFlags({
    coverageTabFlagMultiSelect: false,
  })

  const {
    data: flagsData,
    isLoading: flagsIsLoading,
    isInitialLoading: flagsInitialLoading,
    hasNextPage: flagsHasNextPage,
    fetchNextPage: flagsFetchNextPage,
  } = useRepoFlagsSelect({
    filters: { term: flagSearch },
    options: {
      suspense: false,
      enabled:
        !!coverageTabFlagMultiSelect ||
        (flagsMeasurementsActive && !noFlagsPresent && isTimeScaleEnabled),
    },
  })

  const flagNames = new Set()
  if (flagsMeasurementsActive) {
    params?.flags?.forEach((flag) => flagNames.add(flag))

    if (!isUndefined(flagsData)) {
      flagsData?.forEach((flag) => flagNames.add(flag?.name))
    }
  }

  if (!coverageTabFlagMultiSelect || noFlagsPresent) {
    return null
  }

  return (
    <div className="w-full sm:w-52">
      <MultiSelect
        disabled={
          !flagsMeasurementsActive || !isTimeScaleEnabled || flagsInitialLoading
        }
        dataMarketing="fileviwer-filter-by-flags"
        ariaName="Filter by flags"
        items={[...flagNames]}
        resourceName="Flag"
        isLoading={flagsIsLoading}
        selectedItemsOverride={selectedFlags}
        onLoadMore={() => flagsHasNextPage && flagsFetchNextPage()}
        onChange={(flags) => {
          setSelectedFlags(flags)
          updateParams({ flags })
        }}
        onSearch={(term) => setFlagSearch(term)}
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
  )
}

export const TitleHitCount = ({ showHitCount = false }) => {
  if (!showHitCount) {
    return null
  }

  return (
    <div className="flex items-center gap-2 bg-ds-gray-primary px-1 font-mono">
      <span className="flex items-center justify-center justify-items-center rounded-full bg-ds-gray-senary px-1.5 text-center text-white">
        n
      </span>
      <span className="text-xs">upload #</span>
    </div>
  )
}

TitleHitCount.propTypes = {
  showHitCount: PropTypes.bool,
}
