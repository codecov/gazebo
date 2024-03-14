import { History, Location } from 'history'
import omitBy from 'lodash/omitBy'
import qs from 'qs'
import { useHistory, useLocation } from 'react-router-dom'

interface LocationParams {
  [key: string]: string | number | boolean | []
}

export function useLocationParams(defaultParams: LocationParams = {}) {
  const { push }: { push: History['push'] } = useHistory()
  const { pathname, search, state }: Location<unknown> = useLocation()
  const params = state || {
    ...defaultParams,
    ...qs.parse(search, {
      ignoreQueryPrefix: true,
    }),
  }

  function updateWindowLocation(params: LocationParams) {
    const locationParams = omitBy(
      params,
      (value, key) => value === defaultParams[key]
    )

    push(`${pathname}?${qs.stringify(locationParams)}`, params)
  }

  // Create new state
  function setParams(newParams: LocationParams) {
    updateWindowLocation(newParams)
  }

  // Retain previous state
  function updateParams(newParams: LocationParams) {
    updateWindowLocation({
      ...params,
      ...newParams,
    })
  }

  return { params, setParams, updateParams }
}
