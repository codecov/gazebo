import { useLocation, useHistory } from 'react-router-dom'
import qs from 'qs'
import omitBy from 'lodash/omitBy'

export function useLocationParams(defaultParams = {}) {
  const { push } = useHistory()
  const { pathname, search, state } = useLocation()
  const params = state || {
    ...defaultParams,
    ...qs.parse(search, {
      ignoreQueryPrefix: true,
    }),
  }

  function updateWindowLocation(params) {
    const locationParams = omitBy(
      params,
      (value, key) => value === defaultParams[key]
    )

    push(`${pathname}?${qs.stringify(locationParams)}`, params)
  }

  // Create new state
  function setParams(newParams) {
    updateWindowLocation(newParams)
  }

  // Retain previous state
  function updateParams(newParams) {
    updateWindowLocation({
      ...params,
      ...newParams,
    })
  }

  return { params, setParams, updateParams }
}
