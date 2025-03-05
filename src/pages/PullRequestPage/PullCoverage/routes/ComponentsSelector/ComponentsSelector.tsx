import isUndefined from 'lodash/isUndefined'
import { useMemo, useState } from 'react'

import { useLocationParams } from 'services/navigation/useLocationParams'
import { usePullComponents } from 'services/pull/usePullComponents'
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
    options: {
      suspense: false,
    },
  })

  const components = useMemo(() => {
    return data?.pull?.compareWithBase.__typename === 'Comparison'
      ? data?.pull?.compareWithBase?.componentComparisons
      : []
  }, [data])

  const componentNames = useMemo(() => {
    const names = new Set<string>()
    // @ts-expect-errors, useLocation params needs to be updated to have full types
    params?.components?.forEach((component: string) => names.add(component))
    if (!isUndefined(components)) {
      components?.forEach((component: { name: string }) =>
        names.add(component?.name)
      )
    }
    try {
      const regex = new RegExp(componentSearch, 'i')
      return Array.from(names).filter((name: string) => regex.test(name))
    } catch (_e) {
      return Array.from(names).filter((name: string) =>
        name.toLowerCase().includes(componentSearch.toLowerCase())
      )
    }
  }, [params, componentSearch, components])

  if (!components?.length && !isLoading && !componentSearch) {
    return null
  }

  return (
    <div className="w-full sm:w-60">
      <MultiSelect
        // @ts-expect-error - MultiSelect hasn't been typed yet
        disabled={false}
        dataMarketing="coverage-tab-component-multi-select"
        hook="coverage-tab-component-multi-select"
        ariaName="Select components to show"
        items={[...componentNames]}
        resourceName="component"
        isLoading={isLoading}
        selectedItemsOverride={selectedComponents}
        onChange={(components: string[]) => {
          setSelectedComponents(components)
          updateParams({ components })
        }}
        onSearch={(term: string) => setComponentSearch(term)}
        renderSelected={(selectedItems: string[]) => (
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
