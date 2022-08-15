import PropTypes from 'prop-types'

import { getCurrentProvider } from 'services/loginProviders'
import { providerImage } from 'shared/utils/provider'
import Button from 'ui/Button'

function ProviderCard({ providerKey, providers }) {
  const provider = getCurrentProvider(providerKey)

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col w-64">
        <div className="flex flex-row gap-1 items-center justify-center pb-2 w-64">
          <img
            alt={`Logo of ${provider.name}`}
            className="mx-2 h-6 w-6"
            src={providerImage(provider.provider)}
          />
          <h2 className="text-2xl">{provider.name}</h2>
        </div>
        <div className="flex flex-col gap-2">
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
    </div>
  )
}

ProviderCard.propTypes = {
  providerKey: PropTypes.oneOf(['gh', 'gl', 'bb']),
  providers: PropTypes.array,
}

export default ProviderCard
