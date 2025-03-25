import qs from 'qs'
import { useMemo } from 'react'
import { useLocation } from 'react-router'

type Filters = {
  flags: string[]
  components: string[]
}

export function useTypeSafeFilters(): Filters {
  const location = useLocation()
  const queryParams = qs.parse(location.search, {
    ignoreQueryPrefix: true,
    depth: 1,
  })

  return useMemo(() => {
    const filters: Filters = {
      flags: [],
      components: [],
    }

    if (
      queryParams?.flags &&
      Array.isArray(queryParams.flags) &&
      queryParams.flags.length > 0 &&
      queryParams.flags.every((val) => typeof val == 'string')
    ) {
      filters.flags = queryParams.flags
    }

    if (
      queryParams?.components &&
      Array.isArray(queryParams.components) &&
      queryParams.components.length > 0 &&
      queryParams.components.every((val) => typeof val == 'string')
    ) {
      filters.components = queryParams.components
    }

    return filters
  }, [queryParams])
}
