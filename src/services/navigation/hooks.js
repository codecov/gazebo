import { useLocation, useHistory } from 'react-router-dom'
import qs from 'qs'
import omitBy from 'lodash/omitBy'
import mapValues from 'lodash/mapValues'

export const ApiFilterEnum = Object.freeze({ none: 0, true: 1, false: 2 })

function apiFilterType(value) {
  // API only accepts string with capital letter. Kinda annoying.
  if (value === ApiFilterEnum.none) return ''
  if (value === ApiFilterEnum.true) return 'True'
  if (value === ApiFilterEnum.false) return 'False'
  return ''
}

export function getApiFilterEnum(value) {
  // API only accepts string with capital letter. Kinda annoying.
  if (value === '') return ApiFilterEnum.none
  if (value === 'True') return ApiFilterEnum.true
  if (value === 'False') return ApiFilterEnum.false
  return ''
}

// Help convert useForm data to our API
export function normalizeFormData(data) {
  // Could expand this out in the future to support more types.
  return mapValues(data, (value) => {
    if (!value) return ''
    if (typeof value === 'string') return value
    return apiFilterType(value)
  })
}

export function useLocationParams(defaultParams) {
  const { push } = useHistory()
  const { pathname, state } = useLocation()

  function setParams(params) {
    // If param is default, don't push to location.
    const locationParams = omitBy(
      params,
      (value, key) => value === defaultParams[key]
    )
    // locationParams is passed through as next params state.
    push(`${pathname}?${qs.stringify(locationParams)}`, locationParams)
  }

  return { params: state, setParams }
}
