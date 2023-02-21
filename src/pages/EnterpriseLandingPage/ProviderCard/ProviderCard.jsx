import PropTypes from 'prop-types'

import { LoginProvidersEnum } from 'services/loginProviders'
import { providerImage } from 'shared/utils/provider'
import Button from 'ui/Button'

function ProviderCard({ provider, providers }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex w-64 flex-row items-center justify-center gap-1 pb-2">
        <img
          alt={`Logo of ${provider.name}`}
          className="mx-2 h-6 w-6"
          src={providerImage(provider.provider)}
        />
        <h2 className="text-2xl">{provider.name}</h2>
      </div>
      <div className="flex w-64 flex-col gap-2">
        {providers.includes(provider.external) && (
          <Button
            to={{
              pageName: 'signIn',
              options: { provider: provider.externalKey },
            }}
            variant={provider.variant}
          >
            Login via {provider.name}
          </Button>
        )}
        {providers.includes(provider.selfHosted) && (
          <Button
            to={{
              pageName: 'signIn',
              options: { provider: provider.selfHostedKey },
            }}
            variant={provider.variant}
          >
            Login via {provider.selfHostedName}
          </Button>
        )}
      </div>
    </div>
  )
}

ProviderCard.propTypes = {
  provider: PropTypes.oneOf([
    LoginProvidersEnum.BITBUCKET,
    LoginProvidersEnum.GITHUB,
    LoginProvidersEnum.GITLAB,
  ]),
  providers: PropTypes.array,
}

export default ProviderCard
