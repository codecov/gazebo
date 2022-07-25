import { useServiceProviders } from './hooks'
import BitbucketLoginCard from './ProviderCards/BitbucketLoginCard'
import GitHubLoginCard from './ProviderCards/GitHubLoginCard'
import GitLabLoginCard from './ProviderCards/GitLabLoginCard'

const includeGitHub = (data) =>
  data?.includes('GITHUB') || data?.includes('GITHUB_ENTERPRISE')

const includeGitLab = (data) =>
  data?.includes('GITLAB') || data.includes('GITLAB_ENTERPRISE')

const includeBitbucket = (data) =>
  data?.includes('BITBUCKET') || data?.includes('BITBUCKET_SERVER')

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
          {includeGitHub(data) && <GitHubLoginCard providers={data} />}
          {includeGitLab(data) && <GitLabLoginCard providers={data} />}
          {includeBitbucket(data) && <BitbucketLoginCard providers={data} />}
        </div>
      </div>
    </>
  )
}

export default EnterpriseLandingPage
