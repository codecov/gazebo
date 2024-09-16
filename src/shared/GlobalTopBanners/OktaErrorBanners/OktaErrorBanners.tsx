import { useLocation, useParams } from 'react-router-dom'

import Icon from 'ui/Icon'
import TopBanner from 'ui/TopBanner'

import { getOktaErrorMessage } from './enums'

interface URLParams {
  owner?: string
}

const OktaErrorBanners = () => {
  const { owner } = useParams<URLParams>()
  const location = useLocation()

  const searchParams = new URLSearchParams(location.search)
  const error = searchParams.get('error')

  if (!owner || !error) return null

  const errorMessage = getOktaErrorMessage(error)

  return (
    <TopBanner variant="error">
      <TopBanner.Start>
        <p className="items-center gap-1 md:flex">
          <span className="flex items-center gap-1 font-semibold">
            <Icon name="exclamationCircle" />
            Okta Authentication Error
          </span>
          {errorMessage}
        </p>
      </TopBanner.Start>
      <TopBanner.End>
        <TopBanner.DismissButton>Dismiss</TopBanner.DismissButton>
      </TopBanner.End>
    </TopBanner>
  )
}

export default OktaErrorBanners
