import { useServiceProviders } from './hooks'
import BitbucketLoginCard from './ProviderCards/BitbucketLoginCard'
import GitHubLoginCard from './ProviderCards/GitHubLoginCard'
import GitLabLoginCard from './ProviderCards/GitLabLoginCard'

function EnterpriseLandingPage() {
  const { data } = useServiceProviders()

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="h-96">
          <h2>Banner Image</h2>
        </div>
        <hr />
        <div className="flex md:flex-row md:gap-36 gap-8 flex-col text-center justify-center">
          {data?.github && <GitHubLoginCard github={data?.github} />}
          {data?.gitlab && <GitLabLoginCard gitlab={data?.gitlab} />}
          {data?.bitbucket && (
            <BitbucketLoginCard bitbucket={data?.bitbucket} />
          )}
        </div>
      </div>
    </>
  )
}

export default EnterpriseLandingPage
