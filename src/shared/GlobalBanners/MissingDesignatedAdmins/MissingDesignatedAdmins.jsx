import { useParams } from 'react-router-dom'

import config from 'config'

import { useSelfHostedHasAdmins } from 'services/selfHosted'
import A from 'ui/A'
import Banner from 'ui/Banner'

const MissingDesignatedAdmins = () => {
  const { provider } = useParams()
  const { data: hasAdmins } = useSelfHostedHasAdmins(
    { provider },
    { enabled: !!provider && config.IS_SELF_HOSTED }
  )

  if (!config.IS_SELF_HOSTED || hasAdmins) return null

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
