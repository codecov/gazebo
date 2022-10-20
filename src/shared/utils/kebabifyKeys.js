import kebabCase from 'lodash/kebabCase'

export function kebabifyKeys(obj = {}) {
  if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [kebabCase(key)]: kebabifyKeys(obj[key]),
      }),
      {}
    )
  }
  return obj
}
