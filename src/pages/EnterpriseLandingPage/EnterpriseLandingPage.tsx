import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'

import rocketImg from 'assets/enterprise-rocket.png'
import { LoginProvidersQueryOpts } from 'services/config/LoginProvidersQueryOpts'
import { LoginProvidersEnum } from 'shared/utils/loginProviders'

import ProviderCard from './ProviderCard/ProviderCard'
import { useEnterpriseRedirect } from './useEnterpriseRedirect'

function EnterpriseLandingPage() {
  useEnterpriseRedirect()

  const { data } = useSuspenseQueryV5(LoginProvidersQueryOpts())

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="relative flex h-96 items-center justify-center bg-enterprise-banner-bg bg-cover bg-center bg-repeat-x">
          <img className="h-3/4" alt="codecov space shuttle" src={rocketImg} />
        </div>
      </div>
      <div className="flex flex-col flex-wrap justify-center gap-6 text-center sm:flex-row lg:gap-x-16 ">
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
        {data?.okta && (
          <ProviderCard
            provider={LoginProvidersEnum.OKTA}
            providers={data?.providerList}
          />
        )}
      </div>
    </div>
  )
}

export default EnterpriseLandingPage
