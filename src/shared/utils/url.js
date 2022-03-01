import qs from 'qs'
import pick from 'lodash/pick'

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
