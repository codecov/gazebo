import isUndefined from 'lodash/isUndefined'
import { useMemo, useState } from 'react'

import { useCommitComponents } from 'services/commit'
import { useLocationParams } from 'services/navigation'
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
  const { data, isLoading } = useCommitComponents({
    options: {
      suspense: false,
    },
  })

  const components = useMemo(() => {
    return data?.components
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
    return Array.from(names).filter((name: string) =>
      name.toLowerCase().includes(componentSearch.toLowerCase())
    )
  }, [params, componentSearch, components])

  if (!components?.length && !isLoading && !componentSearch) {
    return null
  }

  return (
    <MultiSelect
      // @ts-expect-error
      disabled={false}
      dataMarketing="coverage-tab-component-multi-select"
      hook="coverage-tab-component-multi-select"
      ariaName="Select components to show"
      items={[...componentNames]}
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
  )
}

export default ComponentsSelector
