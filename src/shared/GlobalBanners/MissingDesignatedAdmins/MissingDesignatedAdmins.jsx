import { useParams } from 'react-router-dom'

import config from 'config'

import { useSelfHostedHasAdmins } from 'services/selfHosted'
import A from 'ui/A'
import Banner from 'ui/Banner'

const useHideBanner = ({ provider, hasAdmins, isFetching, isSelfHosted }) => {
  if (!isSelfHosted || !provider || hasAdmins || isFetching) {
    return true
  }

  return false
}

const MissingDesignatedAdmins = () => {
  const { provider } = useParams()
  const { data: hasAdmins, isFetching } = useSelfHostedHasAdmins(
    { provider },
    { enabled: !!provider && config.IS_SELF_HOSTED }
  )
  // This hook is purely side stepping the complexity rule here.
  const hideBanner = useHideBanner({
    provider,
    hasAdmins,
    isFetching,
    isSelfHosted: config.IS_SELF_HOSTED,
  })

  if (hideBanner) {
    return null
  }

  return (
    <Banner>
      <p className="text-sm font-semibold text-ds-gray-octonary">
        Missing designated admins
      </p>
      <p>
        Your organization does not have designated admins to manage the install.
        To resolve this, please add the admins in the install.yml.{' '}
        <A
          isExternal
          href="https://docs.codecov.com/v5.0/docs/configuration#instance-wide-admins"
          hook="Link to setting up admins in self hosted"
        >
          Learn more
        </A>
      </p>
    </Banner>
  )
}

export default MissingDesignatedAdmins
