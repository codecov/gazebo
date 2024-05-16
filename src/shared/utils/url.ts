import isString from 'lodash/isString'
import pick from 'lodash/pick'
import qs from 'qs'

export const formatPathPrefix = (pathname: string) =>
  pathname.charAt(pathname.length - 1) === '/'
    ? pathname.slice(0, pathname.length - 1)
    : pathname

export function forwardMarketingTag(search: string) {
  const queryParams = qs.parse(search, {
    ignoreQueryPrefix: true,
  })
  return pick(queryParams, [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'utm_department',
  ])
}

export function getFilenameFromFilePath(path: string) {
  return path.split('/').pop()
}

export function getFilePathParts(path: string) {
  if (path === '') {
    return []
  }
  return path?.split('/') ?? []
}

export function getFilenameFromPath(path?: string) {
  if (!isString(path)) {
    return null
  }
  return path.split('/').at(-1)
}

export function getFileExtension(fileName: string) {
  if (!fileName?.includes('.')) {
    return null
  }
  return fileName?.split('.')?.at(-1)?.toLowerCase()
}
