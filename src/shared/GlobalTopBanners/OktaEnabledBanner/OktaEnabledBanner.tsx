import { useParams } from 'react-router-dom'

import Button from 'ui/Button'
import Icon from 'ui/Icon'
import TopBanner from 'ui/TopBanner'

interface URLParams {
  owner?: string
}

const OktaEnabledBanner = () => {
  const { owner } = useParams<URLParams>()
  if (!owner) return null

  return (
    <TopBanner>
      <TopBanner.Start>
        <p className="items-center gap-1 md:flex">
          <span className="flex items-center gap-1 font-semibold">
            <Icon name="informationCircle" />
            Single sign-on has been enabled for {owner}.
          </span>
          In the future, this will be the only way to access private
          repositories for this organization.
        </p>
      </TopBanner.Start>
      <TopBanner.End>
        <Button
          to={{
            pageName: 'oktaLogin',
          }}
          hook="authenticate-via-okta"
          disabled={false}
          variant="primary"
        >
          Authenticate
        </Button>
      </TopBanner.End>
    </TopBanner>
  )
}

export default OktaEnabledBanner
