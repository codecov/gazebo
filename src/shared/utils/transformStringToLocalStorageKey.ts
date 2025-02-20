export function transformStringToLocalStorageKey(str: string) {
  // replace all non-alphanumeric characters with an underscore
  if (typeof str !== 'string') {
    return ''
  }
  return str.replace(/[^a-zA-Z0-9_-]/g, '_')
}
