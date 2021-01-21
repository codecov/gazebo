import mapValues from 'lodash/mapValues'

export const ApiFilterEnum = Object.freeze({ none: 0, true: 1, false: 2 })

function apiFilterType(value) {
  // API only accepts string with capital letter. Kinda annoying.
  if (value === ApiFilterEnum.true) return 'True'
  if (value === ApiFilterEnum.false) return 'False'
  return ''
}

export function getApiFilterEnum(value) {
  // API only accepts string with capital letter. Kinda annoying.
  if (value === 'True') return ApiFilterEnum.true
  if (value === 'False') return ApiFilterEnum.false
  return ApiFilterEnum.none
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
