import qs from 'qs'
import { useLocation } from 'react-router-dom'

export const usePlanParams = () => {
  const location = useLocation()

  const params = qs.parse(location.search, { ignoreQueryPrefix: true })

  if ('plan' in params && typeof params.plan === 'string') {
    return params.plan
  }

  return null
}
