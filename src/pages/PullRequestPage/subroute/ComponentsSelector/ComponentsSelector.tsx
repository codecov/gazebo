import isUndefined from 'lodash/isUndefined'
import { useState } from 'react'

import { useLocationParams } from 'services/navigation'
import { usePullComponents } from 'services/pull'
import { useFlags } from 'shared/featureFlags'
import Icon from 'ui/Icon'
import MultiSelect from 'ui/MultiSelect'

const defaultQueryParams = {
  search: '',
  components: [],
}

function ComponentsSelector() {
  const { params, updateParams } = useLocationParams(defaultQueryParams)
  const [componentSearch, setComponentSearch] = useState('')
  // @ts-expect-errors, useLocation params needs to be updated to have full types
  const [selectedComponents, setSelectedComponents] = useState(
    params?.components
  )
  const { componentsSelect: componentsSelectFlag } = useFlags({
    componentsSelect: false,
  })
  const { data, isLoading } = usePullComponents(
    {
      components: componentSearch ? [componentSearch] : undefined,
    },
    {
      suspense: false,
    }
  )

  if ((!data && !isLoading) || !componentsSelectFlag) {
    return null
  }

  const components = data?.pull?.compareWithBase?.componentComparisons

  const componentsNames = new Set()
  // @ts-expect-errors, useLocation params needs to be updated to have full types
  params?.components?.forEach((component) => componentsNames.add(component))
  if (!isUndefined(components)) {
    components?.forEach((component) => componentsNames.add(component?.name))
  }

  return (
    <div className="w-1/6">
      <MultiSelect
        // @ts-expect-error
        disabled={false}
        dataMarketing="coverage-tab-flag-multi-select"
        hook="coverage-tab-flag-multi-select"
        ariaName="Select components to show"
        items={[...componentsNames]}
        resourceName="component"
        isLoading={isLoading}
        selectedItemsOverride={selectedComponents}
        onChange={(components: String[]) => {
          setSelectedComponents(components)
          updateParams({ components })
        }}
        onSearch={(term: string) => setComponentSearch(term)}
        renderSelected={(selectedItems: String[]) => (
          <span className="flex items-center gap-2">
            <Icon variant="solid" name="database" />
            {selectedItems.length === 0 ? (
              'All components'
            ) : (
              <span>{selectedItems.length} selected components</span>
            )}
          </span>
        )}
      />
    </div>
  )
}

export default ComponentsSelector
