import omitBy from 'lodash/omitBy'
import qs from 'qs'
import { useHistory, useLocation } from 'react-router-dom'

export function useLocationParams(defaultParams: Record<string, unknown> = {}) {
  const { push } = useHistory()
  const { pathname, search, state } = useLocation()
  const params = state || {
    ...defaultParams,
    ...qs.parse(search, {
      ignoreQueryPrefix: true,
      // qs defaults to arrayLimit: 20, which turns indexed arrays with more
      // than 21 entries (e.g. many selected flags) into plain objects.
      arrayLimit: 1000,
    }),
  }

  function updateWindowLocation(params: Record<string, unknown>) {
    const locationParams = omitBy(
      params,
      (value, key) => value === defaultParams[key]
    )

    push(`${pathname}?${qs.stringify(locationParams)}`, params)
  }

  // Create new state
  function setParams(newParams: Record<string, unknown>) {
    updateWindowLocation(newParams)
  }

  // Retain previous state
  function updateParams(newParams: Record<string, unknown>) {
    updateWindowLocation({
      ...params,
      ...newParams,
    })
  }

  return { params, setParams, updateParams }
}
