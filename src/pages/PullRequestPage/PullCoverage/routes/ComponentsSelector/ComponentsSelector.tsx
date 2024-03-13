import isUndefined from 'lodash/isUndefined'
import { useState } from 'react'

import { useLocationParams } from 'services/navigation'
import { usePullComponents } from 'services/pull'
import Icon from 'ui/Icon'
import MultiSelect from 'ui/MultiSelect'

const defaultQueryParams = {
  search: '',
  components: [],
}

function ComponentsSelector() {
  const { params, updateParams } = useLocationParams(defaultQueryParams)
  const [componentSearch, setComponentSearch] = useState('')
  const [selectedComponents, setSelectedComponents] = useState(
    // @ts-expect-errors, useLocation params needs to be updated to have full types
    params?.components
  )
  const { data, isLoading } = usePullComponents({
    filters: {
      components: componentSearch ? [componentSearch] : undefined,
    },
    options: {
      suspense: false,
    },
  })

  const components =
    data?.pull?.compareWithBase.__typename === 'Comparison'
      ? data?.pull?.compareWithBase?.componentComparisons
      : []

  if (!components?.length && !isLoading && !componentSearch) {
    return null
  }

  const componentsNames = new Set()
  // @ts-expect-errors, useLocation params needs to be updated to have full types
  params?.components?.forEach((component: String) =>
    componentsNames.add(component)
  )
  if (!isUndefined(components)) {
    components?.forEach((component: { name: String }) =>
      componentsNames.add(component?.name)
    )
  }

  return (
    <div className="w-full sm:w-60">
      <MultiSelect
        // @ts-expect-error
        disabled={false}
        dataMarketing="coverage-tab-component-multi-select"
        hook="coverage-tab-component-multi-select"
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
