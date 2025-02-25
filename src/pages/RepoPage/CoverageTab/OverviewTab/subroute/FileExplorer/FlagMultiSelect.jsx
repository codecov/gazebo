import eq from 'lodash/eq'
import isUndefined from 'lodash/isUndefined'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useLocationParams } from 'services/navigation/useLocationParams'
import {
  useRepoBackfilled,
  useRepoFlagsSelect,
  useRepoSettingsTeam,
} from 'services/repo'
import { useIsTeamPlan } from 'services/useIsTeamPlan'
import Icon from 'ui/Icon'
import MultiSelect from 'ui/MultiSelect'

const defaultQueryParams = {
  // without this search here, when updating the params it fills it in for some reason :thinking:
  search: '',
  flags: [],
}

function FlagMultiSelect() {
  const { provider, owner } = useParams()
  const { params, updateParams } = useLocationParams(defaultQueryParams)
  const [selectedFlags, setSelectedFlags] = useState(params?.flags)
  const [flagSearch, setFlagSearch] = useState(null)

  const { data: isTeamPlan } = useIsTeamPlan({ provider, owner })
  const { data: repoData } = useRepoSettingsTeam()
  const { data: repoBackfilledData } = useRepoBackfilled()

  const isTimescaleEnabled = !!repoBackfilledData?.isTimescaleEnabled
  const flagsMeasurementsActive = !!repoBackfilledData?.flagsMeasurementsActive
  const noFlagsPresent = eq(repoBackfilledData?.flagsCount, 0)

  const hideFlagMultiSelect = isTeamPlan && repoData?.repository?.private

  const {
    data: flagsData,
    isLoading: flagsIsLoading,
    hasNextPage: flagsHasNextPage,
    fetchNextPage: flagsFetchNextPage,
  } = useRepoFlagsSelect({
    filters: { term: flagSearch },
    options: {
      suspense: false,
      enabled:
        hideFlagMultiSelect ||
        (flagsMeasurementsActive && !noFlagsPresent && isTimescaleEnabled),
    },
  })

  if (noFlagsPresent || hideFlagMultiSelect) {
    return null
  }

  const flagNames = new Set()
  if (flagsMeasurementsActive) {
    params?.flags?.forEach((flag) => flagNames.add(flag))

    if (!isUndefined(flagsData)) {
      flagsData?.forEach((flag) => flagNames.add(flag?.name))
    }
  }

  return (
    <div className="w-full sm:w-60">
      <MultiSelect
        disabled={!flagsMeasurementsActive || !isTimescaleEnabled}
        dataMarketing="coverage-tab-flag-multi-select"
        hook="coverage-tab-flag-multi-select"
        ariaName="Select flags to show"
        items={[...flagNames]}
        selectedItemsOverride={selectedFlags}
        resourceName="Flag"
        isLoading={flagsIsLoading}
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

FlagMultiSelect.propTypes = {
  params: PropTypes.object,
  updateParams: PropTypes.func,
}

export default FlagMultiSelect
