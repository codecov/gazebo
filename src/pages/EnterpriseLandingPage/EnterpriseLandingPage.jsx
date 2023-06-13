import rocketImg from 'assets/enterprise-rocket.png'
import { LoginProvidersEnum } from 'services/loginProviders'

import ProviderCard from './ProviderCard/ProviderCard'
import { useEnterpriseRedirect } from './useEnterpriseRedirect'
import { useServiceProviders } from './useServiceProviders'

function EnterpriseLandingPage() {
  const { data } = useServiceProviders()
  useEnterpriseRedirect()

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="relative flex h-96 items-center justify-center bg-enterprise-banner-bg bg-cover bg-center bg-repeat-x">
          <img className="h-3/4" alt="codecov space shuttle" src={rocketImg} />
        </div>
      </div>
      <div className="flex flex-col justify-center gap-8 text-center md:flex-row md:gap-36">
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
