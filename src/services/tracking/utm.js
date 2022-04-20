import Cookie from 'js-cookie'
import isEmpty from 'lodash/isEmpty'
import qs from 'qs'

import { forwardMarketingTag } from 'shared/utils/url'

// This hook is to capture utm related tags for the marketing team.
// These are stored in the client's cookies and the api service will
// send these to segment.
export function useUTM() {
  const search = window.location.search
  const utmParams = forwardMarketingTag(search)

  if (!isEmpty(utmParams)) {
    const data = qs.stringify(utmParams, {
      filter: (prefix, value) => value || undefined,
    })
    Cookie.set('utmParams', data, {
      expires: 1,
      domain: window.location.hostname,
    })
  }
}
