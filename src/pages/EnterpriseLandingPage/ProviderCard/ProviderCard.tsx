import qs from 'qs'

import { EnterpriseLoginProviders } from 'services/config/LoginProvidersQueryOpts'
import { useLocationParams } from 'services/navigation/useLocationParams'
import { Theme, useThemeContext } from 'shared/ThemeContext'
import {
  loginProviderImage,
  LoginProvidersEnum,
} from 'shared/utils/loginProviders'
import Button from 'ui/Button'

type LoginProviders = typeof LoginProvidersEnum

type Provider = {
  [K in keyof LoginProviders]: LoginProviders[K]
}[keyof LoginProviders]

interface ProviderCardProps {
  provider: Provider
  providers: Array<EnterpriseLoginProviders>
}

interface ExternalProviderButtonProps {
  provider: Provider
  queryString?: string
}

const ExternalProviderButton: React.FC<ExternalProviderButtonProps> = ({
  provider,
  queryString,
}) => {
  let to = undefined
  if (queryString) {
    to = `${window.location.protocol}//${window.location.host}/${provider.externalKey}${queryString}`
  }

  return (
    <Button
      hook=""
      disabled={false}
      variant={provider.variant}
      to={{
        pageName: 'signIn',
        options: { provider: provider?.externalKey, to },
      }}
    >
      Log in via {provider.name}
    </Button>
  )
}

interface InternalProviderButtonProps {
  provider: Provider
  queryString?: string
}

const InternalProviderButton: React.FC<InternalProviderButtonProps> = ({
  provider,
  queryString,
}) => {
  if (provider.name === LoginProvidersEnum.OKTA.name) {
    return null
  }

  let to = undefined
  if (queryString) {
    to = `${window.location.protocol}//${window.location.host}/${provider.selfHostedKey}${queryString}`
  }

  return (
    <Button
      disabled={false}
      hook=""
      variant={provider?.variant}
      to={{
        pageName: 'signIn',
        options: { provider: provider.selfHostedKey, to },
      }}
    >
      Log in via {provider.selfHostedName}
    </Button>
  )
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, providers }) => {
  const { theme } = useThemeContext()
  const isExternalProvider = providers.includes(provider?.external)

  let isInternalProvider = false
  if (provider.name !== LoginProvidersEnum.OKTA.name) {
    isInternalProvider = providers.includes(provider.selfHosted)
  }

  const isDarkMode = theme === Theme.DARK
  const logo = loginProviderImage(provider.provider, isDarkMode) as
    | string
    | undefined

  const { params } = useLocationParams()
  let queryString = undefined
  // @ts-expect-error useLocationParams needs to be typed
  if (params?.to) {
    queryString = qs.stringify(
      // @ts-expect-error useLocationParams needs to be typed
      { to: params?.to },
      { addQueryPrefix: true }
    )
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex w-64 flex-row items-center justify-center gap-2 pb-2">
        <img alt={`Logo of ${provider.name}`} className="size-6" src={logo} />
        <h2 className="text-2xl">{provider.name}</h2>
      </div>
      <div className="flex w-64 flex-col gap-2">
        {isExternalProvider ? (
          <ExternalProviderButton
            provider={provider}
            queryString={queryString}
          />
        ) : null}
        {isInternalProvider ? (
          <InternalProviderButton
            provider={provider}
            queryString={queryString}
          />
        ) : null}
      </div>
    </div>
  )
}

export default ProviderCard
