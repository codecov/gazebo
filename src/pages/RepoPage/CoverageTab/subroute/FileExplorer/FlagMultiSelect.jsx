import { isUndefined } from 'lodash'
import PropTypes from 'prop-types'
import { useState } from 'react'

import { useLocationParams } from 'services/navigation'
import { useRepoFlagsSelect } from 'services/repo'
import { useFlags } from 'shared/featureFlags'
import Icon from 'ui/Icon'
import MultiSelect from 'ui/MultiSelect'

const defaultQueryParams = {
  // without this search here, when updating the params it fills it in for some reason :thinking:
  search: '',
  flags: [],
}

function FlagMultiSelect() {
  const { params, updateParams } = useLocationParams(defaultQueryParams)
  const [selectedFlags, setSelectedFlags] = useState(params?.flags)
  const [flagSearch, setFlagSearch] = useState(null)

  const { coverageTabFlagMultiSelect } = useFlags({
    coverageTabFlagMultiSelect: false,
  })

  const {
    data: flagsData,
    isLoading: flagsIsLoading,
    hasNextPage: flagsHasNextPage,
    fetchNextPage: flagsFetchNextPage,
  } = useRepoFlagsSelect({
    filters: { term: flagSearch },
    options: {
      suspense: false,
      enabled: !!coverageTabFlagMultiSelect,
    },
  })

  if (!coverageTabFlagMultiSelect) {
    return null
  }

  const flagNames = new Set(params?.flags)

  if (!isUndefined(flagsData)) {
    flagsData?.forEach((flag) => flagNames.add(flag?.name))
  }

  return (
    <MultiSelect
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
  )
}

FlagMultiSelect.propTypes = {
  params: PropTypes.object,
  updateParams: PropTypes.func,
}

export default FlagMultiSelect
