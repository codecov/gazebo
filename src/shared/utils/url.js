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
