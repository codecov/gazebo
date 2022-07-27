import rocketImg from 'assets/enterprise-rocket.png'

import { useServiceProviders } from './hooks'
import BitbucketLoginCard from './ProviderCards/BitbucketLoginCard'
import GitHubLoginCard from './ProviderCards/GitHubLoginCard'
import GitLabLoginCard from './ProviderCards/GitLabLoginCard'

function EnterpriseLandingPage() {
  const { data } = useServiceProviders()

  return (
    <div className="flex flex-col gap-5">
      <div className="">
        <div className="flex justify-center items-center h-96 bg-enterprise-banner-bg relative bg-cover bg-repeat-x bg-center">
          <img className="h-3/4" alt="codecov space shuttle" src={rocketImg} />
        </div>
      </div>
      <div className="flex md:flex-row md:gap-36 gap-8 flex-col text-center justify-center">
        {data?.github && <GitHubLoginCard providers={data?.providerList} />}
        {data?.gitlab && <GitLabLoginCard providers={data?.providerList} />}
        {data?.bitbucket && (
          <BitbucketLoginCard providers={data?.providerList} />
        )}
      </div>
    </div>
  )
}

export default EnterpriseLandingPage
