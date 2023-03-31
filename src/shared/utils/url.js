import isEmpty from 'lodash/isEmpty'
import pick from 'lodash/pick'
import qs from 'qs'

export const formatPathPrefix = (pathname) =>
  pathname.charAt(pathname.length - 1) === '/'
    ? pathname.slice(0, pathname.length - 1)
    : pathname

export function forwardMarketingTag(search) {
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

export function getFilenameFromFilePath(path) {
  return path.split('/').pop()
}

export function getFilePathParts(path) {
  return path?.split('/') ?? []
}

export function getFilenameFromTreePaths(treePaths) {
  if (isEmpty(treePaths)) {
    return null
  }
  return treePaths.at(-1).text
}

export function getFileExtension(fileName) {
  if (!fileName?.includes('.')) {
    return null
  }
  return fileName?.split('.')?.at(-1)
}
