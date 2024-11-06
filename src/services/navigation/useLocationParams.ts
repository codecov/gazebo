import omitBy from 'lodash/omitBy'
import qs from 'qs'
import { useHistory, useLocation } from 'react-router-dom'

export interface UseLocationParamsReturn<T> {
  params: T
  setParams: (params: T) => void
  updateParams: (params: Partial<T>) => void
}

export function useLocationParams<T>(
  defaultParams: T
): UseLocationParamsReturn<T>

export function useLocationParams<
  T = Record<string, unknown>,
>(): UseLocationParamsReturn<T>

export function useLocationParams(
  defaultParams = {} as Record<string, unknown>
): UseLocationParamsReturn<Record<string, unknown>> {
  const { push } = useHistory()
  const { pathname, search, state } = useLocation()
  const params = (state as Record<string, unknown>) || {
    ...defaultParams,
    ...qs.parse(search, {
      ignoreQueryPrefix: true,
    }),
  }

  function updateWindowLocation(newParams: Record<string, unknown>) {
    const locationParams = omitBy(
      newParams,
      (value, key) => value === defaultParams[key]
    )

    push(`${pathname}?${qs.stringify(locationParams)}`, newParams)
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
