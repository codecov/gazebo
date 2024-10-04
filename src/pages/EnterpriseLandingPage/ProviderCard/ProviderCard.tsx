import { EnterpriseLoginProviders } from 'services/config/useLoginProviders'
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
}

const ExternalProviderButton: React.FC<ExternalProviderButtonProps> = ({
  provider,
}) => {
  return (
    <Button
      hook=""
      disabled={false}
      variant={provider.variant}
      to={{
        pageName: 'signIn',
        options: { provider: provider?.externalKey },
      }}
    >
      Login via {provider.name}
    </Button>
  )
}

interface InternalProviderButtonProps {
  provider: Provider
}

export const InternalProviderButton: React.FC<InternalProviderButtonProps> = ({
  provider,
}) => {
  if (provider.name === LoginProvidersEnum.OKTA.name) {
    return null
  }

  return (
    <Button
      disabled={false}
      hook=""
      variant={provider?.variant}
      to={{
        pageName: 'signIn',
        options: { provider: provider.selfHostedKey },
      }}
    >
      Login via {provider.selfHostedName}
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

  return (
    <div className="flex flex-col items-center">
      <div className="flex w-64 flex-row items-center justify-center gap-2 pb-2">
        <img alt={`Logo of ${provider.name}`} className="size-6" src={logo} />
        <h2 className="text-2xl">{provider.name}</h2>
      </div>
      <div className="flex w-64 flex-col gap-2">
        {isExternalProvider ? (
          <ExternalProviderButton provider={provider} />
        ) : null}
        {isInternalProvider ? (
          <InternalProviderButton provider={provider} />
        ) : null}
      </div>
    </div>
  )
}

export default ProviderCard
