import rocketImg from 'assets/enterprise-rocket.png'
import { LoginProvidersEnum } from 'services/loginProviders'

import { useServiceProviders } from './hooks'
import ProviderCard from './ProviderCard/ProviderCard'

function EnterpriseLandingPage() {
  const { data } = useServiceProviders()

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex justify-center items-center h-96 bg-enterprise-banner-bg relative bg-cover bg-repeat-x bg-center">
          <img className="h-3/4" alt="codecov space shuttle" src={rocketImg} />
        </div>
      </div>
      <div className="flex md:flex-row md:gap-36 gap-8 flex-col text-center justify-center">
        {data?.github && (
          <ProviderCard
            provider={LoginProvidersEnum.GITHUB}
            providers={data?.providerList}
          />
        )}
        {data?.gitlab && (
          <ProviderCard
            provider={LoginProvidersEnum.GITLAB}
            providers={data?.providerList}
          />
        )}
        {data?.bitbucket && (
          <ProviderCard
            provider={LoginProvidersEnum.BITBUCKET}
            providers={data?.providerList}
          />
        )}
      </div>
    </div>
  )
}

export default EnterpriseLandingPage
