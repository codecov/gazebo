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
  // console.log(params)

  function setParams(params) {
    // If param is default, don't push to location.
    const locationParams = omitBy(
      params,
      (value, key) => value === defaultParams[key]
    )
    // locationParams is passed through as next params state.
    push(`${pathname}?${qs.stringify(locationParams)}`, locationParams)
  }

  return { params, setParams }
}
