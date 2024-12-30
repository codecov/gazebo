import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import { useParams } from 'react-router-dom'

import config from 'config'

import { SelfHostedHasAdminsQueryOpts } from 'services/selfHosted/SelfHostedHasAdminsQueryOpts'
import { Provider } from 'shared/api/helpers'
import A from 'ui/A'
import Banner from 'ui/Banner'

interface MissingDesignatedAdminsProps {
  provider: Provider
}

const MissingDesignatedAdmins: React.FC<MissingDesignatedAdminsProps> = ({
  provider,
}) => {
  const { data: hasAdmins, isFetching } = useSuspenseQueryV5(
    SelfHostedHasAdminsQueryOpts({ provider })
  )

  if (!config.IS_SELF_HOSTED || hasAdmins || isFetching) {
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
        {/* @ts-expect-error - A hasn't been typed yet */}
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

interface URLParams {
  provider?: Provider
}

const MissingDesignatedAdminsWrapper = () => {
  const { provider } = useParams<URLParams>()

  if (provider) {
    return <MissingDesignatedAdmins provider={provider} />
  }

  return null
}

export default MissingDesignatedAdminsWrapper
