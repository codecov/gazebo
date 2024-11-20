import snakeCase from 'lodash/snakeCase'

export function snakeifyKeys(
  obj: Record<string, any> = {}
): Record<string, any> {
  if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [snakeCase(key)]: snakeifyKeys(obj[key]),
      }),
      {}
    )
  }
  return obj
}
