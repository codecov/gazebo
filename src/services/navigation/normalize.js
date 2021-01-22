import mapValues from 'lodash/mapValues'

export const ApiFilterEnum = Object.freeze({
  none: '',
  true: 'True',
  false: 'False',
})

// Help convert useForm data to our API
export function normalizeFormData(data) {
  return mapValues(data, (value) => {
    if (!value) return ''
    return value
  })
}
